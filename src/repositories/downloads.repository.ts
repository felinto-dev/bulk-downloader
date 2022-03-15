import { Injectable } from '@nestjs/common';
import { DownloadStatus, HosterAuthenticationMethod } from '@prisma/client';

import { PrismaService } from '@/prisma.service';
import { PendingDownload } from '@/database/interfaces/pending-download';
import { AddDownloadRequestInput } from '@/inputs/add-download-request.input';

@Injectable()
export class DownloadsRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsertDownloadRequest(downloadRequest: AddDownloadRequestInput) {
    return this.prisma.download.upsert({
      where: {
        downloadIdByHoster: {
          downloadId: downloadRequest.downloadId,
          hosterId: downloadRequest.hosterId,
        },
      },
      create: {
        url: downloadRequest.url,
        downloadId: downloadRequest.downloadId,
        fingerprint: downloadRequest.fingerprint,
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
      update: {
        // FIX: Should change download status for PENDING again!
        fingerprint: downloadRequest.fingerprint,
      },
    });
  }

  async addBulkDownloadRequest(downloadRequests: AddDownloadRequestInput[]) {
    const transactions = downloadRequests.map((downloadRequest) =>
      this.upsertDownloadRequest(downloadRequest),
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
