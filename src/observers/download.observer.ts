import { DOWNLOADS_ORCHESTRATING_QUEUE } from '@/consts/queues';
import { DownloadsOrchestratorTasks } from '@/consumers/downloads-orchestrating.consumer';
import { DownloadsInProgressManager } from '@/managers/downloads-in-progress.manager';
import { DownloadsService } from '@/services/downloads.service';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { DownloadStatus } from '@prisma/client';
import { Queue } from 'bull';

@Injectable()
export class DownloadObserver {
  constructor(
    @InjectQueue(DOWNLOADS_ORCHESTRATING_QUEUE)
    private readonly downloadsOrchestratingQueue: Queue,
    private readonly downloadsService: DownloadsService,
    private readonly downloadsInProgressManager: DownloadsInProgressManager,
  ) {}

  async onDownloadStarted(hosterId: string, downloadId: string) {
    await this.downloadsInProgressManager.incrementDownloadsInProgress(
      hosterId,
    );
    await this.downloadsService.changeDownloadStatus(
      downloadId,
      hosterId,
      DownloadStatus.DOWNLOADING,
    );
  }

  async onDownloadFailed(hosterId: string, downloadId: string) {
    await this.downloadsInProgressManager.decrementDownloadsInProgress(
      hosterId,
    );
    await this.downloadsService.changeDownloadStatus(
      downloadId,
      hosterId,
      DownloadStatus.FAILED,
    );
    await this.runOrchestrator();
  }

  async onDownloadFinished(hosterId: string, downloadId: string) {
    await this.downloadsService.changeDownloadStatus(
      downloadId,
      hosterId,
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
