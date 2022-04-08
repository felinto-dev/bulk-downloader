import { DOWNLOADS_ORCHESTRATING_QUEUE } from '@/consts/queues';
import { DownloadsOrchestratorTasks } from '@/consumers/downloads-orchestrating.consumer';
import { DownloadStatusEvent } from '@/events/download-status-changed.event';
import { DownloadsInProgressManager } from '@/managers/downloads-in-progress.manager';
import { DownloadsService } from '@/services/downloads.service';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DownloadStatus } from '@prisma/client';
import { Queue } from 'bull';

@Injectable()
export class DownloadStatusObserver {
  constructor(
    @InjectQueue(DOWNLOADS_ORCHESTRATING_QUEUE)
    private readonly downloadsOrchestratingQueue: Queue,
    private readonly downloadsService: DownloadsService,
    private readonly downloadsInProgressManager: DownloadsInProgressManager,
  ) {}

  @OnEvent(DownloadStatusEvent.STARTED)
  async handleDownloadStartedEvent(hosterId: string, downloadId: string) {
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
  async handleDownloadFailedEvent(hosterId: string, downloadId: string) {
    await this.downloadsInProgressManager.decrementDownloadsInProgress(
      hosterId,
    );
    await this.downloadsService.changeDownloadStatus(
      hosterId,
      downloadId,
      DownloadStatus.FAILED,
    );
    await this.runOrchestrator();
  }

  @OnEvent(DownloadStatusEvent.FINISHED)
  async handleDownloadFinishedEvent(hosterId: string, downloadId: string) {
    await this.downloadsService.changeDownloadStatus(
      hosterId,
      downloadId,
      DownloadStatus.SUCCESS,
    );
    await this.downloadsInProgressManager.decrementDownloadsInProgress(
      hosterId,
    );
    await this.runOrchestrator();
  }

  private async runOrchestrator() {
    await this.downloadsOrchestratingQueue.add(
      DownloadsOrchestratorTasks.RUN_ORCHESTRATOR,
    );
  }
}
