import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { DownloadStatus } from '@prisma/client';

import { PrismaService } from '@/prisma.service';

@Injectable()
export class HostersRepository {
  constructor(private readonly prisma: PrismaService) {}

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

    const hourlyAttemps = await this.countHosterHourlyAttempts(hosterId);
    const dailyAttemps = await this.countHosterDailyAttempts(hosterId);
    const monthlyAttemps = await this.countHosterMonthlyAttempts(hosterId);

    return {
      hourly: limits.hourly && limits.hourly - hourlyAttemps,
      daily: limits.daily && limits.daily - dailyAttemps,
      monthly: limits.monthly && limits.monthly - monthlyAttemps,
    };
  }

  countHosterHourlyAttempts(hosterId: string) {
    return this.prisma.downloadRequestAttempt.count({
      where: {
        hosterId,
        createdAt: {
          gte: DateTime.now().set({ minute: 0, second: 0 }).toISO(),
        },
      },
    });
  }

  countHosterDailyAttempts(hosterId: string) {
    return this.prisma.downloadRequestAttempt.count({
      where: {
        hosterId,
        createdAt: {
          gte: DateTime.now().set({ hour: 0, minute: 0, second: 0 }).toISO(),
        },
      },
    });
  }

  countHosterMonthlyAttempts(hosterId: string) {
    return this.prisma.downloadRequestAttempt.count({
      where: {
        hosterId,
        createdAt: {
          gte: DateTime.now()
            .set({ day: 1, hour: 0, minute: 0, second: 0 })
            .toISO(),
        },
      },
    });
  }
}
