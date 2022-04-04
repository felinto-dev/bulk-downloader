import { MAX_CONCURRENT_DOWNLOADS_ALLOWED } from '@/consts/app';
import { HostersService } from '@/services/hosters.service';
import { sumMapValues } from '@/utils/objects';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HosterConcurrencyManager {
  constructor(private readonly hostersService: HostersService) {}

  private readonly downloadsInProgressByHoster: Map<string, number> = new Map();

  async hasReachedMaxConcurrentDownloadsGlobalLimit(): Promise<boolean> {
    const currentDownloads = sumMapValues(this.downloadsInProgressByHoster);
    const maxConcurrentDownloads = MAX_CONCURRENT_DOWNLOADS_ALLOWED;
    return currentDownloads >= maxConcurrentDownloads;
  }

  async hasHosterReachedMaxConcurrentDownloads(
    hosterId: string,
  ): Promise<boolean> {
    const currentDownloads =
      this.downloadsInProgressByHoster.get(hosterId) || 0;
    const maxConcurrentDownloads =
      await this.hostersService.getMaxConcurrentDownloads(hosterId);
    return currentDownloads >= maxConcurrentDownloads;
  }

  async incrementDownloadsInProgress(hosterId: string): Promise<void> {
    const currentDownloads =
      this.downloadsInProgressByHoster.get(hosterId) || 0;
    this.downloadsInProgressByHoster.set(hosterId, currentDownloads + 1);
  }

  async decrementDownloadsInProgress(hosterId: string): Promise<void> {
    const currentDownloads = this.downloadsInProgressByHoster.get(hosterId);

    if (!currentDownloads) {
      throw new Error(`No downloads in progress for hoster ${hosterId}`);
    }

    this.downloadsInProgressByHoster.set(hosterId, currentDownloads - 1);
  }
}
