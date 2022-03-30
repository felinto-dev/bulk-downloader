import { nextQuotaRenewsByPeriod } from '@/consts/next-quota-renews-by-period';
import { HosterReadyToPull } from '@/database/interfaces/hoster-ready-to-pull.interface';
import { HosterQuotas } from '@/dto/hoster-quotas.dto';
import { UpsertHosterInput } from '@/inputs/upsert-hoster.input';
import { HostersRepository } from '@/repositories/hosters.repository';
import { checkIfNumberExistsInObjectValues } from '@/utils/objects';
import { Injectable, Logger } from '@nestjs/common';
import { HosterQuotasService } from './hoster-quotas.service';

@Injectable()
export class HostersService {
  constructor(
    private readonly hostersRepository: HostersRepository,
    private readonly hosterQuotaService: HosterQuotasService,
  ) {}

  private readonly logger: Logger = new Logger(HostersService.name);

  async upsertHoster(hoster: UpsertHosterInput) {
    return this.hostersRepository.upsertHoster(hoster);
  }

  private isTheHosterLimitQuotaEmpty(hosterLimits: HosterQuotas): boolean {
    return checkIfNumberExistsInObjectValues(hosterLimits, 0);
  }

  async findHosterReadyToPull(): Promise<HosterReadyToPull> {
    const hoster =
      await this.hostersRepository.findHosterReadyToPullDownloads();

    if (hoster) {
      const hosterLimits = await this.hosterQuotaService.listHosterQuotasLeft(
        hoster.hosterId,
      );

      const shouldReleaseAt = this.calculateReleaseAtDateFrame(hosterLimits);
      await this.hostersRepository.updateReleaseAt(
        hoster.hosterId,
        shouldReleaseAt,
      );
      this.logger.verbose(
        `Hoster ${hoster.hosterId} will be released at ${shouldReleaseAt}`,
      );

      return this.isTheHosterLimitQuotaEmpty(hosterLimits)
        ? this.findHosterReadyToPull()
        : hoster;
    }

    this.logger.verbose('No hoster ready to pull found');
    return null;
  }

  private calculateReleaseAtDateFrame(hosterLimits: HosterQuotas): Date {
    for (const [dateFrame, limit] of Object.entries(hosterLimits || {})) {
      if (limit === 0) {
        return nextQuotaRenewsByPeriod[dateFrame];
      }
    }

    // TODO: Avoid magic string
    // ⚠️ The goal is to prevent hoster from getting twice if this function is called concurrently.
    return nextQuotaRenewsByPeriod['hourly'];
  }
}
