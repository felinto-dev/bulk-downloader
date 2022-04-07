import { DownloadsInProgressRepository } from '@/repositories/downloads-in-progress.repository';
import { DownloadManager } from './download.manager';
import { DownloadsInProgressManager } from './downloads-in-progress.manager';
import { HosterConcurrencyManager } from './hoster-concurrency.manager';

export const MANAGERS = [
  HosterConcurrencyManager,
  DownloadsInProgressManager,
  DownloadsInProgressRepository,
  DownloadManager,
];
