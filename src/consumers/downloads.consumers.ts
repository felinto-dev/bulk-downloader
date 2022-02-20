import { Job, Queue } from 'bull';
import {
  InjectQueue,
  OnQueueCompleted,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { DOWNLOADS_QUEUE } from '@/consts/queues';
import { DownloadsService } from '@/services/downloads.service';
import { GLOBAL_DOWNLOADS_CONCURRENCY } from '@/consts/app';

@Processor(DOWNLOADS_QUEUE)
export class DownloadsConsumer {
  private readonly logger = new Logger(DownloadsConsumer.name);

  constructor(
    @InjectQueue(DOWNLOADS_QUEUE)
    private downloadsRequestQueue: Queue,
    private readonly downloadsService: DownloadsService,
  ) {}

  async jobsActiveQuotaLeft() {
    return (
      GLOBAL_DOWNLOADS_CONCURRENCY -
      (await this.downloadsRequestQueue.getActiveCount())
    );
  }

  @Cron(CronExpression.EVERY_HOUR)
  async pullJobs() {
    this.logger.verbose('Pulling jobs to queue from Database...');
    if ((await this.jobsActiveQuotaLeft()) < 1) {
      return;
    }
  }

  @Process({
    concurrency: GLOBAL_DOWNLOADS_CONCURRENCY,
  })
  async doDownload(job: Job) {
    return this.downloadsService.download({
      url: job.data.url,
      onDownloadProgress: (updatedDownloadProgress: number) =>
        job.progress(updatedDownloadProgress),
    });
  }

  @OnQueueCompleted()
  async pullNextJob() {
    // TODO: Should pull new jobs to queue respecting the limits for each hoster.
    // If no download requests meet the criteria, do nothing
    console.log('Download finished!');
    console.log('Downloading new item for current hoster...');
  }
}
