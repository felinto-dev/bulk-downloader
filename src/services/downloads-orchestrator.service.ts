import { DOWNLOADS_ORCHESTRATING_QUEUE } from '@/consts/queues';
import { DownloadsOrchestratorTasks } from '@/consumers/downloads-orchestrating.consumer';
import { DownloadStatusEvent } from '@/events/download-status-changed.event';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bull';

@Injectable()
export class DownloadsOrchestratorService {
  constructor(
    @InjectQueue(DOWNLOADS_ORCHESTRATING_QUEUE)
    private readonly downloadsOrchestratingQueue: Queue,
  ) {}

  @OnEvent(DownloadStatusEvent.FAILED)
  @OnEvent(DownloadStatusEvent.FINISHED)
  async run() {
    await this.downloadsOrchestratingQueue.add(
      DownloadsOrchestratorTasks.RUN_ORCHESTRATOR,
    );
  }
}
