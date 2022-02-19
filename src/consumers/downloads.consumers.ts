import { Job } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OnQueueCompleted, Process, Processor } from '@nestjs/bull';

import { DOWNLOADS_REQUESTS_QUEUE } from '@/consts/queues';

@Processor(DOWNLOADS_REQUESTS_QUEUE)
export class DownloadsRequestConsumer {
  @Cron(CronExpression.EVERY_HOUR)
  async pullJobs() {
    // TODO: Should pull new jobs to queue respecting the concurrency and limits for each hoster.
    // If hoster has pending jobs on queue, do nothing.
    // Must use transactions in db to avoid concurrency issues + Bull.addBulk
    console.log('Pulling jobs to queue from Database...');
  }

  @Process({
    concurrency: 5, // Global application concurrency
  })
  async doDownload(job: Job) {
    console.log(`Downloading item... ${job.data.url}`);
  }

  @OnQueueCompleted()
  async pullNextJob() {
    // TODO: Should pull new jobs to queue respecting the limits for each hoster.
    // If no download requests meet the criteria, do nothing
    console.log('Download finished!');
    console.log('Downloading new item for current hoster...');
  }
}
