import { DownloadsRequestsService } from './downloads-requests.service';
import { DownloadsService } from './downloads.service';
import { HosterQuotasService } from './hoster-quotas.service';
import { HostersService } from './hosters.service';

export const SERVICES = [
  HostersService,
  HosterQuotasService,
  DownloadsService,
  DownloadsRequestsService,
];
