import { Injectable } from '@nestjs/common';
import { DownloadStatus } from '@prisma/client';

import { PrismaService } from '@/prisma.service';
import { PendingDownload } from '@/database/interfaces/pending-download';
import { AddDownloadRequestInput } from '@/inputs/add-download-request.input';

@Injectable()
export class DownloadsRepository {
  constructor(private readonly prisma: PrismaService) {}

  addDownloadRequest(downloadRequest: AddDownloadRequestInput) {
    return this.prisma.download.create({
      data: {
        url: downloadRequest.url,
        downloadId: downloadRequest.downloadId,
        fingerprint: downloadRequest.fingerprint,
        Hoster: {
          connect: {
            id: downloadRequest.hosterId,
          },
        },
      },
    });
  }

  async addBulkDownloadRequest(downloadRequests: AddDownloadRequestInput[]) {
    const transactions = downloadRequests.map((downloadRequest) =>
      this.addDownloadRequest(downloadRequest),
    );
    await this.prisma.$transaction([...transactions]);
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
      orderBy: [{ priority: 'desc' }, { attemps: { _count: 'asc' } }],
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
