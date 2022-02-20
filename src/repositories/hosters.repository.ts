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
    const hoster = await this.prisma.hoster.findUnique({
      where: { id: hosterId },
      select: { limits: true },
    });

    // hourly

    // daily
    const dailyAttemps = await this.countHosterDailyAttempts(hosterId);

    console.log(hoster.limits);
    console.log({
      daily: dailyAttemps,
    });
  }

  countHosterDailyAttempts(hosterId: string) {
    return this.prisma.download.count({
      where: {
        Hoster: { id: hosterId },
        attemps: {
          none: {
            createdAt: {
              gte: DateTime.now().toISODate(),
            },
          },
        },
      },
    });
  }
}
