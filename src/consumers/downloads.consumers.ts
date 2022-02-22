import {
  InjectQueue,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { DOWNLOADS_QUEUE } from '@/consts/queues';
import { DownloadsService } from '@/services/downloads.service';
import { GLOBAL_DOWNLOADS_CONCURRENCY } from '@/consts/app';
import { HostersService } from '@/services/hosters.service';
import { DownloadsRepository } from '@/repositories/downloads.repository';
import { DownloadJobDto } from '@/interfaces/download.job.dto';
import { DownloadsRequestsAttemptsRepository } from '@/repositories/downloads-requests-attempts.repository';

@Processor(DOWNLOADS_QUEUE)
export class DownloadsConsumer {
  private readonly logger = new Logger(DownloadsConsumer.name);

  constructor(
    @InjectQueue(DOWNLOADS_QUEUE) private readonly queue: Queue,
    private readonly downloadsService: DownloadsService,
    private readonly hostersService: HostersService,
    private readonly downloadsRepository: DownloadsRepository,
    private readonly downloadsRequestsAttemptsRepository: DownloadsRequestsAttemptsRepository,
  ) {}

  private async jobsActiveQuotaLeft() {
    return GLOBAL_DOWNLOADS_CONCURRENCY - (await this.queue.getActiveCount());
  }

  @Cron(CronExpression.EVERY_HOUR)
  async pullJobs() {
    this.logger.verbose('Pulling jobs to queue from Database...');
    if ((await this.jobsActiveQuotaLeft()) >= 1) {
      for (const hoster of await this.hostersService.getInactiveHostersWithQuotaLeft()) {
        await this.addHosterDownloadsRequestsToQueue(
          hoster.id,
          hoster.quotaLeft,
        );
      }
    }
  }

  private async addHosterDownloadsRequestsToQueue(
    hosterId: string,
    quotaLeft: number,
  ) {
    const hosterQuota = Math.min(quotaLeft, await this.jobsActiveQuotaLeft());

    if (hosterQuota >= 1) {
      const jobs = await this.downloadsRepository.getPendingDownloadsByHosterId(
        hosterId,
        hosterQuota,
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

  @Process({ concurrency: GLOBAL_DOWNLOADS_CONCURRENCY })
  async doDownload(job: Job<DownloadJobDto>) {
    const { url, downloadId, hosterId } = job.data;
    await this.downloadsRequestsAttemptsRepository.addDownloadAttempt(
      downloadId,
      hosterId,
    );
    await this.downloadsService.download({
      url,
      onDownloadProgress: (updatedDownloadProgress: number) =>
        job.progress(updatedDownloadProgress),
    });
  }

  @OnQueueFailed()
  async markAsFailedAndPullNextJob(job: Job<DownloadJobDto>) {
    const { hosterId, downloadId } = job.data;
    await this.downloadsRepository.changeDownloadStatus(
      downloadId,
      hosterId,
      'FAILED',
    );
    const hosterQuotaLeft = await this.hostersService.getHosterQuotaLeft(
      hosterId,
    );
    await this.addHosterDownloadsRequestsToQueue(hosterId, hosterQuotaLeft);
  }

  @OnQueueCompleted()
  async pullNextJob(job: Job<DownloadJobDto>) {
    this.logger.verbose('Download finished!');
    this.logger.verbose('Downloading new item for current hoster...');

    const { hosterId, downloadId } = job.data;
    await this.downloadsRepository.changeDownloadStatus(
      downloadId,
      hosterId,
      'SUCCESS',
    );
    const hosterQuotaLeft = await this.hostersService.getHosterQuotaLeft(
      hosterId,
    );
    await this.addHosterDownloadsRequestsToQueue(hosterId, hosterQuotaLeft);
  }
}
