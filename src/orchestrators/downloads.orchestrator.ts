import { DOWNLOADS_PROCESSING_QUEUE } from '@/consts/queues';
import { PendingDownload } from '@/database/interfaces/pending-download';
import { DownloadJobDto } from '@/dto/download.job.dto';
import { DownloadsRepository } from '@/repositories/downloads.repository';
import { HosterQuotasService } from '@/services/hoster-quotas.service';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DownloadStatus } from '@prisma/client';
import { Job, Queue } from 'bull';
import { ConcurrentHosterDownloadsOrchestrator } from './concurrent-hoster-downloads.orchestrator';

@Injectable()
export class DownloadsOrquestrator implements OnModuleInit {
  constructor(
    @InjectQueue(DOWNLOADS_PROCESSING_QUEUE)
    private readonly downloadsProcessingQueue: Queue<DownloadJobDto>,
    private readonly downloadsRepository: DownloadsRepository,
    private readonly hosterQuotaService: HosterQuotasService,
    private readonly concurrentHosterDownloadsOrchestrator: ConcurrentHosterDownloadsOrchestrator,
  ) {}

  async onModuleInit() {
    if (this.shouldPullDownloads()) {
      await this.getDownloads();
    }
  }

  private readonly logger: Logger = new Logger(DownloadsOrquestrator.name);

  shouldPullDownloads(): boolean {
    const concurrentDownloadsQuotaLeft =
      this.concurrentHosterDownloadsOrchestrator.getQuotaLeft();
    return concurrentDownloadsQuotaLeft > 0;
  }

  async shouldDownload(download: PendingDownload): Promise<boolean> {
    const { hosterId } = download;

    if (await this.hosterQuotaService.hasReachedQuota(hosterId)) {
      this.logger.verbose('Hoster quota reached');
      return false;
    }

    const currentHosterConcurrentDownloads =
      await this.concurrentHosterDownloadsOrchestrator.getHosterConcurrentDownloads(
        hosterId,
      );

    if (
      currentHosterConcurrentDownloads >= download.Hoster.maxConcurrentDownloads
    ) {
      this.logger.verbose('No concurrent downloads quota left');
      return false;
    }

    return true;
  }

  async getDownloads() {
    this.logger.verbose('Pulling downloads...');

    if (!this.shouldPullDownloads()) {
      return;
    }

    let nextDownload = await this.downloadsRepository.findNextDownload();
    if (!nextDownload) {
      this.logger.verbose('No downloads in database for pulling');
      return;
    }

    do {
      if (await this.shouldDownload(nextDownload)) {
        await this.downloadsProcessingQueue.add(nextDownload);
        await this.concurrentHosterDownloadsOrchestrator.decrementQuotaLeft(
          nextDownload.hosterId,
        );
        this.logger.verbose(`Queued download ${nextDownload.downloadId}`);
      }
      nextDownload = await this.downloadsRepository.findNextDownload();
    } while (nextDownload);
  }

  async processDownload(
    job: Job<DownloadJobDto>,
    downloadStatus: DownloadStatus,
  ) {
    const { hosterId, downloadId } = job.data;
    await this.downloadsRepository.changeDownloadStatus(
      downloadId,
      hosterId,
      downloadStatus,
    );
    await this.getDownloads();
  }
}
