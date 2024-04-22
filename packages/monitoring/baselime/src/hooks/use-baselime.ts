import { useBaselimeRum } from '@baselime/react-rum';

import { MonitoringService } from '../../../src/services/monitoring.service';

/**
 * @name useBaselime
 * @description Get the Baselime monitoring service for the browser.
 */
export function useBaselime(): MonitoringService {
  const { captureException, setUser } = useBaselimeRum();

  return {
    captureException(error: Error, extra?: React.ErrorInfo | undefined) {
      void captureException(error, extra);
    },
    identifyUser(params) {
      setUser(params.id);
    },
  } satisfies MonitoringService;
}
