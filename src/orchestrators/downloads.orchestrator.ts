import { DOWNLOADS_PROCESSING_QUEUE } from '@/consts/queues';
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
    private readonly queue: Queue<DownloadJobDto>,
    private readonly downloadsRepository: DownloadsRepository,
    private readonly hosterQuotaService: HosterQuotasService,
    private readonly concurrentHosterDownloadsOrchestrator: ConcurrentHosterDownloadsOrchestrator,
  ) {}

  onModuleInit() {
    this.pullDownloads();
  }

  private readonly logger: Logger = new Logger(DownloadsOrquestrator.name);

  canPullDownloads() {
    const concurrentDownloadsQuotaLeft =
      this.concurrentHosterDownloadsOrchestrator.getQuotaLeft();
    console.log(concurrentDownloadsQuotaLeft);
    return concurrentDownloadsQuotaLeft > 0;
  }

  /*
   * Pulls the next download from the database and queues it for processing.

		1. Should check if the quota left for the queue is 0. If it is, do not look for downloads in database.
		2. When do not find any downloads in database, abort the function.
		3. Check if the download hoster has reached its quota. If it has, abort the function.
   */
  async pullDownloads() {
    this.logger.verbose('Pulling downloads...');

    if (!this.canPullDownloads()) {
      this.logger.verbose('No active downloads quota left');
      return;
    }

    let nextDownload = await this.downloadsRepository.findNextDownload();
    if (!nextDownload) {
      this.logger.verbose('No downloads in database for pulling');
      return;
    }

    while (this.canPullDownloads() && nextDownload) {
      const { hosterId, downloadId } = nextDownload;
      if (await this.hosterQuotaService.hasReachedQuota(hosterId)) {
        this.logger.verbose('Hoster quota reached');
        nextDownload = await this.downloadsRepository.findNextDownload();
        continue;
      }
      const currentHosterConcurrentDownloads =
        await this.concurrentHosterDownloadsOrchestrator.getHosterConcurrentDownloads(
          hosterId,
        );
      if (
        currentHosterConcurrentDownloads >=
        nextDownload.Hoster.maxConcurrentDownloads
      ) {
        this.logger.verbose('No concurrent downloads quota left');
        nextDownload = await this.downloadsRepository.findNextDownload();
        continue;
      }
      await this.concurrentHosterDownloadsOrchestrator.decrementQuotaLeft(
        hosterId,
      );
      await this.queue.add(nextDownload);
      this.logger.verbose(`Queued download ${downloadId}`);
      nextDownload = await this.downloadsRepository.findNextDownload();
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
