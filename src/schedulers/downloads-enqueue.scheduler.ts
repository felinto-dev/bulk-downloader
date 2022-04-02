import { DOWNLOADS_ORCHESTRATING_QUEUE } from '@/consts/queues';
import { DownloadsOrchestratorTasks } from '@/consumers/downloads-orchestrating.consumer';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bull';

@Injectable()
export class DownloadsEnqueueScheduler implements OnModuleInit {
  constructor(
    @Inject(DOWNLOADS_ORCHESTRATING_QUEUE)
    private readonly downloadsOrchestratingQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.runOrchestrator();
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async runOrchestrator() {
    await this.downloadsOrchestratingQueue.add(
      DownloadsOrchestratorTasks.RUN_ORCHESTRATOR,
    );
  }
}
