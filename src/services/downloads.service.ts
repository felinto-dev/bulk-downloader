import { PendingDownload } from '@/database/interfaces/pending-download';
import { DownloadsRepository } from '@/repositories/downloads.repository';
import { Injectable } from '@nestjs/common';
import { DownloadStatus } from '@prisma/client';

@Injectable()
export class DownloadsService {
  constructor(private readonly repository: DownloadsRepository) {}

  async findPendingDownload(): Promise<PendingDownload> {
    return this.repository.findPendingDownload();
  }

  async changeDownloadStatus(
    hosterId: string,
    downloadId: string,
    status: DownloadStatus,
  ) {
    await this.repository.changeDownloadStatus(hosterId, downloadId, status);
  }
}
