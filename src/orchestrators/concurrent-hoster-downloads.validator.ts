import { MAX_CONCURRENT_DOWNLOADS_ALLOWED } from '@/consts/app';
import { DOWNLOADS_PROCESSING_QUEUE } from '@/consts/queues';
import { DownloadJobDto } from '@/dto/download.job.dto';
import { HostersService } from '@/services/hosters.service';
import { sumMapValues } from '@/utils/objects';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

@Injectable()
export class HosterDownloadsConcurrencyValidator {
  constructor(
    @InjectQueue(DOWNLOADS_PROCESSING_QUEUE)
    private readonly downloadsProcessingQueue: Queue<DownloadJobDto>,
    private readonly hostersService: HostersService,
  ) {}

  private readonly activeHosterDownloadsCounter: Map<string, number> =
    new Map();

  private async countActiveDownloadsOnQueue(): Promise<number> {
    return this.downloadsProcessingQueue.getActiveCount();
  }

  private async countActiveDownloads(): Promise<number> {
    return sumMapValues(this.activeHosterDownloadsCounter);
  }

  private async validateConcurrentDownloads(): Promise<boolean> {
    const activeDownloads = await this.countActiveDownloadsOnQueue();
    const activeDownloadsManagedByThisOrchestrator =
      await this.countActiveDownloads();

    return activeDownloads <= activeDownloadsManagedByThisOrchestrator;
  }

  async canOrchestratorRun(): Promise<boolean> {
    const hasQuotaLeft = this.hasQuotaLeft();
    const assertConcurrentDownloadsMatchActiveDownloads =
      await this.validateConcurrentDownloads();

    return hasQuotaLeft && assertConcurrentDownloadsMatchActiveDownloads;
  }

  private getRemainingQuota(): number {
    return (
      MAX_CONCURRENT_DOWNLOADS_ALLOWED -
      sumMapValues(this.activeHosterDownloadsCounter)
    );
  }

  private hasQuotaLeft(): boolean {
    return this.getRemainingQuota() > 0;
  }

  private async countActiveDownloadsByHosterId(
    hosterId: string,
  ): Promise<number> {
    return this.activeHosterDownloadsCounter.get(hosterId) || 0;
  }

  async decrementQuotaLeft(hosterId: string): Promise<void> {
    const hosterConcurrentDownloads =
      this.activeHosterDownloadsCounter.get(hosterId) || 0;
    this.activeHosterDownloadsCounter.set(
      hosterId,
      hosterConcurrentDownloads + 1,
    );
  }

  async incrementQuotaLeft(hosterId: string): Promise<void> {
    const maxConcurrentDownloads = await this.getMaxConcurrentDownloads(
      hosterId,
    );

    const hosterConcurrentDownloads =
      this.activeHosterDownloadsCounter.get(hosterId) || maxConcurrentDownloads;

    if (hosterConcurrentDownloads > 0) {
      this.activeHosterDownloadsCounter.set(
        hosterId,
        hosterConcurrentDownloads - 1,
      );
    }
  }

  async getMaxConcurrentDownloads(hosterId: string): Promise<number> {
    return this.hostersService.getMaxConcurrentDownloads(hosterId);
  }

  async hasReachedConcurrentDownloadsLimit(hosterId: string): Promise<boolean> {
    const maxConcurrentDownloads = await this.getMaxConcurrentDownloads(
      hosterId,
    );

    const currentConcurrentDownloads =
      await this.countActiveDownloadsByHosterId(hosterId);

    return currentConcurrentDownloads >= maxConcurrentDownloads;
  }
}
