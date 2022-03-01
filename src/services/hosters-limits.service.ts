import { Injectable, Logger } from '@nestjs/common';

import { HostersLimitsRepository } from '@/repositories/hosters-limit.repository';
import { getMinValueFromObjectValues, subtractObjects } from '@/utils/objects';
import { HosterLimits } from '@/interfaces/hoster-limits';

@Injectable()
export class HostersLimitsService {
  constructor(
    private readonly hostersLimitsRepository: HostersLimitsRepository,
  ) {}

  private readonly logger: Logger = new Logger(HostersLimitsService.name);

  async countHosterLimitsQuotaLeft(hosterId: string) {
    const hosterLimits = await this.listHosterLimitsQuotaLeft(hosterId);
    this.logger.verbose(`Listing hoster limits for ${hosterId}`);
    this.logger.verbose(hosterLimits);
    return getMinValueFromObjectValues(hosterLimits);
  }

  async listHosterLimitsQuotaLeft(hosterId: string): Promise<HosterLimits> {
    const hosterLimits = await this.hostersLimitsRepository.getHosterLimits(
      hosterId,
    );
    const downloadsAttempts =
      await this.hostersLimitsRepository.countHosterDownloadsAttempts(hosterId);
    return hosterLimits && subtractObjects(hosterLimits, downloadsAttempts);
  }
}
