import { registerInstrumentation } from '@kit/monitoring';

export async function register() {
  // Register monitoring instrumentation based on the
  // MONITORING_INSTRUMENTATION_PROVIDER environment variable.
  await registerInstrumentation();
}
