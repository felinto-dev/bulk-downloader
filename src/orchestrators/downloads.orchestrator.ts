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

  /*
		Start the orchestrator on bootstrap.
	*/
  async onModuleInit() {
    await this.getDownloads();
  }

  private isRunning = false;

  private readonly logger: Logger = new Logger(DownloadsOrquestrator.name);

  /*
		Check if the orchestrator should pull downloads from the database.
		
		Should check:
		- If the orchestrator is not already running
		- If there are quota left for concurrent downloads
	*/
  shouldPullDownloads(): boolean {
    const concurrentDownloadsQuotaLeft =
      this.concurrentHosterDownloadsOrchestrator.getQuotaLeft();
    return concurrentDownloadsQuotaLeft > 0 && !this.isRunning;
  }

  /*
		Check if the download should be downloaded.

		Should check:
		- If the the hoster has quota left
		- If the hoster can do +1 concurrent download
	*/
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

  /*
		Get all pending downloads from the database and push them to the queue.

		Should check:
		- If the orchestrator is not already running
		- If there are downloads to process
		- If the download can be downloaded
	*/
  async getDownloads() {
    if (!this.shouldPullDownloads()) {
      return;
    }

    this.isRunning = true;

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

    this.isRunning = false;
  }

  /*
		Handle the download job completion.
		
		1. Should update the download status in the database.
		2. Should increment the hoster concurrent downloads.
		3. Should pull the next download from the database and push it to the queue.
	*/
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
    await this.concurrentHosterDownloadsOrchestrator.incrementQuotaLeft(
      hosterId,
    );
    await this.getDownloads();
  }
}
