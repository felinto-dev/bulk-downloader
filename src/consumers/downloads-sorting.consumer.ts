import { DOWNLOADS_SORTING_QUEUE } from '@/consts/queues';
import { ScheduleDownloadInput } from '@/inputs/schedule-download.input';
import { DownloadsService } from '@/services/downloads.service';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor(DOWNLOADS_SORTING_QUEUE)
export class DownloadsSortingConsumer {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Process()
  async onDownloadRequest(job: Job<ScheduleDownloadInput>) {
    await this.downloadsService.upsertDownloadRequest(job.data);
  }
}
