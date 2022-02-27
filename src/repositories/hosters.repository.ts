import { DateTime } from 'luxon';
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

  findProblematicHosters() {
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

  findHosterReadyToPull() {
    return this.prisma.hoster.findFirst({
      where: {
        concurrency: { gte: 1 },
        downloads: {
          some: {
            status: DownloadStatus.PENDING,
          },
          none: {
            status: DownloadStatus.DOWNLOADING,
          },
        },
        releaseAt: { lte: DateTime.now().toISO() },
      },
      orderBy: [
        { limits: { monthly: 'asc' } },
        { limits: { daily: 'asc' } },
        { limits: { hourly: 'asc' } },
        { concurrency: 'asc' },
      ],
      select: {
        id: true,
        concurrency: true,
      },
    });
  }

  async updateReleaseAt(hosterId: string, newReleaseAt: Date) {
    await this.prisma.$transaction([
      this.prisma.hoster.update({
        where: { id: hosterId },
        data: { releaseAt: newReleaseAt },
      }),
    ]);
  }
}
