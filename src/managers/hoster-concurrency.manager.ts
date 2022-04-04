import { MAX_CONCURRENT_DOWNLOADS_ALLOWED } from '@/consts/app';
import { HostersService } from '@/services/hosters.service';
import { Injectable } from '@nestjs/common';
import { DownloadsInProgressManager } from './downloads-in-progress.manager';

@Injectable()
export class HosterConcurrencyManager {
  constructor(
    private readonly hostersService: HostersService,
    private readonly downloadsInProgressManager: DownloadsInProgressManager,
  ) {}

  async hasReachedMaxConcurrentDownloadsGlobalLimit(): Promise<boolean> {
    const currentDownloads =
      await this.downloadsInProgressManager.countDownloadsInProgress();
    const maxConcurrentDownloads = MAX_CONCURRENT_DOWNLOADS_ALLOWED;
    return currentDownloads >= maxConcurrentDownloads;
  }

  async hasHosterReachedMaxConcurrentDownloads(
    hosterId: string,
  ): Promise<boolean> {
    const currentDownloads =
      await this.downloadsInProgressManager.countDownloadsInProgressByHosterId(
        hosterId,
      );
    const maxConcurrentDownloads =
      await this.hostersService.getMaxConcurrentDownloads(hosterId);
    return currentDownloads >= maxConcurrentDownloads;
  }
}
