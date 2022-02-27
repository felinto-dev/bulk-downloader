import { Injectable } from '@nestjs/common';

import { HostersRepository } from '@/repositories/hosters.repository';
import { HostersLimitsService } from './hosters-limits.service';
import { releaseAtDateFrame } from '@/consts/release-at-date-frame';
import { checkValueExistsInObjectValues } from '@/utils/objects';

@Injectable()
export class HostersService {
  constructor(
    private readonly hostersRepository: HostersRepository,
    private readonly hosterLimitsService: HostersLimitsService,
  ) {}

  // Casos de parada:
  // 1. Hoster não encontrado
  // 2. Hoster sem limite definido
  //
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

    let releaseAtDuration: Date = releaseAtDateFrame['hourly']; // should dont be executed on hourly concurrent cron

    for (const [dateFrame, limit] of Object.entries(hosterLimits)) {
      if (limit === 0) {
        releaseAtDuration = releaseAtDateFrame[dateFrame];
      }
    }

    if (checkValueExistsInObjectValues(hosterLimits, 0)) {
      return this.findHosterReadyToPull();
    }

    await this.hostersRepository.updateReleaseAt(hoster.id, releaseAtDuration);
    return hoster;
  }
}
