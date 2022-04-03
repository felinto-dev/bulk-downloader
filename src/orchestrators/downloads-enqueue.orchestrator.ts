import { DOWNLOADS_PROCESSING_QUEUE } from '@/consts/queues';
import { PendingDownload } from '@/database/interfaces/pending-download';
import { DownloadJobDto } from '@/dto/download.job.dto';
import { PendingDownloadsIterator } from '@/iterators/pending-download.interator';
import { HosterQuotasService } from '@/services/hoster-quotas.service';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { HosterDownloadsConcurrencyValidator } from '../validators/concurrent-hoster-downloads.validator';

@Injectable()
export class DownloadsEnqueueOrchestrator {
  constructor(
    @InjectQueue(DOWNLOADS_PROCESSING_QUEUE)
    private readonly downloadsProcessingQueue: Queue<DownloadJobDto>,
    private readonly pendingDownloadsIterator: PendingDownloadsIterator,
    private readonly hosterQuotaService: HosterQuotasService,
    private readonly concurrentDownloadsOrchestrator: HosterDownloadsConcurrencyValidator,
  ) {}

  private readonly logger: Logger = new Logger(
    DownloadsEnqueueOrchestrator.name,
  );

  async run(): Promise<void> {
    this.logger.log(`${DownloadsEnqueueOrchestrator.name} is running...`);

    while (await this.pendingDownloadsIterator.hasNext()) {
      const nextDownload = await this.pendingDownloadsIterator.next();

      if (await this.canDownloadNow(nextDownload)) {
        await this.downloadsProcessingQueue.add(nextDownload);
        this.logger.log(
          `Added download ${nextDownload.downloadId} from hoster ${nextDownload.hosterId} to the downloads processing queue`,
        );
      }
    }
  }

  async canDownloadNow(download: PendingDownload): Promise<boolean> {
    const { hosterId } = download;
    const hasHosterReachedQuota = await this.hosterQuotaService.hasReachedQuota(
      hosterId,
    );
    const hasHosterReachedConcurrentDownloadsLimit =
      await this.concurrentDownloadsOrchestrator.hasReachedConcurrentDownloadsLimit(
        hosterId,
      );

    return !(hasHosterReachedQuota || hasHosterReachedConcurrentDownloadsLimit);
  }
}
