import { HosterLimits } from '@/dto/hoster-limits.dto';
import { HostersLimitsRepository } from '@/repositories/hosters-limit.repository';
import { getMinValueFromObjectValues, subtractObjects } from '@/utils/objects';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class HosterQuotasService {
  constructor(
    private readonly hosterQuotasRepository: HostersLimitsRepository,
  ) {}

  private readonly logger: Logger = new Logger(HosterQuotasService.name);

  async listQuotasByHosterId(hosterId: string): Promise<HosterLimits> {
    this.logger.log(`Getting quotas for hoster ${hosterId}`);
    return this.hosterQuotasRepository.getQuotasByHosterId(hosterId);
  }

  async countHosterQuotaLeft(hosterId: string) {
    const hosterLimits = await this.listHosterQuotasLeft(hosterId);
    this.logger.verbose(`Listing hoster limits for ${hosterId}`);
    this.logger.verbose(hosterLimits);
    return getMinValueFromObjectValues(hosterLimits);
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
