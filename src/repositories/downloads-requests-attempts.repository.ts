import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma.service';

@Injectable()
export class DownloadsRequestsAttemptsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async addDownloadAttempt(downloadId: string, hosterId: string) {
    const addDownloadAttempt = this.prisma.downloadRequestAttempt.create({
      data: {
        Download: {
          connect: {
            downloadIdByHoster: {
              downloadId,
              hosterId,
            },
          },
        },
        // TODO: Check why I need to connect to hoster twice
        Hoster: {
          connect: {
            id: hosterId,
          },
        },
      },
    });

    const changeStatusToDownloading = this.prisma.download.update({
      where: {
        downloadIdByHoster: {
          downloadId,
          hosterId,
        },
      },
      data: {
        status: 'DOWNLOADING',
      },
    });

    await this.prisma.$transaction([
      addDownloadAttempt,
      changeStatusToDownloading,
    ]);
  }
}
