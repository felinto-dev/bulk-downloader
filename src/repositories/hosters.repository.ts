import { DownloadStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma.service';
import { HostersLimitsRepository } from './hosters-limit.repository';

@Injectable()
export class HostersRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hostersLimitsRepository: HostersLimitsRepository,
  ) {}

  getInactiveHosters() {
    return this.prisma.hoster.findMany({
      where: {
        downloads: {
          none: {
            status: DownloadStatus.DOWNLOADING,
          },
        },
      },
      select: {
        id: true,
        concurrency: true,
        limits: {
          select: {
            hourly: true,
            daily: true,
            monthly: true,
          },
        },
      },
    });
  }

  async getHosterQuotaLeft(hosterId: string) {
    const hosterLimits = await this.prisma.hosterLimits.findUnique({
      where: { hosterId },
      select: { hourly: true, daily: true, monthly: true },
    });

    const downloadAttemps =
      await this.hostersLimitsRepository.countHosterDownloadAttempts(hosterId);

    return {
      hourly:
        hosterLimits.hourly && hosterLimits.hourly - downloadAttemps.hourly,
      daily: hosterLimits.daily && hosterLimits.daily - downloadAttemps.daily,
      monthly:
        hosterLimits.monthly && hosterLimits.monthly - downloadAttemps.monthly,
    };
  }
}
