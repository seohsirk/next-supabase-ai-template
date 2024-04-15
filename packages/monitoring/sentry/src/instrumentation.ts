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
export async function registerSentryInstrumentation() {
  const { Resource } = await import('@opentelemetry/resources');
  const { NodeSDK } = await import('@opentelemetry/sdk-node');

  const { SEMRESATTRS_SERVICE_NAME } = await import(
    '@opentelemetry/semantic-conventions'
  );

  const { SentrySpanProcessor, SentryPropagator } = await import(
    '@sentry/opentelemetry-node'
  );

  const sdk = new NodeSDK({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: INSTRUMENTATION_SERVICE_NAME,
    }),
    spanProcessor: new SentrySpanProcessor(),
    textMapPropagator: new SentryPropagator(),
  });

  sdk.start();
}
