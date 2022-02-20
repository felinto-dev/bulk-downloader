import { Job, Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  InjectQueue,
  OnQueueCompleted,
  Process,
  Processor,
} from '@nestjs/bull';

import { DOWNLOADS_QUEUE } from '@/consts/queues';
import { DownloadsService } from '@/services/downloads.service';
import { GLOBAL_DOWNLOADS_CONCURRENCY } from '@/consts/app';

@Processor(DOWNLOADS_QUEUE)
export class DownloadsConsumer {
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
    console.log('Pulling jobs to queue from Database...');
    if ((await this.jobsActiveQuotaLeft()) < 1) {
      return;
    }
  }

  @Process({
    concurrency: GLOBAL_DOWNLOADS_CONCURRENCY,
  })
  async doDownload(job: Job) {
    return this.downloadsService.download(
      job.data.url,
      async (downloadProgress) => {
        await job.progress(downloadProgress);
      },
    );
  }

  @OnQueueCompleted()
  async pullNextJob() {
    // TODO: Should pull new jobs to queue respecting the limits for each hoster.
    // If no download requests meet the criteria, do nothing
    console.log('Download finished!');
    console.log('Downloading new item for current hoster...');
  }
}
