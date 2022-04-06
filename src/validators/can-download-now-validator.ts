import { HosterConcurrencyManager } from '@/managers/hoster-concurrency.manager';
import { HosterQuotasService } from '@/services/hoster-quotas.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CanDownloadNowValidator {
  constructor(
    private readonly hosterQuotaService: HosterQuotasService,
    private readonly hosterConcurrencyManager: HosterConcurrencyManager,
  ) {}

  async validate(hosterId: string): Promise<boolean> {
    const hasHosterReachedQuota = await this.hosterQuotaService.hasReachedQuota(
      hosterId,
    );

    if (hasHosterReachedQuota) {
      return false;
    }

    const hasReachedMaxConcurrentDownloads =
      await this.hosterConcurrencyManager.hasHosterReachedMaxConcurrentDownloadsByHosterId(
        hosterId,
      );

    if (hasReachedMaxConcurrentDownloads) {
      return false;
    }

    return true;
  }
}
