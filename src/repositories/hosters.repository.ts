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
}
