import { getMonitoringProvider } from '../get-monitoring-provider';
import { InstrumentationProvider } from '../monitoring-providers.enum';
import { ConsoleMonitoringService } from '../services/console-monitoring.service';
import { MonitoringService } from '../services/monitoring.service';

const MONITORING = getMonitoringProvider();

let service: MonitoringService;

/**
 * @name useMonitoring
 * @description Asynchronously load the monitoring service based on the MONITORING_PROVIDER environment variable.
 * Use Suspense to suspend while loading the service.
 */
export function useMonitoring() {
  if (!service) {
    throw withMonitoringService();
  }

  console.log(service);

  return service;
}

async function withMonitoringService() {
  service = await loadMonitoringService();
}

async function loadMonitoringService() {
  if (!MONITORING) {
    return new ConsoleMonitoringService();
  }

  switch (MONITORING) {
    case InstrumentationProvider.Baselime: {
      const { useBaselime } = await import('@kit/baselime/client');

      return useBaselime;
    }

    case InstrumentationProvider.Sentry: {
      const { useSentry } = await import('@kit/sentry/client');

      return useSentry;
    }

    default: {
      throw new Error(`Unknown instrumentation provider: ${MONITORING}`);
    }
  }
}
