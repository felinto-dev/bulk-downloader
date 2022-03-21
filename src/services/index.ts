import { DownloadsRequestsService } from './downloads-requests.service';
import { HostersLimitsService } from './hosters-limits.service';
import { HostersService } from './hosters.service';

export const SERVICES = [
  HostersService,
  HostersLimitsService,
  DownloadsRequestsService,
];
