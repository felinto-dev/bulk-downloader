import { PendingDownload } from '@/database/interfaces/pending-download';
import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { DownloadStatus } from '@prisma/client';

@Injectable()
export class PendingDownloadsIterator {
  constructor(private readonly prisma: PrismaService) {}

  async hasNext(): Promise<boolean> {
    return !!(await this.next());
  }

  async next(): Promise<PendingDownload> {
    return this.prisma.download.findFirst({
      orderBy: [
        { Hoster: { maxConcurrentDownloads: 'asc' } },
        { priority: 'desc' },
      ],
      where: {
        status: DownloadStatus.PENDING,
        // TODO: Not look for hosters that have reached their concurrency limit
        Hoster: { limits: { quotaRenewsAt: { lt: new Date() } } },
      },
      select: { url: true, downloadId: true, hosterId: true },
    });
  }
}
