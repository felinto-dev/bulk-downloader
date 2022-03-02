import { Job, Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DownloadStatus } from '@prisma/client';

import { GLOBAL_DOWNLOADS_CONCURRENCY } from '@/consts/app';
import { DOWNLOADS_QUEUE } from '@/consts/queues';
import { DownloadJobDto } from '@/dto/download.job.dto';
import { DownloadsRepository } from '@/repositories/downloads.repository';
import { HostersService } from '@/services/hosters.service';
import { replaceNegativeValueWithZero } from '@/utils/math';
import { HostersLimitsService } from '@/services/hosters-limits.service';
import { PendingDownload } from '@/database/interfaces/pending-download';

@Injectable()
export class DownloadsOrquestrator implements OnModuleInit {
  constructor(
    @InjectQueue(DOWNLOADS_QUEUE) private readonly queue: Queue<DownloadJobDto>,
    private readonly downloadsRepository: DownloadsRepository,
    private readonly hostersService: HostersService,
    private readonly hostersLimitsService: HostersLimitsService,
  ) {}

  onModuleInit() {
    this.pullDownloads();
  }

  private readonly logger: Logger = new Logger(DownloadsOrquestrator.name);

  async queueActiveDownloadsQuotaLeft() {
    return GLOBAL_DOWNLOADS_CONCURRENCY - (await this.queue.getActiveCount());
  }

  async pullDownloads() {
    this.logger.verbose(
      `Starting pull downloads at ${new Date().toLocaleTimeString()}`,
    );
    const hoster = await this.hostersService.findHosterReadyToPull();

    if (hoster) {
      hoster.concurrency = Math.min(
        hoster.concurrency,
        await this.queueActiveDownloadsQuotaLeft(),
      );
      await this.pullDownloadsByHosterId(hoster.id, hoster.concurrency);
      return this.pullDownloads();
    }
  }

  async pullDownloadsByHosterId(hosterId: string, concurrency = 1) {
    const downloadsConcurrencyLimit = replaceNegativeValueWithZero(
      Math.min(
        await this.hostersLimitsService.countHosterLimitsQuotaLeft(hosterId),
        concurrency,
      ),
    );

    const pendingDownloads =
      await this.downloadsRepository.getPendingDownloadsByHosterId(
        hosterId,
        downloadsConcurrencyLimit,
      );

    this.logger.verbose(
      `Adding ${downloadsConcurrencyLimit} pending download(s) for hoster id "${hosterId}":`,
    );
    await this.addBulkDownloadsToQueue(pendingDownloads);

    if (pendingDownloads.length === 0) {
      this.logger.verbose(
        `There are no more downloads available for hoster id "${hosterId}", so the spot will be offered to another hoster.`,
      );
      await this.pullDownloads();
    }
  }

  private async addBulkDownloadsToQueue(downloads: PendingDownload[]) {
    if ((await this.queueActiveDownloadsQuotaLeft()) >= downloads.length) {
      this.logger.verbose(JSON.stringify(downloads));
      await this.queue.addBulk(
        downloads.map((download) => ({
          data: {
            url: download.url,
            hosterId: download.hosterId,
            downloadId: download.downloadId,
          },
          opts: { jobId: `${download.hosterId}/${download.downloadId}` },
        })),
      );
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
    await this.pullDownloadsByHosterId(hosterId);
  }
}
