import { MonitoringService } from './monitoring.service';

export class ConsoleMonitoringService implements MonitoringService {
  identifyUser() {
    // noop
  }

  captureException(error: Error) {
    console.error(`Caught exception: ${JSON.stringify(error)}`);
  }
}
