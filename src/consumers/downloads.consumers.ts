import {
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { DownloadStatus } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

import { DOWNLOADS_QUEUE } from '@/consts/queues';
import { DownloadsService } from '@/services/downloads.service';
import { GLOBAL_DOWNLOADS_CONCURRENCY } from '@/consts/app';
import { DownloadJobDto } from '@/interfaces/download.job.dto';
import { DownloadsRequestsAttemptsRepository } from '@/repositories/downloads-requests-attempts.repository';
import { DownloadsOrquestrator } from '@/orchestrators/downloads.orchestrator';

@Processor(DOWNLOADS_QUEUE)
export class DownloadsConsumer {
  constructor(
    private readonly downloadsService: DownloadsService,
    private readonly downloadsRequestsAttemptsRepository: DownloadsRequestsAttemptsRepository,
    private readonly downloadsOrquestrator: DownloadsOrquestrator,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async pullJobs() {
    await this.downloadsOrquestrator.pullJobs();
  }

  @Process({ concurrency: GLOBAL_DOWNLOADS_CONCURRENCY })
  async doDownload(job: Job<DownloadJobDto>) {
    const { url, downloadId, hosterId } = job.data;
    await this.downloadsRequestsAttemptsRepository.registerDownloadAttempt(
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
    await this.downloadsOrquestrator.categorizeDownloadAndPullNextJob(
      job,
      DownloadStatus.FAILED,
    );
  }

  @OnQueueCompleted()
  async pullNextJob(job: Job<DownloadJobDto>) {
    await this.downloadsOrquestrator.categorizeDownloadAndPullNextJob(
      job,
      DownloadStatus.SUCCESS,
    );
  }
}
