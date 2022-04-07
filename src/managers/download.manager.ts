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

  async startDownload(hosterId: string, downloadParams: DownloadParams) {
    const hasReachedMaxConcurrentDownloads =
      await this.hosterConcurrencyManager.hasHosterReachedMaxConcurrentDownloadsByHosterId(
        hosterId,
      );

    const hasHosterReachedQuota = await this.hosterQuotaService.hasReachedQuota(
      hosterId,
    );

    if (hasReachedMaxConcurrentDownloads || hasHosterReachedQuota) {
      return;
    }

    await this.downloadClient.download(downloadParams);
  }
}
