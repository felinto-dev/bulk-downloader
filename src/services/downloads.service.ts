import * as path from 'path';
import { Injectable } from '@nestjs/common';
import Downloader from 'nodejs-file-downloader';

@Injectable()
export class DownloadsService {
  async download(
    url: string,
    updateDownloadProgressCb?: { (progress: number): Promise<void> },
  ) {
    const downloader = new Downloader({
      url,
      directory: path.join(process.cwd(), 'tmp'),
      onProgress: async (downloadProgressPercentage) => {
        if (updateDownloadProgressCb) {
          await updateDownloadProgressCb(+downloadProgressPercentage);
        }
      },
    });
    return downloader.download();
  }
}
