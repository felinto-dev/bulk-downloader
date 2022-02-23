import { Injectable } from '@nestjs/common';
import { DownloadStatus } from '@prisma/client';

import { PrismaService } from '@/prisma.service';
import { GLOBAL_DOWNLOADS_CONCURRENCY } from '@/consts/app';

@Injectable()
export class HostersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findHoster(hosterId: string) {
    return this.prisma.hoster.findUnique({
      where: { id: hosterId },
      select: { concurrency: true },
    });
  }

  getHosters() {
    return this.prisma.hoster.findMany({
      where: {
        downloads: {
          some: { status: 'FAILED' },
        },
      },
      select: {
        id: true,
        name: true,
        concurrency: true,
        _count: true,
        downloads: {
          where: {
            status: { in: ['PENDING', 'FAILED'] },
          },
          take: GLOBAL_DOWNLOADS_CONCURRENCY,
        },
        downloadsAttempts: {
          where: {
            logs: { not: null },
          },
        },
        limits: {
          select: {
            hourly: true,
            daily: true,
            monthly: true,
          },
        },
      },
      orderBy: [{ downloadsAttempts: { _count: 'desc' } }],
    });
  }

  findInactiveHosters() {
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
