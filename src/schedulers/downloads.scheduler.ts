import { DownloadsOrquestrator } from '@/orchestrators/downloads.orchestrator';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DownloadsScheduler {
  constructor(private readonly downloadsOrquestrator: DownloadsOrquestrator) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async pullDownloadOnHourlyReset() {
    await this.downloadsOrquestrator.pullDownloads();
  }
}
