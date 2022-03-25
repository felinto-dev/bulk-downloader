import { DownloadsRepository } from './downloads.repository';
import { HosterQuotaRepository } from './hoster-quota.repository';
import { HostersRepository } from './hosters.repository';

export const REPOSITORIES = [
  HostersRepository,
  HosterQuotaRepository,
  DownloadsRepository,
];
