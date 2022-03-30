import { nextQuotaRenewsByPeriod } from '@/consts/next-quota-renews-by-period';
import { UNLIMITED_QUOTA } from '@/consts/quotas';
import { HosterQuotas } from '@/dto/hoster-quotas.dto';
import { HosterQuotaRepository } from '@/repositories/hoster-quota.repository';
import { getMinValueFromObjectValues } from '@/utils/objects';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class HosterQuotasService {
  constructor(private readonly hosterQuotasRepository: HosterQuotaRepository) {}

  private readonly logger: Logger = new Logger(HosterQuotasService.name);

  async getHosterQuotaLeft(hosterId: string): Promise<number> {
    const hosterQuotasLeft = await this.listHosterQuotasLeft(hosterId);
    const quotaLeft = getMinValueFromObjectValues(hosterQuotasLeft);
    this.logger.log(`The quota left for hosterId: ${hosterId} is ${quotaLeft}`);

    if (quotaLeft === 0) {
      await this.hosterQuotasRepository.updateQuotaRenewsAt(
        hosterId,
        this.calculateNextQuotaRenews(hosterQuotasLeft),
      );
    }

    return Object.keys(hosterQuotasLeft).length === 0
      ? UNLIMITED_QUOTA
      : quotaLeft;
  }

  private calculateNextQuotaRenews(hosterQuotasLeft: HosterQuotas): Date {
    let nextQuotaRenews: Date;
    if (hosterQuotasLeft.monthlyDownloadLimit === 0) {
      nextQuotaRenews = nextQuotaRenewsByPeriod.monthly;
    }
    if (hosterQuotasLeft.dailyDownloadLimit === 0) {
      nextQuotaRenews = nextQuotaRenewsByPeriod.daily;
    }
    if (hosterQuotasLeft.hourlyDownloadLimit === 0) {
      nextQuotaRenews = nextQuotaRenewsByPeriod.hourly;
    }

    return nextQuotaRenews;
  }

  async listQuotasByHosterId(hosterId: string): Promise<HosterQuotas> {
    const hosterQuotas = await this.hosterQuotasRepository.getQuotasByHosterId(
      hosterId,
    );
    this.logger.log(`listQuotasByHosterId: ${JSON.stringify(hosterQuotas)}`);
    return hosterQuotas;
  }

  async listHosterQuotasUsed(hosterId: string): Promise<HosterQuotas> {
    const hosterQuotasUsed =
      await this.hosterQuotasRepository.countUsedDownloadsQuota(hosterId);
    this.logger.log(
      `listHosterQuotasUsed: ${JSON.stringify(hosterQuotasUsed)}`,
    );
    return hosterQuotasUsed;
  }

  async listHosterQuotasLeft(hosterId: string): Promise<HosterQuotas> {
    const hosterQuotas = await this.listQuotasByHosterId(hosterId);
    const hosterQuotasUsed = await this.listHosterQuotasUsed(hosterId);
    const hosterQuotasLeft = this.calculateHosterQuotaLeft(
      hosterQuotas,
      hosterQuotasUsed,
    );
    this.logger.log(
      `listing hosterQuotasLeft for hosterId: ${hosterId}\n${JSON.stringify(
        hosterQuotasLeft,
      )}`,
    );
    return hosterQuotasLeft;
  }

  private calculateHosterQuotaLeft(
    hosterQuotas: HosterQuotas,
    hosterQuotasUsed: HosterQuotas,
  ) {
    const hosterQuotasLeft: HosterQuotas = {};
    for (const timePeriod in hosterQuotas) {
      if (hosterQuotas.hasOwnProperty(timePeriod)) {
        const quota = hosterQuotas[timePeriod];
        if (quota) {
          const quotaUsed = hosterQuotasUsed[timePeriod] || 0;
          const quotaLeft = quota - quotaUsed;
          if (quotaLeft >= 0) {
            hosterQuotasLeft[timePeriod] = quotaLeft;
          } else {
            hosterQuotasLeft[timePeriod] = 0;
          }
        }
      }
    }
    return hosterQuotasLeft;
  }
}
