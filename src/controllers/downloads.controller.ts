import { AddDownloadRequestInput } from '@/inputs/add-download-request.input';
import { DownloadsRequestsService } from '@/services/downloads-requests.service';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  ParseArrayPipe,
  Post,
} from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

@Controller('downloads')
export class DownloadsController {
  constructor(
    private readonly downloadsRequestsService: DownloadsRequestsService,
  ) {}

  @Post()
  async upsertDownloadRequest(
    @Body() downloadRequest: AddDownloadRequestInput,
  ) {
    return this.downloadsRequestsService.upsertDownloadRequest(downloadRequest);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.NO_CONTENT)
  async addBulkDownloadRequest(
    @Body(new ParseArrayPipe({ items: AddDownloadRequestInput }))
    downloadRequests: AddDownloadRequestInput[],
  ) {
    await this.downloadsRequestsService.upsertBulkDownloadRequest(
      downloadRequests,
    );
  }

  @MessagePattern({ cmd: 'schedule-downloads-requests' })
  async addBulkDownloadRequestByRMQ(
    @Payload(new ParseArrayPipe({ items: AddDownloadRequestInput }))
    downloadsRequests: AddDownloadRequestInput[],
    @Ctx() context: RmqContext,
  ) {
    await this.downloadsRequestsService.upsertBulkDownloadRequest(
      downloadsRequests,
    );

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }
}
