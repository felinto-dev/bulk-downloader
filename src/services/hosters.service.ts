import { Injectable, OnModuleInit } from '@nestjs/common';

import { HostersRepository } from '@/repositories/hosters.repository';
import { HostersLimitsService } from './hosters-limits.service';
import { releaseAtDateFrame } from '@/consts/release-at-date-frame';
import { checkIfNumberExistsInObjectValues } from '@/utils/objects';
import { HosterLimits } from '@/interfaces/hoster-limits';

@Injectable()
export class HostersService implements OnModuleInit {
  constructor(
    private readonly hostersRepository: HostersRepository,
    private readonly hosterLimitsService: HostersLimitsService,
  ) {}

  async onModuleInit() {
    console.log(await this.findHosterReadyToPull());
  }

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

    await this.hostersRepository.updateReleaseAt(
      hoster.id,
      this.calculateReleaseAtDateFrame(hosterLimits),
    );

    if (checkIfNumberExistsInObjectValues(hosterLimits, 0)) {
      return this.findHosterReadyToPull();
    }

    return hoster;
  }

  private calculateReleaseAtDateFrame(hosterLimits: HosterLimits) {
    for (const [dateFrame, limit] of Object.entries(hosterLimits || {})) {
      if (limit === 0) {
        return releaseAtDateFrame[dateFrame];
      }
    }

    // TODO: Avoid magic string
    // ⚠️ The goal is to prevent hoster from getting twice if this function is called concurrently.
    return releaseAtDateFrame['hourly'];
  }
}
