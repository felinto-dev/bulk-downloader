import { HosterReadyToPull } from '@/database/interfaces/hoster-ready-to-pull.interface';
import { UpsertHosterInput } from '@/inputs/upsert-hoster.input';
import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { DownloadStatus } from '@prisma/client';
import { DateTime } from 'luxon';

@Injectable()
export class HostersRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsertHoster(hoster: UpsertHosterInput) {
    return this.prisma.hoster.upsert({
      where: { hosterId: hoster.id },
      create: {
        hosterId: hoster.id,
        hosterName: hoster.name,
        authenticationMethod: hoster.credentialsStrategy,
        maxConcurrentDownloads: hoster.concurrencyConnections,
        limits: {
          create: hoster.limits,
        },
      },
      update: {
        hosterName: hoster.name,
        maxConcurrentDownloads: hoster.concurrencyConnections,
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

  /*
		Algorithm name: "Fairly Fair"
	
		Finds a hoster ready to pull.
		A hoster is ready to pull if:
		- it has releaseAt lower than now
		- it has no downloads in progress
		- it has some download pending to be pulled

		Should prioritize:
		- hosters with lower concurrency
		- hosters with less downloads pending to be pulled

		This should help improve the performane because:
		- more downloads can be pulled at the same time by different hosters
		- less hosters have to wait for other hosters to release their downloads

		If no hoster is ready to pull, returns null.
	*/
  findHosterReadyToPullDownloads(): Promise<HosterReadyToPull> {
    return this.prisma.hoster.findFirst({
      where: {
        maxConcurrentDownloads: { gte: 1 },
        downloads: {
          some: { status: DownloadStatus.PENDING },
          none: { status: DownloadStatus.DOWNLOADING },
        },
        quotaRenewsAt: { lt: DateTime.now().toISO() },
      },
      orderBy: [
        { maxConcurrentDownloads: 'asc', downloads: { _count: 'asc' } },
      ],
      select: { hosterId: true, maxConcurrentDownloads: true },
    });
  }

  async updateReleaseAt(hosterId: string, newReleaseAt: Date) {
    await this.prisma.$transaction([
      this.prisma.hoster.update({
        where: { hosterId },
        data: { quotaRenewsAt: newReleaseAt },
      }),
    ]);
  }
}
