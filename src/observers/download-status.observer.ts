import { DownloadStatusEvent } from '@/events/download-status-changed.event';
import { DownloadsService } from '@/services/downloads.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DownloadStatus } from '@prisma/client';

@Injectable()
export class DownloadStatusObserver {
  constructor(private readonly downloadsService: DownloadsService) {}

  @OnEvent(DownloadStatusEvent.STARTED)
  async handleDownloadStartedEvent(hosterId: string, downloadId: string) {
    await this.downloadsService.changeDownloadStatus(
      downloadId,
      hosterId,
      DownloadStatus.DOWNLOADING,
    );
  }

  @OnEvent(DownloadStatusEvent.FAILED)
  async handleDownloadFailedEvent(hosterId: string, downloadId: string) {
    await this.downloadsService.changeDownloadStatus(
      downloadId,
      hosterId,
      DownloadStatus.FAILED,
    );
  }

  @OnEvent(DownloadStatusEvent.FINISHED)
  async handleDownloadFinishedEvent(hosterId: string, downloadId: string) {
    await this.downloadsService.changeDownloadStatus(
      downloadId,
      hosterId,
      DownloadStatus.SUCCESS,
    );
  }
}
