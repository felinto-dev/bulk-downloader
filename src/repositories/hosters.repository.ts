import { Injectable } from '@nestjs/common';
import { DownloadStatus } from '@prisma/client';

import { PrismaService } from '@/prisma.service';

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
        },
      },
      select: {
        id: true,
        concurrency: true,
      },
    });
  }
}
