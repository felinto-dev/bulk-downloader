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
import { HostersRepository } from '@/repositories/hosters.repository';

@Processor(DOWNLOADS_QUEUE)
export class DownloadsConsumer {
  constructor(
    @InjectQueue(DOWNLOADS_QUEUE)
    private downloadsRequestQueue: Queue,
    private readonly downloadsService: DownloadsService,
    private readonly hostersRepository: HostersRepository,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async pullJobs() {
    // TODO: Should pull new jobs to queue respecting the concurrency and limits for each hoster.
    // If hoster has pending jobs on queue, do nothing.
    // Must use transactions in db to avoid concurrency issues + Bull.addBulk
    console.log('Pulling jobs to queue from Database...');
    const jobsActiveQuotaLeft =
      GLOBAL_DOWNLOADS_CONCURRENCY -
      (await this.downloadsRequestQueue.getActiveCount());

    if (jobsActiveQuotaLeft >= 1) {
      for (const hoster of await this.hostersRepository.getInactiveHosters()) {
        const isThereCredits = Object.values({ ...hoster.limits }).every(
          (limit: number) => !limit || limit > 0,
        );

        if (isThereCredits && hoster.concurrency >= 1) {
          // Should add jobs to queue here...
        }
      }
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
