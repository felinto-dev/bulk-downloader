import { Injectable } from '@nestjs/common';
import { DownloadStatus } from '@prisma/client';

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
    const { limits } = await this.prisma.hoster.findUnique({
      where: { id: hosterId },
      select: {
        limits: { select: { hourly: true, daily: true, monthly: true } },
      },
    });

    const downloadAttemps =
      await this.hostersLimitsRepository.countHosterDownloadAttempts(hosterId);

    return {
      hourly: limits.hourly && limits.hourly - downloadAttemps.hourly,
      daily: limits.daily && limits.daily - downloadAttemps.daily,
      monthly: limits.monthly && limits.monthly - downloadAttemps.monthly,
    };
  }
}
