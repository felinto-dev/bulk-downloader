import { Body, Controller, Post } from '@nestjs/common';

import { DownloadsService } from '@/services/downloads.service';
import { AddDownloadRequestInput } from '@/inputs/add-download-request.input';

@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Post()
  addDownloadRequest(@Body() downloadRequest: AddDownloadRequestInput) {
    return this.downloadsService.addDownloadRequest(downloadRequest);
  }
}
