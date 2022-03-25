import { PendingDownload } from '@/database/interfaces/pending-download';
import { AddDownloadRequestInput } from '@/inputs/add-download-request.input';
import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { DownloadStatus, HosterAuthenticationMethod } from '@prisma/client';

@Injectable()
export class DownloadsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertDownloadRequest(downloadRequest: AddDownloadRequestInput) {
    const foundDownload = await this.prisma.download.findUnique({
      where: {
        downloadIdByHoster: {
          downloadId: downloadRequest.downloadId,
          hosterId: downloadRequest.hosterId,
        },
      },
    });

    if (!foundDownload) {
      return this.addDownloadRequest(downloadRequest);
    }

    if (foundDownload.fingerprint !== downloadRequest.fingerprint) {
      await this.prisma.download.update({
        where: {
          downloadIdByHoster: {
            downloadId: downloadRequest.downloadId,
            hosterId: downloadRequest.hosterId,
          },
        },
        data: {
          status: DownloadStatus.PENDING,
          fingerprint: downloadRequest.fingerprint,
          priority: downloadRequest.priority,
        },
      });
    }
  }

  private async addDownloadRequest(downloadRequest: AddDownloadRequestInput) {
    return this.prisma.download.create({
      data: {
        url: downloadRequest.url,
        downloadId: downloadRequest.downloadId,
        fingerprint: downloadRequest.fingerprint,
        priority: downloadRequest.priority,
        Hoster: {
          connectOrCreate: {
            where: { id: downloadRequest.hosterId },
            create: {
              id: downloadRequest.hosterId,
              name: downloadRequest.hosterId,
              authenticationMethod: HosterAuthenticationMethod.FREE,
            },
          },
        },
      },
    });
  }

  async countNotPendingDownloads() {
    return this.prisma.download.count({
      where: {
        status: {
          not: 'PENDING',
        },
      },
    });
  }

  async getPendingDownloadsByHosterId(
    id: string,
    limit?: number,
  ): Promise<PendingDownload[]> {
    return this.prisma.download.findMany({
      where: { hosterId: id, status: 'PENDING' },
      orderBy: [{ priority: 'desc' }],
      take: limit,
      select: { url: true, downloadId: true, hosterId: true },
    });
  }

  async changeDownloadStatus(
    downloadId: string,
    hosterId: string,
    newDownloadStatus: DownloadStatus,
  ) {
    await this.prisma.download.update({
      where: {
        downloadIdByHoster: {
          downloadId,
          hosterId,
        },
      },
      data: {
        status: newDownloadStatus,
      },
    });
  }
}
