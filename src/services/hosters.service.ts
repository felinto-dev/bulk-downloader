import { Injectable } from '@nestjs/common';

import { HostersRepository } from '@/repositories/hosters.repository';
import { HostersLimitsService } from './hosters-limits.service';
import { releaseAtDateFrame } from '@/consts/release-at-date-frame';

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

    let releaseAtDuration: Date = releaseAtDateFrame['hourly'];

    for (const [dateFrame, limit] of Object.entries(hosterLimits)) {
      if (limit === 0) {
        releaseAtDuration = releaseAtDateFrame[dateFrame];
      }
    }

    if (Object.values(hosterLimits).some((limit: number) => limit === 0)) {
      return this.findHosterReadyToPull();
    }

    await this.hostersRepository.updateReleaseAt(hoster.id, releaseAtDuration); // should dont be executed on hourly concurrent cron
    return hoster;
  }
}
