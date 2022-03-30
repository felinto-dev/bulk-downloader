import { MAX_CONCURRENT_DOWNLOADS_ALLOWED } from '@/consts/app';
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
    return (
      MAX_CONCURRENT_DOWNLOADS_ALLOWED - hosterConcurrentDownloadsQuotaLeft
    );
  }

  /*
   * Pulls the next download from the database and queues it for processing.

		1. Should check if the quota left for the queue is 0. If it is, do not look for downloads in database.
		2. While the quota left for the queue is not 0, look for the next download in database.
		2.1. If there is no download in database, do not look for downloads in database.
		2.2. When found a download in database, check if the hoster quota left for download is 0. If it is, do not queue the download and look for the next download in database.

	 * @returns {Promise<void>}
   */
  async pullDownloads() {
    this.logger.verbose('Pulling downloads...');

    const activeDownloadsQuotaLeft = await this.queueActiveDownloadsQuotaLeft();
    if (activeDownloadsQuotaLeft === 0) {
      this.logger.verbose('No active downloads quota left');
      return;
    }

    const nextDownload = await this.downloadsRepository.findNextDownload();
    if (!nextDownload) {
      this.logger.verbose('No next download');
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
