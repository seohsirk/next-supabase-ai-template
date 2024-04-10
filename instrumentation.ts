/**
 * This file is used to register monitoring instrumentation
 * for your Next.js application.
 */
export async function register() {
  // only run in nodejs runtime
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { registerMonitoringInstrumentation } = await import(
      '@kit/monitoring'
    );

    // Register monitoring instrumentation based on the
    // MONITORING_INSTRUMENTATION_PROVIDER environment variable.
    return registerMonitoringInstrumentation();
  }
}
