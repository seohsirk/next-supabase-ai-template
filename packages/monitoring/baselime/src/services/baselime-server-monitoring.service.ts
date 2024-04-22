import { MonitoringService } from '../../../src/services/monitoring.service';

export class BaselimeServerMonitoringService implements MonitoringService {
  captureException(error: Error | null) {
    console.error(`Caught exception: ${JSON.stringify(error)}`);
  }

  identifyUser<Info extends { id: string }>(info: Info) {}
}
