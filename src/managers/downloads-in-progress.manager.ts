import { sumMapValues } from '@/utils/objects';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DownloadsInProgressManager {
  // TODO: Should use a redis for share the hoster's downloads in progress state between the workers
  private readonly downloadsInProgressByHoster: Map<string, number> = new Map();

  async countDownloadsInProgress(): Promise<number> {
    return sumMapValues(this.downloadsInProgressByHoster);
  }

  async countDownloadsInProgressByHosterId(hosterId: string): Promise<number> {
    const currentDownloads =
      this.downloadsInProgressByHoster.get(hosterId) || 0;
    return currentDownloads;
  }

  async incrementDownloadsInProgress(hosterId: string): Promise<void> {
    const currentDownloads =
      this.downloadsInProgressByHoster.get(hosterId) || 0;
    this.downloadsInProgressByHoster.set(hosterId, currentDownloads + 1);
  }

  async decrementDownloadsInProgress(hosterId: string): Promise<void> {
    const currentDownloads = this.downloadsInProgressByHoster.get(hosterId);

    if (!currentDownloads) {
      throw new Error(
        `No downloads in progress for hoster ${hosterId}. Cannot decrement.`,
      );
    }

    this.downloadsInProgressByHoster.set(hosterId, currentDownloads - 1);
  }
}
