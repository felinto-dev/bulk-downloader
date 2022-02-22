import { DownloadStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma.service';

@Injectable()
export class HostersRepository {
  constructor(private readonly prisma: PrismaService) {}

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
        limits: {
          select: {
            hourly: true,
            daily: true,
            monthly: true,
          },
        },
      },
    });
  }
}
