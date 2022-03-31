import { MAX_CONCURRENT_DOWNLOADS_ALLOWED } from '@/consts/app';
import { sumMapValues } from '@/utils/objects';
import { Injectable } from '@nestjs/common';

/*
	Create a NestJS service that orchestrates the concurent downloads for each hoster.
*/
@Injectable()
export class ConcurrentHosterDownloadsOrchestrator {
  public readonly hosterConcurrentDownloadsCounter: Map<string, number> =
    new Map();

  getQuotaLeft(): number {
    return (
      MAX_CONCURRENT_DOWNLOADS_ALLOWED -
      sumMapValues(this.hosterConcurrentDownloadsCounter)
    );
  }
  async getHosterConcurrentDownloads(hosterId: string): Promise<number> {
    return this.hosterConcurrentDownloadsCounter.get(hosterId) || 0;
  }

  async decrementQuotaLeft(hosterId: string): Promise<void> {
    const hosterConcurrentDownloads =
      this.hosterConcurrentDownloadsCounter.get(hosterId) || 0;
    this.hosterConcurrentDownloadsCounter.set(
      hosterId,
      hosterConcurrentDownloads + 1,
    );
  }

  async incrementQuotaLeft(hosterId: string): Promise<void> {
    const hosterConcurrentDownloads =
      this.hosterConcurrentDownloadsCounter.get(hosterId) || 0;
    this.hosterConcurrentDownloadsCounter.set(
      hosterId,
      hosterConcurrentDownloads - 1,
    );
  }
}
