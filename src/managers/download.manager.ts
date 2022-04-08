import { DOWNLOAD_CLIENT } from '@/adapters/tokens';
import {
  DownloadClientInterface,
  DownloadParams,
} from '@/interfaces/download-client.interface';
import { HosterQuotasService } from '@/services/hoster-quotas.service';
import { Inject, Injectable } from '@nestjs/common';
import { HosterConcurrencyManager } from './hoster-concurrency.manager';

@Injectable()
export class DownloadManager {
  constructor(
    private readonly hosterConcurrencyManager: HosterConcurrencyManager,
    private readonly hosterQuotaService: HosterQuotasService,
    @Inject(DOWNLOAD_CLIENT)
    private readonly downloadClient: DownloadClientInterface,
  ) {}

  private async isHosterAvailableToDownload(
    hosterId: string,
  ): Promise<boolean> {
    const hasReachedMaxConcurrentDownloads =
      await this.hosterConcurrencyManager.hasHosterReachedMaxConcurrentDownloadsByHosterId(
        hosterId,
      );

    const hasHosterReachedQuota = await this.hosterQuotaService.hasReachedQuota(
      hosterId,
    );

    return !(hasReachedMaxConcurrentDownloads || hasHosterReachedQuota);
  }

  async startDownload(hosterId: string, downloadParams: DownloadParams) {
    if (this.isHosterAvailableToDownload(hosterId)) {
      await this.downloadClient.download(downloadParams);
    }
  }
}
