import { DOWNLOADS_PROCESSING_QUEUE } from '@/consts/queues';
import { PendingDownload } from '@/database/interfaces/pending-download';
import { DownloadJobDto } from '@/dto/download.job.dto';
import { PendingDownloadsIterator } from '@/iterators/pending-download.interator';
import { HosterQuotasService } from '@/services/hoster-quotas.service';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bull';
import { ConcurrentHosterDownloadsOrchestrator } from './concurrent-hoster-downloads.orchestrator';

@Injectable()
export class DownloadsEnqueueOrchestrator implements OnModuleInit {
  constructor(
    @InjectQueue(DOWNLOADS_PROCESSING_QUEUE)
    private readonly queue: Queue<DownloadJobDto>,
    private readonly pendingDownloadsIterator: PendingDownloadsIterator,
    private readonly hosterQuotaService: HosterQuotasService,
    private readonly concurrentDownloadsOrchestrator: ConcurrentHosterDownloadsOrchestrator,
  ) {}

  async onModuleInit() {
    await this.run();
  }

  private readonly logger: Logger = new Logger(
    DownloadsEnqueueOrchestrator.name,
  );

  async run(): Promise<void> {
    while (await this.pendingDownloadsIterator.hasMore()) {
      const nextDownload = await this.pendingDownloadsIterator.next();

      if (await this.canDownloadNow(nextDownload)) {
        await this.queue.add(nextDownload);
        await this.concurrentDownloadsOrchestrator.decrementQuotaLeft(
          nextDownload.hosterId,
        );
        this.logger.verbose(`Queued download ${nextDownload.downloadId}`);
      }
    }
  }

  async canDownloadNow(download: PendingDownload): Promise<boolean> {
    const {
      hosterId,
      Hoster: { maxConcurrentDownloads },
    } = download;

    const isHosterQuotaReached = await this.hosterQuotaService.hasReachedQuota(
      hosterId,
    );

    const currentConcurrentDownloads =
      await this.concurrentDownloadsOrchestrator.countConcurrentDownloadsByHosterId(
        hosterId,
      );

    const isConcurrentDownloadsLimitReached =
      currentConcurrentDownloads >= maxConcurrentDownloads;

    return !isHosterQuotaReached && !isConcurrentDownloadsLimitReached;
  }
}
