import { HosterDownloadsConcurrencyValidator } from './concurrent-hoster-downloads.validator';
import { DownloadsEnqueueOrchestrator } from './downloads-enqueue.orchestrator';

export const ORCHESTRATORS = [
  DownloadsEnqueueOrchestrator,
  HosterDownloadsConcurrencyValidator,
];
