import { Job, Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { DownloadStatus } from '@prisma/client';

import { GLOBAL_DOWNLOADS_CONCURRENCY } from '@/consts/app';
import { DOWNLOADS_QUEUE } from '@/consts/queues';
import { DownloadJobDto } from '@/interfaces/download.job.dto';
import { DownloadsRepository } from '@/repositories/downloads.repository';
import { HostersService } from '@/services/hosters.service';
import { DownloadsLogger } from '@/logger/downloads.logger';
import { replaceNegativeValuesWithZero } from '@/utils/math';
import { HostersLimitsService } from '@/services/hosters-limits.service';
import { PendingDownload } from '@/interfaces/pending-download';

@Injectable()
export class DownloadsOrquestrator {
  constructor(
    @InjectQueue(DOWNLOADS_QUEUE) private readonly queue: Queue,
    private readonly downloadsRepository: DownloadsRepository,
    private readonly hostersService: HostersService,
    private readonly downloadsLogger: DownloadsLogger,
    private readonly hostersLimitsService: HostersLimitsService,
  ) {}

  async queueActiveDownloadsQuotaLeft() {
    return GLOBAL_DOWNLOADS_CONCURRENCY - (await this.queue.getActiveCount());
  }

  async pullDownloads() {
    const activeJobsCount = await this.queueActiveDownloadsQuotaLeft();

    const hoster = await this.hostersService.findHosterReadyToPull();

    if (hoster && activeJobsCount >= 1) {
      hoster.concurrency = Math.min(activeJobsCount, hoster.concurrency);
      await this.pullDownloadsByHosterId(hoster.id, hoster.concurrency);
      return this.pullDownloads();
    }
  }

  async pullDownloadsByHosterId(hosterId: string, concurrency = 1) {
    const downloadsConcurrencyLimit = replaceNegativeValuesWithZero(
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

    await this.downloadsLogger.pullDownloadsByHoster(
      hosterId,
      downloadsConcurrencyLimit,
      pendingDownloads,
    );

    await this.addPendingDownloadsToQueue(pendingDownloads);

    if (pendingDownloads.length === 0) {
      await this.pullDownloads();
    }
  }

  private async addPendingDownloadsToQueue(
    pendingDownloads: PendingDownload[],
  ) {
    await this.queue.addBulk(
      pendingDownloads.map((download) => ({
        data: {
          url: download.url,
          hosterId: download.hosterId,
          downloadId: download.downloadId,
        },
      })),
    );
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
