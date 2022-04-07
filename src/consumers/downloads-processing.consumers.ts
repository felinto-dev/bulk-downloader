import { DOWNLOAD_CLIENT } from '@/adapters/tokens';
import { MAX_CONCURRENT_DOWNLOADS_ALLOWED } from '@/consts/app';
import { DOWNLOADS_PROCESSING_QUEUE } from '@/consts/queues';
import { DownloadJobDto } from '@/dto/download.job.dto';
import {
  DownloadStatusChangedEvent,
  DownloadStatusEvent,
} from '@/events/download-status-changed.event';
import { DownloadClientInterface } from '@/interfaces/download-client.interface';
import { HosterConcurrencyManager } from '@/managers/hoster-concurrency.manager';
import { DownloadObserver } from '@/observers/download.observer';
import { HosterQuotasService } from '@/services/hoster-quotas.service';
import {
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DoneCallback, Job } from 'bull';

@Processor(DOWNLOADS_PROCESSING_QUEUE)
export class DownloadsProcessingConsumer {
  constructor(
    @Inject(DOWNLOAD_CLIENT)
    private readonly downloadClient: DownloadClientInterface,
    private readonly configService: ConfigService,
    private readonly hosterQuotaService: HosterQuotasService,
    private readonly hosterConcurrencyManager: HosterConcurrencyManager,
    private readonly downloadObserver: DownloadObserver,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Process({ concurrency: MAX_CONCURRENT_DOWNLOADS_ALLOWED })
  async handleDownload(job: Job<DownloadJobDto>, done: DoneCallback) {
    const { url, downloadId, hosterId } = job.data;

    const hasReachedMaxConcurrentDownloads =
      await this.hosterConcurrencyManager.hasHosterReachedMaxConcurrentDownloadsByHosterId(
        hosterId,
      );

    const hasHosterReachedQuota = await this.hosterQuotaService.hasReachedQuota(
      hosterId,
    );

    if (hasReachedMaxConcurrentDownloads || hasHosterReachedQuota) {
      done();
    }

    await this.downloadObserver.onDownloadStarted(hosterId, downloadId);
    await this.emitDownloadStatusChangedEvent(
      hosterId,
      downloadId,
      DownloadStatusEvent.STARTED,
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
  async handleDownloadFailed(job: Job<DownloadJobDto>) {
    const { downloadId, hosterId } = job.data;
    await this.downloadObserver.onDownloadFailed(hosterId, downloadId);
    await this.emitDownloadStatusChangedEvent(
      hosterId,
      downloadId,
      DownloadStatusEvent.FAILED,
    );
  }

  @OnQueueCompleted()
  async handleDownloadFinished(job: Job<DownloadJobDto>) {
    const { downloadId, hosterId } = job.data;
    await this.downloadObserver.onDownloadFinished(hosterId, downloadId);
    await this.emitDownloadStatusChangedEvent(
      hosterId,
      downloadId,
      DownloadStatusEvent.FINISHED,
    );
  }

  private async emitDownloadStatusChangedEvent(
    hosterId: string,
    downloadId: string,
    status: DownloadStatusEvent,
  ) {
    const downloadStatusChangedEvent = new DownloadStatusChangedEvent();
    downloadStatusChangedEvent.downloadId = downloadId;
    downloadStatusChangedEvent.hosterId = hosterId;
    this.eventEmitter.emit(status, downloadStatusChangedEvent);
  }
}
