import { DOWNLOADS_ORCHESTRATING_QUEUE } from '@/consts/queues';
import { DownloadsOrchestratorTasks } from '@/consumers/downloads-orchestrating.consumer';
import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bull';

@Injectable()
export class DownloadsEnqueueScheduler {
  constructor(
    @Inject(DOWNLOADS_ORCHESTRATING_QUEUE)
    private readonly downloadsOrchestratingQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async pullDownloads() {
    await this.downloadsOrchestratingQueue.add(
      DownloadsOrchestratorTasks.RUN_ORCHESTRATOR,
    );
  }
}
