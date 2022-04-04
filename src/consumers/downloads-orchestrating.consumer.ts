import { DOWNLOADS_ORCHESTRATING_QUEUE } from '@/consts/queues';
import { HosterConcurrencyManager } from '@/managers/hoster-concurrency.manager';
import { DownloadsEnqueueOrchestrator } from '@/orchestrators/downloads-enqueue.orchestrator';
import { OnQueueActive, Process, Processor } from '@nestjs/bull';
import { JobPromise } from 'bull';

export enum DownloadsOrchestratorTasks {
  RUN_ORCHESTRATOR = 'run-orchestrator',
  CLEAN_UP_PENDING_DOWNLOADS = 'clean-up-pending-downloads',
}

@Processor(DOWNLOADS_ORCHESTRATING_QUEUE)
export class DownloadsOrchestratingConsumer {
  constructor(
    private readonly downloadsEnqueueOrchestrator: DownloadsEnqueueOrchestrator,
    private readonly hosterConcurrencyManager: HosterConcurrencyManager,
  ) {}

  @OnQueueActive({ name: DownloadsOrchestratorTasks.RUN_ORCHESTRATOR })
  async canOrchestratorRun(_, jobPromise: JobPromise): Promise<void> {
    const hasReachedMaxConcurrentDownloadsGlobalLimit =
      this.hosterConcurrencyManager.hasReachedMaxConcurrentDownloadsGlobalLimit();

    if (hasReachedMaxConcurrentDownloadsGlobalLimit) {
      jobPromise.cancel();
    }
  }

  @Process({
    name: DownloadsOrchestratorTasks.RUN_ORCHESTRATOR,
    concurrency: 1,
  })
  async runOrchestrator() {
    await this.downloadsEnqueueOrchestrator.run();
  }

  // TODO: Clean up stale jobs (e.g. downloads that has the status of 'downloading')

  // TODO: Add a cron job to run the orchestrator every 30 minutes
}
