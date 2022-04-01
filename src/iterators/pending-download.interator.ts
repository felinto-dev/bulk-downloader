import { PendingDownload } from '@/database/interfaces/pending-download';
import { DownloadsService } from '@/services/downloads.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PendingDownloadsIterator {
  constructor(private readonly downloadsService: DownloadsService) {}

  async hasMore(): Promise<boolean> {
    return !!this.next();
  }

  async next(): Promise<PendingDownload> {
    return this.downloadsService.findPendingDownload();
  }
}
