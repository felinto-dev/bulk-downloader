import * as path from 'path';
import { Injectable } from '@nestjs/common';
import Downloader from 'nodejs-file-downloader';

import { DownloadParams } from '@/interfaces/download-params.interface';

@Injectable()
export class DownloadsService {
  async download(params: DownloadParams) {
    const downloader = new Downloader({
      url: params.url,
      directory: path.join(process.cwd(), 'tmp'),
      onProgress: async (downloadProgressPercentage) => {
        if (params.onDownloadProgress) {
          await params.onDownloadProgress(+downloadProgressPercentage);
        }
      },
    });
    return downloader.download();
  }
}
