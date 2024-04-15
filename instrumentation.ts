/**
 * This file is used to register monitoring instrumentation
 * for your Next.js application.
 */

const RUNTIME = process.env.NEXT_RUNTIME;

const ENABLE_INSTRUMENTATION =
  process.env.MONITORING_INSTRUMENTATION_ENABLED === 'true';

export async function register() {
  // only run in nodejs runtime
  if (RUNTIME === 'nodejs' && ENABLE_INSTRUMENTATION) {
    const { registerMonitoringInstrumentation } = await import(
      '@kit/monitoring/instrumentation'
    );

    // Register monitoring instrumentation based on the
    // MONITORING_INSTRUMENTATION_PROVIDER environment variable.
    return registerMonitoringInstrumentation();
  }
}
