import { MAX_CONCURRENT_DOWNLOADS_ALLOWED } from '@/consts/app';
import { DOWNLOADS_PROCESSING_QUEUE } from '@/consts/queues';
import { DownloadJobDto } from '@/dto/download.job.dto';
import { sumMapValues } from '@/utils/objects';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

/*
	Create a NestJS service that orchestrates the concurent downloads for each hoster.

	Should have the following methods:
	- getQuotaLeft(hosterId: string): number
	- incrementQuotaLeft(hosterId: string): void
	- decrementQuotaLeft(hosterId: string): void
	- getDownloadsInProgress(hosterId: string): number
	- incrementDownloadsInProgress(hosterId: string): void
	- decrementDownloadsInProgress(hosterId: string): void
	- getDownloadsInProgressForAllHosters(): number
*/
@Injectable()
export class ConcurrentHosterDownloadsOrchestrator {
  constructor(
    @InjectQueue(DOWNLOADS_PROCESSING_QUEUE)
    private readonly downloadsProcessingQueue: Queue<DownloadJobDto>,
  ) {}

  public readonly hosterConcurrentDownloadsCounter: Map<string, number> =
    new Map();

  async assertConcurrentDownloadsMatchActiveDownloads(): Promise<boolean> {
    const activeDownloads =
      await this.downloadsProcessingQueue.getActiveCount();
    const activeConcurrentDownloads =
      this.countDownloadsInProgressForAllHosters();
    return activeDownloads <= activeConcurrentDownloads;
  }

  countDownloadsInProgressForAllHosters(): number {
    return sumMapValues(this.hosterConcurrentDownloadsCounter);
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
}
