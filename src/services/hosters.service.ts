import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';

import { HostersRepository } from '@/repositories/hosters.repository';
import { HostersLimitsRepository } from '@/repositories/hosters-limit.repository';
import { getMinValueFromObjectValues, subtractObjects } from '@/utils/objects';

@Injectable()
export class HostersService {
  constructor(
    private readonly hostersRepository: HostersRepository,
    private readonly hostersLimitsRepository: HostersLimitsRepository,
  ) {}

  async findInactiveHostersWithQuotaLeft() {
    const hosters = await this.hostersRepository.findInactiveHosters();
    return Promise.all(
      hosters.map(async (hoster) => ({
        id: hoster.id,
        quotaLeft: await this.countHosterQuotaLeft(hoster.id),
      })),
    );
  }

  async countHosterQuotaLeft(hosterId: string) {
    return Math.min(
      (await this.hostersRepository.findHoster(hosterId)).concurrency,
      getMinValueFromObjectValues(
        await this.listHosterLimitsQuotaLeft(hosterId),
      ),
    );
  }

  async listHosterLimitsQuotaLeft(hosterId: string) {
    const hosterLimits = await this.hostersLimitsRepository.getHosterLimits(
      hosterId,
    );
    const downloadsAttempts = await this.countHosterDownloadsAttempts(hosterId);
    return hosterLimits && subtractObjects(hosterLimits, downloadsAttempts);
  }

  async countHosterDownloadsAttempts(hosterId: string) {
    return {
      hourly:
        await this.hostersLimitsRepository.countHosterDownloadsAttemptsDidAfter(
          hosterId,
          DateTime.now().set({ minute: 0, second: 0 }).toISO(),
        ),
      daily:
        await this.hostersLimitsRepository.countHosterDownloadsAttemptsDidAfter(
          hosterId,
          DateTime.now().set({ hour: 0, minute: 0, second: 0 }).toISO(),
        ),
      monthly:
        await this.hostersLimitsRepository.countHosterDownloadsAttemptsDidAfter(
          hosterId,
          DateTime.now().set({ day: 1, hour: 0, minute: 0, second: 0 }).toISO(),
        ),
    };
  }
}
