import { InstrumentationProvider } from './monitoring-providers.enum';

/**
 * @name MONITORING_PROVIDER
 * @description Register monitoring instrumentation based on the MONITORING_PROVIDER environment variable.
 */
const MONITORING_PROVIDER = process.env.MONITORING_PROVIDER as
  | InstrumentationProvider
  | undefined;

/**
 * @name captureException
 * @description Capture an exception and send it to the monitoring provider defined.
 * @param error
 */
export async function captureException(error: Error) {
  if (!MONITORING_PROVIDER) {
    console.info(
      `No instrumentation provider specified. Logging to console...`,
    );

    return console.error(`Caught exception: ${JSON.stringify(error)}`);
  }

  switch (MONITORING_PROVIDER) {
    case InstrumentationProvider.Baselime: {
      const { captureException } = await import('@kit/baselime');

      return captureException(error);
    }

    case InstrumentationProvider.Sentry: {
      const { captureException } = await import('@kit/sentry');

      return captureException(error);
    }

    default: {
      throw new Error(
        `Please set the MONITORING_PROVIDER environment variable to register the monitoring instrumentation provider.`,
      );
    }
  }
}
