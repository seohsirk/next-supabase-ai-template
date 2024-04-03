import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import {
  SentryPropagator,
  SentrySpanProcessor,
} from '@sentry/opentelemetry-node';

const INSTRUMENTATION_SERVICE_NAME = process.env.INSTRUMENTATION_SERVICE_NAME;

if (!INSTRUMENTATION_SERVICE_NAME) {
  throw new Error(`
    You have set the Sentry instrumentation provider, but have not set the INSTRUMENTATION_SERVICE_NAME environment variable. Please set the INSTRUMENTATION_SERVICE_NAME environment variable.
  `);
}

/**
 * @name registerSentryInstrumentation
 * @description This file is used to register Sentry instrumentation for your Next.js application.
 *
 * Please set the MONITORING_INSTRUMENTATION_PROVIDER environment variable to 'sentry' to register Sentry instrumentation.
 */
export function registerSentryInstrumentation() {
  const sdk = new NodeSDK({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: INSTRUMENTATION_SERVICE_NAME,
    }),
    // @ts-expect-error: an error in the lib
    spanProcessor: new SentrySpanProcessor(),
    textMapPropagator: new SentryPropagator(),
  });

  sdk.start();
}
