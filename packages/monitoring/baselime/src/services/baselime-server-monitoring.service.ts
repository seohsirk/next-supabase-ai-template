import process from 'node:process';
import { z } from 'zod';

import { MonitoringService } from '../../../src/services/monitoring.service';

const apiKey = z
  .string({
    required_error: 'API_KEY is required',
  })
  .parse(process.env.BASELIME_API_KEY);

export class BaselimeServerMonitoringService implements MonitoringService {
  userId: string | null = null;

  async captureException(
    error: Error | null,
    extra?: {
      requestId?: string;
      sessionId?: string;
      namespace?: string;
      service?: string;
    },
  ) {
    const formattedError = error ? getFormattedError(error) : {};

    const event = {
      level: 'error',
      data: { error },
      error: {
        ...formattedError,
      },
      message: error ? `${error.name}: ${error.message}` : `Unknown error`,
    };

    const response = await fetch(`https://events.baselime.io/v1/web`, {
      method: 'POST',
      headers: {
        contentType: 'application/json',
        'x-api-key': apiKey,
        'x-service': extra?.service ?? '',
        'x-namespace': extra?.namespace ?? '',
      },
      body: JSON.stringify([
        {
          userId: this.userId,
          sessionId: extra?.sessionId,
          namespace: extra?.namespace,
          ...event,
        },
      ]),
    });

    if (!response.ok) {
      console.error(
        {
          response,
          event,
        },
        'Failed to send event to Baselime',
      );
    }
  }

  identifyUser<Info extends { id: string }>(info: Info) {
    this.userId = info.id;
  }
}

function getFormattedError(error: Error) {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
}
