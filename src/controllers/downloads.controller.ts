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
  async upsertDownloadRequest(
    @Body() downloadRequest: AddDownloadRequestInput,
  ) {
    this.logger.verbose(
      `New add download request was received:\n${JSON.stringify(
        downloadRequest,
      )}`,
    );
    await this.downloadsService.upsertDownloadRequest(downloadRequest);
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
    // TODO: Disable support for add bulk requests
    // this.downloadsService.addBulkDownloadRequest(downloadRequests);
  }
}
