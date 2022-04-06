import {
  DownloadClientInterface,
  DownloadParams,
} from '@/interfaces/download-client.interface';
import { Injectable } from '@nestjs/common';
import Downloader from 'nodejs-file-downloader';

@Injectable()
export class NodeJsFileDownloaderAdapter implements DownloadClientInterface {
  async download(params: DownloadParams) {
    const downloader = new Downloader({
      url: params.downloadUrl,
      directory: params.saveLocation,
      maxAttempts: params.retry,
      onProgress: (percentage) => params.onDownloadProgress(+percentage),
    });
    await downloader.download();
  }
}
