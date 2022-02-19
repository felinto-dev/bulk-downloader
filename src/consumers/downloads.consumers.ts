import { Job } from 'bull';
import { Process, Processor } from '@nestjs/bull';

import { DOWNLOADS_REQUESTS_QUEUE } from '@/consts/queues';

@Processor(DOWNLOADS_REQUESTS_QUEUE)
export class DownloadsRequestConsumer {
  @Process({
    concurrency: 5,
  })
  async doDownload(job: Job) {
    console.log(`Downloading item... ${job.data.url}`);
  }
}
