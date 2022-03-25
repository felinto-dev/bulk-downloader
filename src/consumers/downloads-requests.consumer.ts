import { DOWNLOADS_SORTING_QUEUE } from '@/consts/queues';
import { AddDownloadRequestInput } from '@/inputs/add-download-request.input';
import { DownloadsService } from '@/services/downloads.service';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor(DOWNLOADS_SORTING_QUEUE)
export class DownloadsRequestsConsumer {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Process()
  async onDownloadRequest(job: Job<AddDownloadRequestInput>) {
    await this.downloadsService.upsertDownloadRequest(job.data);
  }
}
