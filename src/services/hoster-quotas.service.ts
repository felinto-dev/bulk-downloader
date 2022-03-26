import { HosterLimits } from '@/dto/hoster-limits.dto';
import { HosterQuotaRepository } from '@/repositories/hoster-quota.repository';
import { getMinValueFromObjectValues, subtractObjects } from '@/utils/objects';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class HosterQuotasService {
  constructor(private readonly hosterQuotasRepository: HosterQuotaRepository) {}

  private readonly logger: Logger = new Logger(HosterQuotasService.name);

  async listQuotasByHosterId(hosterId: string): Promise<HosterLimits> {
    this.logger.log(`Getting quotas for hoster ${hosterId}`);
    return this.hosterQuotasRepository.getQuotasByHosterId(hosterId);
  }

  async countHosterQuotaLeft(hosterId: string) {
    const hosterLimits = await this.listHosterQuotasLeft(hosterId);
    const quotaLeft = getMinValueFromObjectValues(hosterLimits);
    this.logger.verbose(
      `Hoster ${hosterId} has ${quotaLeft} downloads quota left`,
    );
    // TODO: if the quota left is 0, the hoster should be released at the next date frame
    return quotaLeft;
  }

  async listHosterQuotasUsed(hosterId: string): Promise<HosterLimits> {
    return this.hosterQuotasRepository.countUsedDownloadsQuota(hosterId);
  }

  async listHosterQuotasLeft(hosterId: string): Promise<HosterLimits | null> {
    const hosterQuotas = await this.listQuotasByHosterId(hosterId);
    const hosterQuotasUsed = await this.listHosterQuotasUsed(hosterId);
    return hosterQuotas && subtractObjects(hosterQuotas, hosterQuotasUsed);
  }
}
