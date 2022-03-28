import { HosterQuotas } from '@/dto/hoster-quotas.dto';
import { HosterQuotaRepository } from '@/repositories/hoster-quota.repository';
import { getMinValueFromObjectValues, subtractObjects } from '@/utils/objects';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class HosterQuotasService {
  constructor(private readonly hosterQuotasRepository: HosterQuotaRepository) {}

  private readonly logger: Logger = new Logger(HosterQuotasService.name);

  async getQuotaLeft(hosterId: string): Promise<number> {
    const quotaLeft = getMinValueFromObjectValues(
      await this.listHosterQuotasLeft(hosterId),
    );
    this.logger.verbose(
      `Hoster ${hosterId} has ${quotaLeft} downloads quota left`,
    );
    return quotaLeft;
  }

  async listQuotasByHosterId(hosterId: string): Promise<HosterQuotas> {
    this.logger.log(`Getting quotas for hoster ${hosterId}`);
    return this.hosterQuotasRepository.getQuotasByHosterId(hosterId);
  }

  async listHosterQuotasUsed(hosterId: string): Promise<HosterQuotas> {
    return this.hosterQuotasRepository.countUsedDownloadsQuota(hosterId);
  }

  async listHosterQuotasLeft(hosterId: string): Promise<HosterQuotas | null> {
    const hosterQuotas = await this.listQuotasByHosterId(hosterId);
    const hosterQuotasUsed = await this.listHosterQuotasUsed(hosterId);
    return hosterQuotas && subtractObjects(hosterQuotas, hosterQuotasUsed);
  }
}
