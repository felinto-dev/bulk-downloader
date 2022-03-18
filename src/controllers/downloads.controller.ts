import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  ParseArrayPipe,
  Post,
} from '@nestjs/common';

import { DownloadsService } from '@/services/downloads.service';
import { AddDownloadRequestInput } from '@/inputs/add-download-request.input';

@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Post()
  async upsertDownloadRequest(
    @Body() downloadRequest: AddDownloadRequestInput,
  ) {
    return this.downloadsService.upsertDownloadRequest(downloadRequest);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.NO_CONTENT)
  async addBulkDownloadRequest(
    @Body(new ParseArrayPipe({ items: AddDownloadRequestInput }))
    downloadRequests: AddDownloadRequestInput[],
  ) {
    await this.downloadsService.upsertBulkDownloadRequest(downloadRequests);
  }
}
