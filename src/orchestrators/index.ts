import { ConcurrentHosterDownloadsOrchestrator } from './concurrent-hoster-downloads.orchestrator';
import { DownloadsEnqueueOrchestrator } from './downloads-enqueue.orchestrator';

export const ORCHESTRATORS = [
  DownloadsEnqueueOrchestrator,
  ConcurrentHosterDownloadsOrchestrator,
];
