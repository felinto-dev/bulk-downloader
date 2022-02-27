import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';

import { HostersRepository } from '@/repositories/hosters.repository';
import { HostersLimitsService } from './hosters-limits.service';

@Injectable()
export class HostersService {
  constructor(
    private readonly hostersRepository: HostersRepository,
    private readonly hosterLimitsService: HostersLimitsService,
  ) {}

  async findHosterReadyToPull() {
    const hoster = await this.hostersRepository.findHosterToPull();

    if (!hoster) {
      return null;
    }

    const hosterLimits =
      await this.hosterLimitsService.listHosterLimitsQuotaLeft(hoster.id);

    if (!hosterLimits) {
      return hoster;
    }

    let releaseAtDuration: Date = DateTime.now().plus({ hour: 1 }).toJSDate();

    if (hosterLimits.monthly === 0) {
      releaseAtDuration = DateTime.now().plus({ month: 1 }).toJSDate();
    }

    if (hosterLimits.daily === 0) {
      releaseAtDuration = DateTime.now().plus({ day: 1 }).toJSDate();
    }

    if (hosterLimits.hourly === 0) {
      releaseAtDuration = DateTime.now().plus({ hour: 1 }).toJSDate();
    }

    if (Object.values(hosterLimits).some((limit: number) => limit === 0)) {
      return this.findHosterReadyToPull();
    }

    await this.hostersRepository.updateReleaseAt(hoster.id, releaseAtDuration); // should dont be executed on hourly concurrent cron
    return hoster;
  }
}
