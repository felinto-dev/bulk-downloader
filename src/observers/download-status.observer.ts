import {
  DownloadStatusChangedEvent,
  DownloadStatusEvent,
} from '@/events/download-status-changed.event';
import { DownloadsInProgressManager } from '@/managers/downloads-in-progress.manager';
import { DownloadsService } from '@/services/downloads.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DownloadStatus } from '@prisma/client';

@Injectable()
export class DownloadStatusObserver {
  constructor(
    private readonly downloadsService: DownloadsService,
    private readonly downloadsInProgressManager: DownloadsInProgressManager,
  ) {}

  @OnEvent(DownloadStatusEvent.STARTED)
  async handleDownloadStartedEvent({
    hosterId,
    downloadId,
  }: DownloadStatusChangedEvent) {
    await this.downloadsInProgressManager.incrementDownloadsInProgress(
      hosterId,
    );
    await this.downloadsService.changeDownloadStatus(
      hosterId,
      downloadId,
      DownloadStatus.DOWNLOADING,
    );
  }

  @OnEvent(DownloadStatusEvent.FAILED)
  async handleDownloadFailedEvent({
    hosterId,
    downloadId,
  }: DownloadStatusChangedEvent) {
    await this.downloadsInProgressManager.decrementDownloadsInProgress(
      hosterId,
    );
    await this.downloadsService.changeDownloadStatus(
      hosterId,
      downloadId,
      DownloadStatus.FAILED,
    );
  }

  @OnEvent(DownloadStatusEvent.FINISHED)
  async handleDownloadFinishedEvent({
    hosterId,
    downloadId,
  }: DownloadStatusChangedEvent) {
    await this.downloadsService.changeDownloadStatus(
      hosterId,
      downloadId,
      DownloadStatus.SUCCESS,
    );
    await this.downloadsInProgressManager.decrementDownloadsInProgress(
      hosterId,
    );
  }
}
