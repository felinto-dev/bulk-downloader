import { DOWNLOAD_CLIENT } from '@/adapters/tokens';
import { MAX_CONCURRENT_DOWNLOADS_ALLOWED } from '@/consts/app';
import { DOWNLOADS_PROCESSING_QUEUE } from '@/consts/queues';
import { DownloadJobDto } from '@/dto/download.job.dto';
import { DownloadClientInterface } from '@/interfaces/download-client.interface';
import { DownloadsOrquestrator } from '@/orchestrators/downloads.orchestrator';
import { DownloadsRepository } from '@/repositories/downloads.repository';
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

@Processor(DOWNLOADS_PROCESSING_QUEUE)
export class DownloadsProcessingConsumer {
  constructor(
    private readonly downloadsOrquestrator: DownloadsOrquestrator,
    @Inject(DOWNLOAD_CLIENT)
    private readonly downloadClient: DownloadClientInterface,
    private readonly configService: ConfigService,
    private readonly downloadsRepository: DownloadsRepository,
  ) {}

  @Process({ concurrency: MAX_CONCURRENT_DOWNLOADS_ALLOWED })
  async onDownload(job: Job<DownloadJobDto>) {
    const { url, downloadId, hosterId } = job.data;
    await this.downloadsRepository.changeDownloadStatus(
      downloadId,
      hosterId,
      'DOWNLOADING',
    );
    await this.downloadClient.download({
      downloadUrl: url,
      saveLocation: await this.configService.get('app.downloads_directory'),
      retry: 3,
      onDownloadProgress: (updatedDownloadProgress: number) =>
        job.progress(updatedDownloadProgress),
    });
  }

  @OnQueueFailed()
  async onDownloadFail(job: Job<DownloadJobDto>) {
    await this.downloadsOrquestrator.processDownload(
      job,
      DownloadStatus.FAILED,
    );
  }

  @OnQueueCompleted()
  async onDownloadFinished(job: Job<DownloadJobDto>) {
    await this.downloadsOrquestrator.processDownload(
      job,
      DownloadStatus.SUCCESS,
    );
  }
}
