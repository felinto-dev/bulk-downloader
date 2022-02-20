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
    const dailyCount = await this.prisma.download.count({
      where: {
        Hoster: { id: hosterId },
        status: {
          not: 'PENDING',
        },
      },
    });

    console.log(hoster.limits);
    console.log({
      daily: dailyCount,
    });
  }
}
