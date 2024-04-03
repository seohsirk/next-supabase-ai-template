/**
 * @name DEFAULT_INSTRUMENTATION_PROVIDER
 * @description Register monitoring instrumentation based on the MONITORING_INSTRUMENTATION_PROVIDER environment variable.
 */
const DEFAULT_INSTRUMENTATION_PROVIDER =
  process.env.MONITORING_INSTRUMENTATION_PROVIDER;

enum InstrumentationProvider {
  Baselime = 'baselime',
  Sentry = 'sentry',
}

/**
 * @name registerInstrumentation
 * @description Register monitoring instrumentation based on the MONITORING_INSTRUMENTATION_PROVIDER environment variable.
 *
 * Please set the MONITORING_INSTRUMENTATION_PROVIDER environment variable to register the monitoring instrumentation provider.
 */
export async function registerInstrumentation() {
  // Only run instrumentation in Node.js environment
  if (
    process.env.NEXT_RUNTIME !== 'nodejs' ||
    !DEFAULT_INSTRUMENTATION_PROVIDER
  ) {
    return;
  }

  switch (DEFAULT_INSTRUMENTATION_PROVIDER) {
    case InstrumentationProvider.Baselime: {
      const { registerBaselimeInstrumentation } = await import('@kit/baselime');

      return registerBaselimeInstrumentation();
    }

    case InstrumentationProvider.Sentry: {
      const { registerSentryInstrumentation } = await import('@kit/sentry');

      return registerSentryInstrumentation();
    }

    default:
      throw new Error(
        `Unknown instrumentation provider: ${DEFAULT_INSTRUMENTATION_PROVIDER}`,
      );
  }
}
