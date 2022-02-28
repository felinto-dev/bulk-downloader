import { Job, Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { DownloadStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { GLOBAL_DOWNLOADS_CONCURRENCY } from '@/consts/app';
import { DOWNLOADS_QUEUE } from '@/consts/queues';
import { DownloadJobDto } from '@/interfaces/download.job.dto';
import { DownloadsRepository } from '@/repositories/downloads.repository';
import { HostersService } from '@/services/hosters.service';
import { DownloadsLogger } from '@/logger/downloads.logger';
import { replaceNegativeValuesWithZero } from '@/utils/math';
import { HostersLimitsService } from '@/services/hosters-limits.service';
import { HostersRepository } from '@/repositories/hosters.repository';
import { releaseAtDateFrame } from '@/consts/release-at-date-frame';

@Injectable()
export class DownloadsOrquestrator {
  constructor(
    @InjectQueue(DOWNLOADS_QUEUE) private readonly queue: Queue,
    private readonly downloadsRepository: DownloadsRepository,
    private readonly hostersService: HostersService,
    private readonly downloadsLogger: DownloadsLogger,
    private readonly hostersRepository: HostersRepository,
    private readonly hostersLimitsService: HostersLimitsService,
  ) {}

  async queueActiveDownloadsQuotaLeft() {
    return GLOBAL_DOWNLOADS_CONCURRENCY - (await this.queue.getActiveCount());
  }

  async pullDownloads() {
    const hoster = await this.hostersService.findHosterReadyToPull();
    const queueActiveDownloadsRemainingQuota =
      await this.queueActiveDownloadsQuotaLeft();
    if (hoster && queueActiveDownloadsRemainingQuota >= 1) {
      await this.pullDownloadsByHoster(
        hoster.id,
        Math.min(queueActiveDownloadsRemainingQuota, hoster.concurrency),
      );
      return this.pullDownloads();
    }
  }

  async pullDownloadsByHoster(hosterId: string, concurrency = 1) {
    const hosterQuotaLeft = replaceNegativeValuesWithZero(
      Math.min(
        await this.hostersLimitsService.countHosterQuotaLeft(hosterId),
        concurrency,
      ),
    );

    const jobs = await this.downloadsRepository.getPendingDownloadsByHosterId(
      hosterId,
      hosterQuotaLeft,
    );

    await this.downloadsLogger.pullDownloadsByHoster(
      hosterId,
      hosterQuotaLeft,
      jobs,
    );

    await this.queue.addBulk(
      jobs.map((job) => ({
        data: {
          url: job.url,
          hosterId: job.hosterId,
          downloadId: job.downloadId,
        },
      })),
    );

    if (jobs.length === 0) {
      return this.pullDownloads();
    }

    // TODO: Avoid magic string
    // ⚠️ The goal is to prevent hoster from getting twice if this function is called concurrently.
    await this.hostersRepository.updateReleaseAt(
      hosterId,
      releaseAtDateFrame['hourly'],
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
    await this.pullDownloadsByHoster(hosterId);
  }
}
