import { DOWNLOADS_ORCHESTRATING_QUEUE } from '@/consts/queues';
import { DownloadsEnqueueOrchestrator } from '@/orchestrators/downloads-enqueue.orchestrator';
import { DownloadsConcurrencyManager } from '@/validators/concurrent-hoster-downloads.validator';
import { Process, Processor } from '@nestjs/bull';

export enum DownloadsOrchestratorTasks {
  RUN_ORCHESTRATOR = 'run-orchestrator',
  CLEAN_UP_PENDING_DOWNLOADS = 'clean-up-pending-downloads',
}

@Processor(DOWNLOADS_ORCHESTRATING_QUEUE)
export class DownloadsOrchestratingConsumer {
  constructor(
    private readonly downloadsEnqueueOrchestrator: DownloadsEnqueueOrchestrator,
    private readonly concurrentHosterDownloadsOrchestrator: DownloadsConcurrencyManager,
  ) {}

  @Process({
    name: DownloadsOrchestratorTasks.RUN_ORCHESTRATOR,
    concurrency: 1,
  })
  async orchestrateDownloads() {
    if (this.concurrentHosterDownloadsOrchestrator.canOrchestratorRun()) {
      await this.downloadsEnqueueOrchestrator.run();
    }
  }

  // TODO: Clean up stale jobs (e.g. downloads that has the status of 'downloading')

  // TODO: Add a cron job to run the orchestrator every 30 minutes
}
