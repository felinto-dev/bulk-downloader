import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  ParseArrayPipe,
  Post,
} from '@nestjs/common';

import { DownloadsService } from '@/services/downloads.service';
import { AddDownloadRequestInput } from '@/inputs/add-download-request.input';

@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  private readonly logger: Logger = new Logger(DownloadsController.name);

  @Post()
  addDownloadRequest(@Body() downloadRequest: AddDownloadRequestInput) {
    return this.downloadsService.addDownloadRequest(downloadRequest);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.NO_CONTENT)
  addBulkDownloadRequest(
    @Body(new ParseArrayPipe({ items: AddDownloadRequestInput }))
    downloadRequests: AddDownloadRequestInput[],
  ) {
    this.logger.verbose(
      `A bulk add download request with ${downloadRequests.length} valid items was received!`,
    );
    this.downloadsService.addBulkDownloadRequest(downloadRequests);
  }
}
