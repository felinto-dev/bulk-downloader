import { DOWNLOADS_SORTING_QUEUE } from '@/consts/queues';
import { ScheduleDownloadInput } from '@/inputs/schedule-download.input';
import { DownloadsRepository } from '@/repositories/downloads.repository';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { DownloadStatus } from '@prisma/client';
import { Queue } from 'bull';

@Injectable()
export class DownloadsService {
  constructor(
    @InjectQueue(DOWNLOADS_SORTING_QUEUE)
    private readonly queue: Queue<ScheduleDownloadInput>,
    private readonly repository: DownloadsRepository,
  ) {}

  private readonly logger: Logger = new Logger(DownloadsService.name);

  async changeDownloadStatus(
    downloadId: string,
    hosterId: string,
    status: DownloadStatus,
  ) {
    await this.repository.changeDownloadStatus(downloadId, hosterId, status);
  }

  async upsertDownloadRequest(download: ScheduleDownloadInput) {
    this.logger.verbose(
      `New add download request was received:\n${JSON.stringify(download)}`,
    );
    await this.queue.add(download);
  }

  async upsertBulkDownloadRequest(downloadRequests: ScheduleDownloadInput[]) {
    this.logger.verbose(
      `A bulk add download request with ${downloadRequests.length} valid items was received!`,
    );
    await this.queue.addBulk(
      downloadRequests.map((downloadRequest) => ({
        data: downloadRequest,
        opts: {
          jobId: `${downloadRequest.hosterId}/${downloadRequest.downloadId}`,
          removeOnComplete: true,
        },
      })),
    );
  }
}
