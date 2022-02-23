import { Job, Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { DownloadStatus } from '@prisma/client';
import { Injectable, OnModuleInit } from '@nestjs/common';

import { GLOBAL_DOWNLOADS_CONCURRENCY } from '@/consts/app';
import { DOWNLOADS_QUEUE } from '@/consts/queues';
import { DownloadJobDto } from '@/interfaces/download.job.dto';
import { DownloadsRepository } from '@/repositories/downloads.repository';
import { HostersService } from '@/services/hosters.service';
import { DownloadsLogger } from '@/logger/downloads.logger';
import { replaceNegativeValuesWithZero } from '@/utils/math';

@Injectable()
export class DownloadsOrquestrator implements OnModuleInit {
  constructor(
    @InjectQueue(DOWNLOADS_QUEUE) private readonly queue: Queue,
    private readonly downloadsRepository: DownloadsRepository,
    private readonly hostersService: HostersService,
    private readonly downloadsLogger: DownloadsLogger,
  ) {}

  async onModuleInit() {
    await this.pullDownloads();
  }

  async queueActiveDownloadsQuotaLeft() {
    return GLOBAL_DOWNLOADS_CONCURRENCY - (await this.queue.getActiveCount());
  }

  async pullDownloads() {
    const hosters =
      await this.hostersService.findInactiveHostersWithQuotaLeft();

    await this.downloadsLogger.pullDownloadsForAllHosters(hosters);

    for (const hoster of hosters) {
      await this.pullDownloadsByHoster(hoster.id);
    }
  }

  async pullDownloadsByHoster(hosterId: string) {
    const downloadsQuotaLeft = replaceNegativeValuesWithZero(
      Math.min(
        await this.hostersService.countHosterQuotaLeft(hosterId),
        await this.queueActiveDownloadsQuotaLeft(),
      ),
    );

    const jobs = await this.downloadsRepository.getPendingDownloadsByHosterId(
      hosterId,
      downloadsQuotaLeft,
    );

    await this.downloadsLogger.pullDownloadsByHoster(
      hosterId,
      downloadsQuotaLeft,
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
