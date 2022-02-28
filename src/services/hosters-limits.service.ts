import { Injectable } from '@nestjs/common';

import { HostersLimitsRepository } from '@/repositories/hosters-limit.repository';
import { getMinValueFromObjectValues, subtractObjects } from '@/utils/objects';
import { HosterLimits } from '@/interfaces/hoster-limits';

@Injectable()
export class HostersLimitsService {
  constructor(
    private readonly hostersLimitsRepository: HostersLimitsRepository,
  ) {}

  async countHosterLimitsQuotaLeft(hosterId: string) {
    return getMinValueFromObjectValues(
      await this.listHosterLimitsQuotaLeft(hosterId),
    );
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
