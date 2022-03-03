import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Downloader from 'nodejs-file-downloader';

import { DownloadParams } from '@/interfaces/download-params.interface';
import { AddDownloadRequestInput } from '@/inputs/add-download-request.input';
import { DownloadsRepository } from '@/repositories/downloads.repository';

@Injectable()
export class DownloadsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly downloadsRepository: DownloadsRepository,
  ) {}

  async addDownloadRequest(download: AddDownloadRequestInput) {
    return this.downloadsRepository.addDownloadRequest(download);
  }

  async download(params: DownloadParams) {
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
