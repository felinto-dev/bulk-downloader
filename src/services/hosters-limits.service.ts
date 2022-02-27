import { Injectable } from '@nestjs/common';

import { HostersLimitsRepository } from '@/repositories/hosters-limit.repository';
import { HostersRepository } from '@/repositories/hosters.repository';
import { getMinValueFromObjectValues, subtractObjects } from '@/utils/objects';
import { HosterLimits } from '@/interfaces/hoster-limits';

@Injectable()
export class HostersLimitsService {
  constructor(
    private readonly hostersRepository: HostersRepository,
    private readonly hostersLimitsRepository: HostersLimitsRepository,
  ) {}

  async countHosterQuotaLeft(hosterId: string) {
    return Math.min(
      (await this.hostersRepository.findHoster(hosterId)).concurrency,
      getMinValueFromObjectValues(
        await this.listHosterLimitsQuotaLeft(hosterId),
      ),
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
