import { MAX_CONCURRENT_DOWNLOADS_ALLOWED } from '@/consts/app';
import { DOWNLOADS_PROCESSING_QUEUE } from '@/consts/queues';
import { DownloadJobDto } from '@/dto/download.job.dto';
import {
  DownloadStatusChangedEvent,
  DownloadStatusEvent,
} from '@/events/download-status-changed.event';
import { DownloadManager } from '@/managers/download.manager';
import {
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Job } from 'bull';

@Processor(DOWNLOADS_PROCESSING_QUEUE)
export class DownloadsProcessingConsumer {
  constructor(
    private readonly configService: ConfigService,
    private readonly downloadManager: DownloadManager,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Process({ concurrency: MAX_CONCURRENT_DOWNLOADS_ALLOWED })
  async handleDownload(job: Job<DownloadJobDto>) {
    const { url, downloadId, hosterId } = job.data;

    await this.emitDownloadStatusChangedEvent(
      hosterId,
      downloadId,
      DownloadStatusEvent.STARTED,
    );

    await this.downloadManager.startDownload(hosterId, {
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
    await this.emitDownloadStatusChangedEvent(
      hosterId,
      downloadId,
      DownloadStatusEvent.FAILED,
    );
  }

  @OnQueueCompleted()
  async handleDownloadFinished(job: Job<DownloadJobDto>) {
    const { downloadId, hosterId } = job.data;
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
