import { GLOBAL_DOWNLOADS_CONCURRENCY } from '@/consts/app';
import { HosterReadyToPull } from '@/database/interfaces/hoster-ready-to-pull.interface';
import { CreateHosterInput } from '@/inputs/create-hoster.input';
import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { DownloadStatus } from '@prisma/client';
import { DateTime } from 'luxon';

@Injectable()
export class HostersRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsertHoster(hoster: CreateHosterInput) {
    return this.prisma.hoster.upsert({
      where: { id: hoster.id },
      create: {
        id: hoster.id,
        name: hoster.name,
        authenticationMethod: hoster.credentialsStrategy,
        concurrency: hoster.concurrencyConnections,
        limits: {
          create: hoster.limits,
        },
      },
      update: {
        name: hoster.name,
        concurrency: hoster.concurrencyConnections,
        limits: {
          upsert: {
            create: hoster.limits,
            update: hoster.limits,
          },
        },
      },
      include: { limits: true },
    });
  }

  getHosterById(hosterId: string) {
    return this.prisma.hoster.findUnique({
      where: { id: hosterId },
      select: { concurrency: true },
      rejectOnNotFound: true,
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

  findHosterToPull(): Promise<HosterReadyToPull> {
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
