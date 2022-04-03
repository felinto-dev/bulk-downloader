import { UpsertHosterInput } from '@/inputs/upsert-hoster.input';
import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';

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

  getMaxConcurrentDownloads(hosterId: string) {
    return this.prisma.hoster.findUnique({
      where: { hosterId },
      select: { maxConcurrentDownloads: true },
    });
  }
}
