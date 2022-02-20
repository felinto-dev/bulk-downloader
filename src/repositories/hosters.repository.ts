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
            status: DownloadStatus.WAITING_DOWNLOAD,
          },
        },
      },
      select: {
        id: true,
        concurrency: true,
        limits: true,
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
        hosterLimits.hourly && hosterLimits.hourly - downloadAttemps.thisHour,
      daily: hosterLimits.daily && hosterLimits.daily - downloadAttemps.thisDay,
      monthly:
        hosterLimits.monthly &&
        hosterLimits.monthly - downloadAttemps.thisMonth,
    };
  }
}
