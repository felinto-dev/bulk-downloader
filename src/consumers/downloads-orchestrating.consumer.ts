import { DOWNLOADS_ORCHESTRATING_QUEUE } from '@/consts/queues';
import { DownloadsEnqueueOrchestrator } from '@/orchestrators/downloads-enqueue.orchestrator';
import { Process, Processor } from '@nestjs/bull';

@Processor(DOWNLOADS_ORCHESTRATING_QUEUE)
export class DownloadsOrchestratingConsumer {
  constructor(
    private readonly downloadsEnqueueOrchestrator: DownloadsEnqueueOrchestrator,
  ) {}

  @Process({ name: 'orchestrator', concurrency: 1 })
  async orchestrateDownloads() {
    await this.downloadsEnqueueOrchestrator.run();
  }

  // TODO: Clean up stale jobs (e.g. downloads that has the status of 'downloading')

  // TODO: Add a cron job to run the orchestrator every 30 minutes
}
