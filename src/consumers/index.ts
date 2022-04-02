import { DownloadsOrchestratingConsumer } from './downloads-orchestrating.consumer';
import { DownloadsProcessingConsumer } from './downloads-processing.consumers';
import { DownloadsSortingConsumer } from './downloads-sorting.consumer';

export const CONSUMERS = [
  DownloadsProcessingConsumer,
  DownloadsSortingConsumer,
  DownloadsOrchestratingConsumer,
];
