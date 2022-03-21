import { GLOBAL_DOWNLOADS_CONCURRENCY } from '@/consts/app';
import { DOWNLOADS_QUEUE } from '@/consts/queues';
import { DownloadJobDto } from '@/dto/download.job.dto';
import { DownloadClientInterface } from '@/interfaces/download-client.interface';
import { DownloadsOrquestrator } from '@/orchestrators/downloads.orchestrator';
import { DownloadsRequestsAttemptsRepository } from '@/repositories/downloads-requests-attempts.repository';
import {
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DownloadStatus } from '@prisma/client';
import { Job } from 'bull';

@Processor(DOWNLOADS_QUEUE)
export class DownloadsConsumer {
  constructor(
    private readonly downloadsRequestsAttemptsRepository: DownloadsRequestsAttemptsRepository,
    private readonly downloadsOrquestrator: DownloadsOrquestrator,
    @Inject('DOWNLOAD_CLIENT')
    private readonly downloadClient: DownloadClientInterface,
    private readonly configService: ConfigService,
  ) {}

  @Process({ concurrency: GLOBAL_DOWNLOADS_CONCURRENCY })
  async onDownload(job: Job<DownloadJobDto>) {
    const { url, downloadId, hosterId } = job.data;
    await this.downloadsRequestsAttemptsRepository.registerDownloadAttempt(
      downloadId,
      hosterId,
    );
    await this.downloadClient.download({
      downloadUrl: url,
      saveLocation: await this.configService.get('app.downloads_directory'),
      onDownloadProgress: (updatedDownloadProgress: number) =>
        job.progress(updatedDownloadProgress),
    });
  }

  @OnQueueFailed()
  async onDownloadFail(job: Job<DownloadJobDto>) {
    await this.downloadsOrquestrator.categorizeDownloadAndPullNextDownload(
      job,
      DownloadStatus.FAILED,
    );
  }

  @OnQueueCompleted()
  async onDownloadFinished(job: Job<DownloadJobDto>) {
    await this.downloadsOrquestrator.categorizeDownloadAndPullNextDownload(
      job,
      DownloadStatus.SUCCESS,
    );
  }
}
