import { DownloadParams } from '@/interfaces/download-params.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Downloader from 'nodejs-file-downloader';

@Injectable()
export class DownloadsService {
  constructor(private readonly configService: ConfigService) {}

  async downloadFile(params: DownloadParams) {
    const downloader = new Downloader({
      url: params.url,
      directory: await this.configService.get('app.downloads_directory'),
      onProgress: async (downloadProgressPercentage) => {
        if (params.onDownloadProgress) {
          await params.onDownloadProgress(+downloadProgressPercentage);
        }
      },
    });
    return downloader.download();
  }
}
