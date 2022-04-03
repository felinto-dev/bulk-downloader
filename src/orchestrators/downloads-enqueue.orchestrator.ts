import { DOWNLOADS_PROCESSING_QUEUE } from '@/consts/queues';
import { DownloadJobDto } from '@/dto/download.job.dto';
import { PendingDownloadsIterator } from '@/iterators/pending-download.interator';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class DownloadsEnqueueOrchestrator {
  constructor(
    @InjectQueue(DOWNLOADS_PROCESSING_QUEUE)
    private readonly downloadsProcessingQueue: Queue<DownloadJobDto>,
    private readonly pendingDownloadsIterator: PendingDownloadsIterator,
  ) {}

  private readonly logger: Logger = new Logger(
    DownloadsEnqueueOrchestrator.name,
  );

  async run(): Promise<void> {
    this.logger.log(`${DownloadsEnqueueOrchestrator.name} is running...`);

    while (await this.pendingDownloadsIterator.hasNext()) {
      const nextDownload = await this.pendingDownloadsIterator.next();

      await this.downloadsProcessingQueue.add(nextDownload);
      this.logger.log(
        `Added download ${nextDownload.downloadId} from hoster ${nextDownload.hosterId} to the downloads processing queue`,
      );
    }
  }
}
