import { DOWNLOADS_REQUESTS_QUEUE } from '@/consts/queues';
import { AddDownloadRequestInput } from '@/inputs/add-download-request.input';
import { DownloadParams } from '@/interfaces/download-params.interface';
import { DownloadsRepository } from '@/repositories/downloads.repository';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bull';
import Downloader from 'nodejs-file-downloader';

@Injectable()
export class DownloadsService {
  constructor(
    @InjectQueue(DOWNLOADS_REQUESTS_QUEUE)
    private readonly queue: Queue<AddDownloadRequestInput>,
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

  async upsertBulkDownloadRequest(downloadRequests: AddDownloadRequestInput[]) {
    this.logger.verbose(
      `A bulk add download request with ${downloadRequests.length} valid items was received!`,
    );
    await this.queue.addBulk(
      downloadRequests.map((downloadRequest) => ({
        data: downloadRequest,
        opts: {
          jobId: `${downloadRequest.hosterId}/${downloadRequest.downloadId}`,
          removeOnComplete: true,
        },
      })),
    );
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
