import { DOWNLOADS_PROCESSING_QUEUE } from '@/consts/queues';
import { PendingDownload } from '@/database/interfaces/pending-download';
import { DownloadJobDto } from '@/dto/download.job.dto';
import { DownloadsService } from '@/services/downloads.service';
import { HosterQuotasService } from '@/services/hoster-quotas.service';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bull';
import { ConcurrentHosterDownloadsOrchestrator } from './concurrent-hoster-downloads.orchestrator';

@Injectable()
export class DownloadsOrquestrator implements OnModuleInit {
  constructor(
    @InjectQueue(DOWNLOADS_PROCESSING_QUEUE)
    private readonly queue: Queue<DownloadJobDto>,
    private readonly downloadsService: DownloadsService,
    private readonly hosterQuotaService: HosterQuotasService,
    private readonly concurrentHosterDownloadsOrchestrator: ConcurrentHosterDownloadsOrchestrator,
  ) {}

  async onModuleInit() {
    await this.run();
  }

  private isOrchestratorRunning = false;

  private readonly logger: Logger = new Logger(DownloadsOrquestrator.name);

  async canStartRunning(): Promise<boolean> {
    return (
      !this.isOrchestratorRunning &&
      this.concurrentHosterDownloadsOrchestrator.hasQuotaLeft() &&
      (await this.queue.getActiveCount()) <=
        this.concurrentHosterDownloadsOrchestrator.countConcurrentDownloads()
    );
  }

  async run(): Promise<void> {
    let nextDownload = await this.downloadsService.findPendingDownload();

    if (nextDownload && this.canStartRunning()) {
      this.isOrchestratorRunning = true;

      do {
        if (await this.canDownloadNow(nextDownload)) {
          await this.queue.add(nextDownload);
          await this.concurrentHosterDownloadsOrchestrator.decrementQuotaLeft(
            nextDownload.hosterId,
          );
          this.logger.verbose(`Queued download ${nextDownload.downloadId}`);
        }

        nextDownload = await this.downloadsService.findPendingDownload();
      } while (nextDownload);

      this.isOrchestratorRunning = false;
    }
  }

  async canDownloadNow(download: PendingDownload): Promise<boolean> {
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
}
