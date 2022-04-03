import { MAX_CONCURRENT_DOWNLOADS_ALLOWED } from '@/consts/app';
import { DOWNLOADS_PROCESSING_QUEUE } from '@/consts/queues';
import { DownloadJobDto } from '@/dto/download.job.dto';
import { HostersService } from '@/services/hosters.service';
import { sumMapValues } from '@/utils/objects';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class ConcurrentHosterDownloadsOrchestrator {
  constructor(
    @InjectQueue(DOWNLOADS_PROCESSING_QUEUE)
    private readonly downloadsProcessingQueue: Queue<DownloadJobDto>,
    private readonly hostersService: HostersService,
  ) {}

  private readonly hosterConcurrentDownloadsCounter: Map<string, number> =
    new Map();

  private async countActiveDownloadsOnQueue(): Promise<number> {
    return this.downloadsProcessingQueue.getActiveCount();
  }

  private async countActiveDownloadsManagedByThisOrchestrator(): Promise<number> {
    return sumMapValues(this.hosterConcurrentDownloadsCounter);
  }

  /*
		This method should assert that the number of downloads in progress on the queue is lower or equal to the number of concurrent downloads allowed for the hoster.
		This is to prevent the orchestrator from running when the hoster has reached its concurrent downloads limit.
	*/
  private async assertConcurrentDownloadsMatchActiveDownloads(): Promise<boolean> {
    const activeDownloads = await this.countActiveDownloadsOnQueue();
    const activeDownloadsManagedByThisOrchestrator =
      await this.countActiveDownloadsManagedByThisOrchestrator();

    return activeDownloads <= activeDownloadsManagedByThisOrchestrator;
  }

  async canOrchestratorRun(): Promise<boolean> {
    const hasQuotaLeft = this.hasQuotaLeft();
    const assertConcurrentDownloadsMatchActiveDownloads =
      await this.assertConcurrentDownloadsMatchActiveDownloads();

    return hasQuotaLeft && assertConcurrentDownloadsMatchActiveDownloads;
  }

  getQuotaLeft(): number {
    return (
      MAX_CONCURRENT_DOWNLOADS_ALLOWED -
      sumMapValues(this.hosterConcurrentDownloadsCounter)
    );
  }

  hasQuotaLeft(): boolean {
    return this.getQuotaLeft() > 0;
  }

  async countDownloadsInProgress(hosterId: string): Promise<number> {
    return this.hosterConcurrentDownloadsCounter.get(hosterId) || 0;
  }

  async decrementDownloadsInProgress(hosterId: string): Promise<void> {
    const hosterConcurrentDownloads =
      this.hosterConcurrentDownloadsCounter.get(hosterId) || 0;
    this.hosterConcurrentDownloadsCounter.set(
      hosterId,
      hosterConcurrentDownloads + 1,
    );
  }

  async incrementDownloadsInProgress(hosterId: string): Promise<void> {
    const hosterConcurrentDownloads =
      this.hosterConcurrentDownloadsCounter.get(hosterId) || 0;

    if (hosterConcurrentDownloads > 0) {
      this.hosterConcurrentDownloadsCounter.set(
        hosterId,
        hosterConcurrentDownloads - 1,
      );
    }
  }

  async hasReachedConcurrentDownloadsLimit(hosterId: string): Promise<boolean> {
    const maxConcurrentDownloads =
      await this.hostersService.getMaxConcurrentDownloads(hosterId);

    const currentConcurrentDownloads = await this.countDownloadsInProgress(
      hosterId,
    );

    return currentConcurrentDownloads >= maxConcurrentDownloads;
  }
}
