import { DOWNLOADS_SORTING_QUEUE } from '@/consts/queues';
import { ScheduleDownloadInput } from '@/inputs/schedule-download.input';
import { DownloadsRequestsService } from '@/services/downloads-requests.service';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor(DOWNLOADS_SORTING_QUEUE)
export class DownloadsSortingConsumer {
  constructor(
    private readonly downloadsRequestsService: DownloadsRequestsService,
  ) {}

  @Process()
  async onDownloadRequest(job: Job<ScheduleDownloadInput>) {
    await this.downloadsRequestsService.upsertDownloadRequest(job.data);
  }
}
