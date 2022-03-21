import { Provider } from '@nestjs/common';
import { NodeJsFileDownloader } from './download-client/nodejs-file-downloader.service';
import { DOWNLOAD_CLIENT } from './tokens';

export const ADAPTERS: Provider[] = [
  {
    provide: DOWNLOAD_CLIENT,
    useClass: NodeJsFileDownloader,
  },
];
