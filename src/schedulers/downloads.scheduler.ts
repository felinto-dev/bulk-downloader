import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { DownloadsOrquestrator } from '@/orchestrators/downloads.orchestrator';

@Injectable()
export class DownloadsScheduler {
  constructor(private readonly downloadsOrquestrator: DownloadsOrquestrator) {}

  @Cron(CronExpression.EVERY_HOUR)
  async pullDownloadOnHourlyReset() {
    await this.downloadsOrquestrator.pullDownloads();
  }
}
