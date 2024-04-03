import {
  BaselimeSDK,
  BetterHttpInstrumentation,
  VercelPlugin,
} from '@baselime/node-opentelemetry';

const INSTRUMENTATION_SERVICE_NAME = process.env.INSTRUMENTATION_SERVICE_NAME;

if (!INSTRUMENTATION_SERVICE_NAME) {
  throw new Error(`
    You have set the Baselime instrumentation provider, but have not set the INSTRUMENTATION_SERVICE_NAME environment variable. Please set the INSTRUMENTATION_SERVICE_NAME environment variable.
  `);
}

/**
 * @name registerBaselimeInstrumentation
 * @description This file is used to register Baselime instrumentation for your Next.js application.
 *
 * Please set the MONITORING_INSTRUMENTATION_PROVIDER environment variable to 'baselime' to register Baselime instrumentation.
 */
export function registerBaselimeInstrumentation() {
  const sdk = new BaselimeSDK({
    serverless: true,
    service: INSTRUMENTATION_SERVICE_NAME,
    instrumentations: [
      new BetterHttpInstrumentation({
        plugins: [new VercelPlugin()],
      }),
    ],
  });

  sdk.start();
}
