import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { DownloadsOrquestrator } from '@/orchestrators/downloads.orchestrator';

@Injectable()
export class DownloadsScheduler implements OnModuleInit {
  constructor(private readonly downloadsOrquestrator: DownloadsOrquestrator) {}

  onModuleInit() {
    this.pullDownloadOnHourlyReset();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async pullDownloadOnHourlyReset() {
    if ((await this.downloadsOrquestrator.queueActiveDownloadsQuotaLeft()) >= 1)
      await this.downloadsOrquestrator.pullDownloads();
  }
}
