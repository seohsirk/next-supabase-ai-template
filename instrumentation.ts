import { registerInstrumentation } from '@kit/monitoring';

export function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    // Register monitoring instrumentation based on the
    // MONITORING_INSTRUMENTATION_PROVIDER environment variable.
    return registerInstrumentation();
  }
}
