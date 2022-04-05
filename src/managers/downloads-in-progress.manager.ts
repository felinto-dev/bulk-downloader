import { DownloadsInProgressRepository } from '@/repositories/downloads-in-progress.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DownloadsInProgressManager {
  constructor(
    private readonly downloadInProgressRepository: DownloadsInProgressRepository,
  ) {}

  async countDownloadsInProgress(): Promise<number> {
    return this.downloadInProgressRepository.sum();
  }

  async countDownloadsInProgressByHosterId(hosterId: string): Promise<number> {
    const currentDownloads = await this.downloadInProgressRepository.get(
      hosterId,
      0,
    );
    return currentDownloads;
  }

  async incrementDownloadsInProgress(hosterId: string): Promise<void> {
    const currentDownloads = await this.downloadInProgressRepository.get(
      hosterId,
      0,
    );
    await this.downloadInProgressRepository.set(hosterId, currentDownloads + 1);
  }

  async decrementDownloadsInProgress(hosterId: string): Promise<void> {
    const currentDownloads = await this.downloadInProgressRepository.get(
      hosterId,
    );

    if (!currentDownloads) {
      throw new Error(
        `No downloads in progress for hoster ${hosterId}. Cannot decrement.`,
      );
    }

    await this.downloadInProgressRepository.set(hosterId, currentDownloads - 1);
  }
}
