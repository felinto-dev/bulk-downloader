import { Injectable } from '@nestjs/common';
import { DownloadStatus } from '@prisma/client';

import { PrismaService } from '@/prisma.service';
import { GLOBAL_DOWNLOADS_CONCURRENCY } from '@/consts/app';

@Injectable()
export class HostersRepository {
  constructor(private readonly prisma: PrismaService) {}

  getHoster(hosterId: string) {
    return this.prisma.hoster.findUnique({
      where: { id: hosterId },
      select: { concurrency: true },
    });
  }

  getInactiveHosters() {
    return this.prisma.hoster.findMany({
      where: {
        downloads: {
          none: {
            status: DownloadStatus.DOWNLOADING,
          },
          some: {
            status: DownloadStatus.PENDING,
          },
        },
      },
      orderBy: [
        {
          concurrency: 'desc',
        },
        {
          downloads: { _count: 'desc' },
        },
        {
          limits: { hourly: 'desc' },
        },
        {
          downloadsAttempts: { _count: 'asc' },
        },
      ],
      take: GLOBAL_DOWNLOADS_CONCURRENCY,
      select: {
        id: true,
        concurrency: true,
      },
    });
  }
}
