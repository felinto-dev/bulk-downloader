import { Job } from 'bull';
import { Processor } from '@nestjs/bull';

import { DOWNLOADS_REQUESTS_QUEUE } from '@/consts/queues';
import { AddDownloadRequestInput } from '@/inputs/add-download-request.input';
import { DownloadsService } from '@/services/downloads.service';

@Processor(DOWNLOADS_REQUESTS_QUEUE)
export class DownloadsRequestsConsumer {
  constructor(private readonly downloadsService: DownloadsService) {}

  async onDownloadRequest(job: Job<AddDownloadRequestInput>) {
    await this.downloadsService.upsertDownloadRequest(job.data);
  }
}
