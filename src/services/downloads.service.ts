import { ConfigService } from '@nestjs/config';
import Downloader from 'nodejs-file-downloader';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { DownloadParams } from '@/interfaces/download-params.interface';
import { AddDownloadRequestInput } from '@/inputs/add-download-request.input';
import { DownloadsRepository } from '@/repositories/downloads.repository';

@Injectable()
export class DownloadsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly downloadsRepository: DownloadsRepository,
  ) {}

  private readonly logger: Logger = new Logger(DownloadsService.name);

  async upsertDownloadRequest(download: AddDownloadRequestInput) {
    this.logger.verbose(
      `New add download request was received:\n${JSON.stringify(download)}`,
    );
    await this.downloadsRepository.upsertDownloadRequest(download);
  }

  async upsertBulkDownloadRequest() {
    throw new InternalServerErrorException('Method not implemented!');
  }

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
