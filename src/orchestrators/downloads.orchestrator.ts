import { Job, Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { DownloadStatus } from '@prisma/client';
import { Injectable, Logger } from '@nestjs/common';

import { GLOBAL_DOWNLOADS_CONCURRENCY } from '@/consts/app';
import { DOWNLOADS_QUEUE } from '@/consts/queues';
import { DownloadJobDto } from '@/interfaces/download.job.dto';
import { DownloadsRepository } from '@/repositories/downloads.repository';
import { HostersService } from '@/services/hosters.service';

@Injectable()
export class DownloadsOrquestrator {
  private readonly logger = new Logger(DownloadsOrquestrator.name);

  constructor(
    @InjectQueue(DOWNLOADS_QUEUE) private readonly queue: Queue,
    private readonly downloadsRepository: DownloadsRepository,
    private readonly hostersService: HostersService,
  ) {}

  async queueActiveDownloadsQuotaLeft() {
    return GLOBAL_DOWNLOADS_CONCURRENCY - (await this.queue.getActiveCount());
  }

  async pullDownloads() {
    const hosters =
      await this.hostersService.findInactiveHostersWithQuotaLeft();
    this.logger.log(
      `Pulling downloads from database to queue from ${
        hosters.length
      } hosters: ${hosters.map((hoster) => hoster.id).join(', ')}`,
    );
    for (const hoster of hosters) {
      await this.pullDownloadsByHoster(hoster.id);
    }
  }

  async pullDownloadsByHoster(hosterId: string) {
    const downloadsQuota = Math.min(
      await this.hostersService.countHosterQuotaLeft(hosterId),
      await this.queueActiveDownloadsQuotaLeft(),
    );

    if (downloadsQuota >= 1) {
      const jobs = await this.downloadsRepository.getPendingDownloadsByHosterId(
        hosterId,
        downloadsQuota,
      );
      this.logger.verbose(
        `adding jobs for ${hosterId}... ${JSON.stringify(jobs)}`,
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
    await this.pullDownloadsByHoster(hosterId);
  }
}
