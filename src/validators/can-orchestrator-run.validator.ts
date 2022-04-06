import { HosterConcurrencyManager } from '@/managers/hoster-concurrency.manager';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CanOrchestratorRunValidator {
  constructor(
    private readonly hosterConcurrencyManager: HosterConcurrencyManager,
  ) {}

  async validate(): Promise<boolean> {
    const hasReachedMaxConcurrentDownloadsGlobalLimit =
      this.hosterConcurrencyManager.hasReachedMaxConcurrentDownloadsGlobalLimit();

    if (hasReachedMaxConcurrentDownloadsGlobalLimit) {
      return false;
    }

    return true;
  }
}
