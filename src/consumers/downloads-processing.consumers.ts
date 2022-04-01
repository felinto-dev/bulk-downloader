import { DOWNLOAD_CLIENT } from '@/adapters/tokens';
import { MAX_CONCURRENT_DOWNLOADS_ALLOWED } from '@/consts/app';
import { DOWNLOADS_PROCESSING_QUEUE } from '@/consts/queues';
import { DownloadJobDto } from '@/dto/download.job.dto';
import { DownloadClientInterface } from '@/interfaces/download-client.interface';
import { DownloadsRepository } from '@/repositories/downloads.repository';
import { DownloadsService } from '@/services/downloads.service';
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
    @Inject(DOWNLOAD_CLIENT)
    private readonly downloadClient: DownloadClientInterface,
    private readonly configService: ConfigService,
    private readonly downloadsRepository: DownloadsRepository,
    private readonly downloadsService: DownloadsService,
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
    const { downloadId, hosterId } = job.data;
    await this.downloadsService.changeDownloadStatus(
      downloadId,
      hosterId,
      DownloadStatus.FAILED,
    );
  }

  @OnQueueCompleted()
  async onDownloadFinished(job: Job<DownloadJobDto>) {
    const { downloadId, hosterId } = job.data;
    await this.downloadsService.changeDownloadStatus(
      downloadId,
      hosterId,
      DownloadStatus.SUCCESS,
    );
  }
}
