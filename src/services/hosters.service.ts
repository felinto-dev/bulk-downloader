import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';

import { HostersRepository } from '@/repositories/hosters.repository';
import { HostersLimitsRepository } from '@/repositories/hosters-limit.repository';
import { subtractObjects } from '@/utils/objects';

@Injectable()
export class HostersService {
  constructor(
    private readonly hostersRepository: HostersRepository,
    private readonly hostersLimitsRepository: HostersLimitsRepository,
  ) {}

  async getInactiveHosters() {
    const hosters = await this.hostersRepository.getInactiveHosters();

    return hosters
      .map((hoster) => {
        if (hoster.concurrency === 0) {
          return;
        }

        return hoster;
      })
      .filter((hoster) => !!hoster);
  }

  async getHosterQuotaLeft(hosterId: string) {
    return subtractObjects(
      await this.hostersLimitsRepository.getHosterLimits(hosterId),
      await this.countHosterDownloadsAttempts(hosterId),
    );
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
