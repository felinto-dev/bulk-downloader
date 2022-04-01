import { DownloadsEnqueueOrchestrator } from '@/orchestrators/downloads-enqueue.orchestrator';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DownloadsEnqueueScheduler {
  constructor(
    private readonly downloadsOrquestrator: DownloadsEnqueueOrchestrator,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async pullDownloads() {
    await this.downloadsOrquestrator.run();
  }
}
