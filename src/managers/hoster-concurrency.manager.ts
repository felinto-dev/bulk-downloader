import { HostersService } from '@/services/hosters.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HosterConcurrencyManager {
  constructor(private readonly hostersService: HostersService) {}

  private readonly downloadsInProgressByHoster: Map<string, number> = new Map();

  public async hasReachedMaxConcurrentDownloads(
    hosterId: string,
  ): Promise<boolean> {
    const currentDownloads =
      this.downloadsInProgressByHoster.get(hosterId) || 0;
    const maxConcurrentDownloads =
      await this.hostersService.getMaxConcurrentDownloads(hosterId);
    return currentDownloads >= maxConcurrentDownloads;
  }

  public async incrementDownloadsInProgress(hosterId: string): Promise<void> {
    const currentDownloads =
      this.downloadsInProgressByHoster.get(hosterId) || 0;
    this.downloadsInProgressByHoster.set(hosterId, currentDownloads + 1);
  }

  public async decrementDownloadsInProgress(hosterId: string): Promise<void> {
    const currentDownloads = this.downloadsInProgressByHoster.get(hosterId);

    if (!currentDownloads) {
      throw new Error(`No downloads in progress for hoster ${hosterId}`);
    }

    this.downloadsInProgressByHoster.set(hosterId, currentDownloads - 1);
  }
}
