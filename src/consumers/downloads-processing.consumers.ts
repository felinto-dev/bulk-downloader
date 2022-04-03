import { DOWNLOAD_CLIENT } from '@/adapters/tokens';
import { MAX_CONCURRENT_DOWNLOADS_ALLOWED } from '@/consts/app';
import {
  DOWNLOADS_ORCHESTRATING_QUEUE,
  DOWNLOADS_PROCESSING_QUEUE,
} from '@/consts/queues';
import { DownloadJobDto } from '@/dto/download.job.dto';
import { DownloadClientInterface } from '@/interfaces/download-client.interface';
import { HosterDownloadsConcurrencyValidator } from '@/orchestrators/concurrent-hoster-downloads.validator';
import { DownloadsService } from '@/services/downloads.service';
import {
  InjectQueue,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DownloadStatus } from '@prisma/client';
import { Job, Queue } from 'bull';
import { DownloadsOrchestratorTasks } from './downloads-orchestrating.consumer';

@Processor(DOWNLOADS_PROCESSING_QUEUE)
export class DownloadsProcessingConsumer {
  constructor(
    @Inject(DOWNLOAD_CLIENT)
    private readonly downloadClient: DownloadClientInterface,
    private readonly configService: ConfigService,
    private readonly downloadsService: DownloadsService,
    private readonly concurrentHosterDownloadsOrchestrator: HosterDownloadsConcurrencyValidator,
    @InjectQueue(DOWNLOADS_ORCHESTRATING_QUEUE)
    private readonly downloadsOrchestratingQueue: Queue,
  ) {}

  @OnQueueActive()
  async onDownloadStarted(job: Job<DownloadJobDto>) {
    const { hosterId, downloadId } = job.data;
    await this.concurrentHosterDownloadsOrchestrator.incrementQuotaLeft(
      hosterId,
    );
    await this.downloadsService.changeDownloadStatus(
      downloadId,
      hosterId,
      DownloadStatus.DOWNLOADING,
    );
  }

  @Process({ concurrency: MAX_CONCURRENT_DOWNLOADS_ALLOWED })
  async onDownload(job: Job<DownloadJobDto>) {
    const { url } = job.data;
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
    await this.concurrentHosterDownloadsOrchestrator.decrementQuotaLeft(
      hosterId,
    );
    await this.downloadsOrchestratingQueue.add(
      DownloadsOrchestratorTasks.RUN_ORCHESTRATOR,
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
    await this.concurrentHosterDownloadsOrchestrator.decrementQuotaLeft(
      hosterId,
    );
    await this.downloadsOrchestratingQueue.add(
      DownloadsOrchestratorTasks.RUN_ORCHESTRATOR,
    );
  }
}
