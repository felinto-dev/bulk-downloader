import { PendingDownload } from '@/database/interfaces/pending-download';
import { ScheduleDownloadInput } from '@/inputs/schedule-download.input';
import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { DownloadStatus, HosterAuthenticationMethod } from '@prisma/client';

@Injectable()
export class DownloadsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findNextDownload(): Promise<PendingDownload> {
    return this.prisma.download.findFirst({
      orderBy: [
        { Hoster: { maxConcurrentDownloads: 'asc' } },
        { priority: 'desc' },
      ],
      where: {
        status: DownloadStatus.PENDING,
        Hoster: { limits: { quotaRenewsAt: { lt: new Date() } } },
      },
    });
  }

  async upsertDownloadRequest(downloadRequest: ScheduleDownloadInput) {
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

  private async addDownloadRequest(downloadRequest: ScheduleDownloadInput) {
    return this.prisma.download.create({
      data: {
        url: downloadRequest.downloadUrl,
        downloadId: downloadRequest.downloadId,
        fingerprint: downloadRequest.fingerprint,
        priority: downloadRequest.priority,
        Hoster: {
          connectOrCreate: {
            where: { hosterId: downloadRequest.hosterId },
            create: {
              hosterId: downloadRequest.hosterId,
              hosterName: downloadRequest.hosterId,
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
