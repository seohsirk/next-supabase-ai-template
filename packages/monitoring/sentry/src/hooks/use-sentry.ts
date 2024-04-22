import { useMemo } from 'react';

import { SentryServerMonitoringService } from '../services/sentry-server-monitoring.service';

/**
 * @name useSentry
 * @description Get the Sentry monitoring service. Sentry can be used in the browser and server - so we don't need to differentiate between the two.
 * @returns {SentryServerMonitoringService}
 */
export function useSentry(): SentryServerMonitoringService {
  return useMemo(() => new SentryServerMonitoringService(), []);
}
