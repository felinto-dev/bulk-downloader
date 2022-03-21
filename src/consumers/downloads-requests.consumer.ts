import { DOWNLOADS_REQUESTS_QUEUE } from '@/consts/queues';
import { AddDownloadRequestInput } from '@/inputs/add-download-request.input';
import { DownloadsRequestsService } from '@/services/downloads-requests.service';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor(DOWNLOADS_REQUESTS_QUEUE)
export class DownloadsRequestsConsumer {
  constructor(
    private readonly downloadsRequestsService: DownloadsRequestsService,
  ) {}

  @Process()
  async onDownloadRequest(job: Job<AddDownloadRequestInput>) {
    await this.downloadsRequestsService.upsertDownloadRequest(job.data);
  }
}
