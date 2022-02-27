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

    if (hosterLimits.monthly === 0) {
      await this.hostersRepository.updateReleaseAt(
        hoster.id,
        DateTime.now().plus({ month: 1 }).toJSDate(),
      );
      return this.findHosterReadyToPull();
    }

    if (hosterLimits.daily === 0) {
      await this.hostersRepository.updateReleaseAt(
        hoster.id,
        DateTime.now().plus({ day: 1 }).toJSDate(),
      );
      return this.findHosterReadyToPull();
    }

    if (hosterLimits.hourly === 0) {
      await this.hostersRepository.updateReleaseAt(
        hoster.id,
        DateTime.now().plus({ hour: 1 }).toJSDate(),
      );
      return this.findHosterReadyToPull();
    }

    await this.hostersRepository.updateReleaseAt(
      hoster.id,
      DateTime.now().plus({ month: 1 }).toJSDate(),
    ); // should dont be executed on hourly concurrent cron
    return hoster;
  }
}
