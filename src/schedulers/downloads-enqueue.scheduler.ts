import { DownloadsOrchestratorService } from '@/services/downloads-orchestrator.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DownloadsEnqueueScheduler implements OnModuleInit {
  constructor(
    private readonly downloadsOrchestratorService: DownloadsOrchestratorService,
  ) {}

  async onModuleInit() {
    await this.runOrchestrator();
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async runOrchestrator() {
    await this.downloadsOrchestratorService.run();
  }
}
