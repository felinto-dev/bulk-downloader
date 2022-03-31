import { ConcurrentHosterDownloadsOrchestrator } from './concurrent-hoster-downloads.orchestrator';
import { DownloadsOrquestrator } from './downloads.orchestrator';

export const ORCHESTRATORS = [
  DownloadsOrquestrator,
  ConcurrentHosterDownloadsOrchestrator,
];
