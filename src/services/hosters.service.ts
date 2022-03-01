import { Injectable, Logger } from '@nestjs/common';

import { HostersRepository } from '@/repositories/hosters.repository';
import { HostersLimitsService } from './hosters-limits.service';
import { releaseAtDateFrame } from '@/consts/release-at-date-frame';
import { checkIfNumberExistsInObjectValues } from '@/utils/objects';
import { HosterLimits } from '@/interfaces/hoster-limits';
import { HosterReadyToPull } from '@/interfaces/hoster-ready-to-pull.interface';

@Injectable()
export class HostersService {
  constructor(
    private readonly hostersRepository: HostersRepository,
    private readonly hosterLimitsService: HostersLimitsService,
  ) {}

  private readonly logger: Logger = new Logger(HostersService.name);

  private isTheHosterLimitQuotaEmpty(hosterLimits: HosterLimits): boolean {
    return checkIfNumberExistsInObjectValues(hosterLimits, 0);
  }

  async findHosterReadyToPull(): Promise<HosterReadyToPull> {
    const hoster = await this.hostersRepository.findHosterToPull();

    if (!hoster) {
      return null;
    }

    const hosterLimits =
      await this.hosterLimitsService.listHosterLimitsQuotaLeft(hoster.id);

    const releaseAt = this.calculateReleaseAtDateFrame(hosterLimits);
    await this.hostersRepository.updateReleaseAt(hoster.id, releaseAt);
    this.logger.verbose(
      `${hoster.id} will be released at ${releaseAt.toISOString()} for pull`,
    );

    return this.isTheHosterLimitQuotaEmpty(hosterLimits)
      ? this.findHosterReadyToPull()
      : hoster;
  }

  private calculateReleaseAtDateFrame(hosterLimits: HosterLimits): Date {
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
