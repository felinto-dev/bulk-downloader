import { HosterQuotas } from '@/dto/hoster-quotas.dto';
import { HosterQuotaRepository } from '@/repositories/hoster-quota.repository';
import { getMinValueFromObjectValues } from '@/utils/objects';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class HosterQuotasService {
  constructor(private readonly hosterQuotasRepository: HosterQuotaRepository) {}

  private readonly logger: Logger = new Logger(HosterQuotasService.name);

  /*
		create a function to get the quota left for a hoster
		should consider the quota for each period (monthly, daily, hourly) and get the min value as the quota left for the hoster
		if a hoster has no quota, return null
	*/
  async getQuotaLeft(hosterId: string): Promise<number | null> {
    const hosterQuotas = await this.listHosterQuotasLeft(hosterId);
    return hosterQuotas ? getMinValueFromObjectValues(hosterQuotas) : null;
  }

  /*
		list the quota for a hoster by period (monthly, daily, hourly)
	*/
  async listQuotasByHosterId(hosterId: string): Promise<HosterQuotas> {
    const hosterQuotas = await this.hosterQuotasRepository.getQuotasByHosterId(
      hosterId,
    );
    this.logger.log(`listQuotasByHosterId: ${JSON.stringify(hosterQuotas)}`);
    return hosterQuotas;
  }

  /*
		list the quota used for a hoster by period (monthly, daily, hourly)
	*/
  async listHosterQuotasUsed(hosterId: string): Promise<HosterQuotas> {
    const hosterQuotasUsed =
      await this.hosterQuotasRepository.countUsedDownloadsQuota(hosterId);
    this.logger.log(
      `listHosterQuotasUsed: ${JSON.stringify(hosterQuotasUsed)}`,
    );
    return hosterQuotasUsed;
  }

  /*
		list the quota left for a hoster by period (monthly, daily, hourly)
	*/
  async listHosterQuotasLeft(hosterId: string): Promise<HosterQuotas> {
    const hosterQuotas = await this.listQuotasByHosterId(hosterId);
    const hosterQuotasUsed = await this.listHosterQuotasUsed(hosterId);
    const hosterQuotasLeft = this.calculateHosterQuotaLeft(
      hosterQuotas,
      hosterQuotasUsed,
    );
    this.logger.log(
      `listHosterQuotasLeft: ${JSON.stringify(hosterQuotasLeft)}`,
    );
    return hosterQuotas && hosterQuotasLeft;
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
