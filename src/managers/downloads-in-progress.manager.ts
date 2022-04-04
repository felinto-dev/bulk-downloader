import { sumMapValues } from '@/utils/objects';
import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class DownloadsInProgressManager implements OnModuleInit {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  private readonly downloadsInProgressByHoster: Promise<Map<string, number>> =
    this.cacheManager.get<Map<string, number>>('downloadsInProgressByHoster');

  async onModuleInit() {
    const downloadsInProgressByHosterNotDefined = !(await this
      .downloadsInProgressByHoster);

    if (downloadsInProgressByHosterNotDefined) {
      this.cacheManager.set('downloadsInProgressByHoster', new Map());
    }
  }

  async countDownloadsInProgress(): Promise<number> {
    return sumMapValues(await this.downloadsInProgressByHoster);
  }

  async countDownloadsInProgressByHosterId(hosterId: string): Promise<number> {
    const currentDownloads =
      (await this.downloadsInProgressByHoster).get(hosterId) || 0;
    return currentDownloads;
  }

  async incrementDownloadsInProgress(hosterId: string): Promise<void> {
    const currentDownloads =
      (await this.downloadsInProgressByHoster).get(hosterId) || 0;
    (await this.downloadsInProgressByHoster).set(
      hosterId,
      currentDownloads + 1,
    );
  }

  async decrementDownloadsInProgress(hosterId: string): Promise<void> {
    const currentDownloads = (await this.downloadsInProgressByHoster).get(
      hosterId,
    );

    if (!currentDownloads) {
      throw new Error(
        `No downloads in progress for hoster ${hosterId}. Cannot decrement.`,
      );
    }

    (await this.downloadsInProgressByHoster).set(
      hosterId,
      currentDownloads - 1,
    );
  }
}
