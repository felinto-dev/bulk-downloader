import { GLOBAL_DOWNLOADS_CONCURRENCY } from '@/consts/app';
import { DOWNLOADS_PROCESSING_QUEUE } from '@/consts/queues';
import { DownloadJobDto } from '@/dto/download.job.dto';
import { DownloadsRepository } from '@/repositories/downloads.repository';
import { HosterQuotasService } from '@/services/hoster-quotas.service';
import { sumMapValues } from '@/utils/objects';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DownloadStatus } from '@prisma/client';
import { Job, Queue } from 'bull';

@Injectable()
export class DownloadsOrquestrator implements OnModuleInit {
  constructor(
    @InjectQueue(DOWNLOADS_PROCESSING_QUEUE)
    private readonly queue: Queue<DownloadJobDto>,
    private readonly downloadsRepository: DownloadsRepository,
    private readonly hosterQuotaService: HosterQuotasService,
  ) {}

  onModuleInit() {
    this.pullDownloads();
  }

  private readonly logger: Logger = new Logger(DownloadsOrquestrator.name);

  public readonly hosterConcurrentDownloadsCounter: Map<string, number> =
    new Map();

  async queueActiveDownloadsQuotaLeft() {
    const hosterConcurrentDownloadsQuotaLeft = sumMapValues(
      this.hosterConcurrentDownloadsCounter,
    );
    return GLOBAL_DOWNLOADS_CONCURRENCY - hosterConcurrentDownloadsQuotaLeft;
  }

  async pullDownloads() {
    this.logger.verbose('Pulling downloads...');

    const activeDownloadsQuotaLeft = await this.queueActiveDownloadsQuotaLeft();
    if (activeDownloadsQuotaLeft === 0) {
      this.logger.verbose('No active downloads quota left');
      return;
    }

    let nextDownload = await this.downloadsRepository.findNextDownload();

    while (activeDownloadsQuotaLeft > 0 && nextDownload) {
      const hosterQuotaLeft = await this.hosterQuotaService.getQuotaLeft(
        nextDownload.hosterId,
      );

      if (hosterQuotaLeft === 0) {
        this.logger.verbose(
          'No quota left for hosterId: ' + nextDownload.hosterId,
        );
        // should find another download to process and skip this one
        nextDownload = await this.downloadsRepository.findNextDownload();
        continue;
      }

      // if hoster quota left is not 0, then we can process to add this download to the queue
      this.hosterConcurrentDownloadsCounter.set(
        nextDownload.hosterId,
        this.hosterConcurrentDownloadsCounter.get(nextDownload.hosterId) + 1 ||
          1,
      );
      this.logger.verbose(
        `Hoster ${
          nextDownload.hosterId
        } has ${this.hosterConcurrentDownloadsCounter.get(
          nextDownload.hosterId,
        )} active downloads`,
      );
      this.queue.add(nextDownload);
    }

    if (!nextDownload) {
      this.logger.verbose('No downloads to process');
      return;
    }
  }

  async categorizeDownloadAndPullNextDownload(
    job: Job<DownloadJobDto>,
    downloadStatus: DownloadStatus,
  ) {
    const { hosterId, downloadId } = job.data;
    await this.downloadsRepository.changeDownloadStatus(
      downloadId,
      hosterId,
      downloadStatus,
    );
    await this.pullDownloads();
  }
}
