import { InstrumentationProvider } from './monitoring-providers.enum';

/**
 * @name MONITORING_PROVIDER
 * @description Register monitoring instrumentation based on the MONITORING_PROVIDER environment variable.
 */
const MONITORING_PROVIDER = process.env.MONITORING_PROVIDER as
  | InstrumentationProvider
  | undefined;

/**
 * @name registerMonitoringInstrumentation
 * @description Register monitoring instrumentation based on the MONITORING_PROVIDER environment variable.
 *
 * Please set the MONITORING_PROVIDER environment variable to register the monitoring instrumentation provider.
 */
export async function registerMonitoringInstrumentation() {
  if (!MONITORING_PROVIDER) {
    console.info(`No instrumentation provider specified. Skipping...`);

    return;
  }

  switch (MONITORING_PROVIDER) {
    case InstrumentationProvider.Baselime: {
      const { registerBaselimeInstrumentation } = await import(
        '@kit/baselime/instrumentation'
      );

      return registerBaselimeInstrumentation();
    }

    case InstrumentationProvider.Sentry: {
      const { registerSentryInstrumentation } = await import(
        '@kit/sentry/instrumentation'
      );

      return registerSentryInstrumentation();
    }

    default:
      throw new Error(
        `Unknown instrumentation provider: ${MONITORING_PROVIDER as string}`,
      );
  }
}
