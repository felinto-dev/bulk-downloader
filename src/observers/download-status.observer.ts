import { DownloadsService } from '@/services/downloads.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DownloadStatus } from '@prisma/client';

@Injectable()
export class DownloadStatusObserver {
  constructor(private readonly downloadsService: DownloadsService) {}

  @OnEvent('download.started')
  async handleDownloadStartedEvent(hosterId: string, downloadId: string) {
    await this.downloadsService.changeDownloadStatus(
      downloadId,
      hosterId,
      DownloadStatus.DOWNLOADING,
    );
  }

  @OnEvent('download.failed')
  async handleDownloadFailedEvent(hosterId: string, downloadId: string) {
    await this.downloadsService.changeDownloadStatus(
      downloadId,
      hosterId,
      DownloadStatus.FAILED,
    );
  }

  @OnEvent('download.finished')
  async handleDownloadFinishedEvent(hosterId: string, downloadId: string) {
    await this.downloadsService.changeDownloadStatus(
      downloadId,
      hosterId,
      DownloadStatus.SUCCESS,
    );
  }
}
