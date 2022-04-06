import { ScheduleDownloadInput } from '@/inputs/schedule-download.input';
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async scheduleDownloadRequest(
    @Body() downloadRequest: ScheduleDownloadInput,
  ) {
    await this.downloadsRequestsService.upsertDownloadRequest(downloadRequest);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.NO_CONTENT)
  async scheduleBulkDownloadRequestByRestApi(
    @Body(new ParseArrayPipe({ items: ScheduleDownloadInput }))
    downloadRequests: ScheduleDownloadInput[],
  ) {
    await this.downloadsRequestsService.upsertBulkDownloadRequest(
      downloadRequests,
    );
  }

  @MessagePattern({ cmd: 'schedule-bulk-downloads' })
  async scheduleBulkDownloadRequestByRMQ(
    @Payload(new ParseArrayPipe({ items: ScheduleDownloadInput }))
    downloadsRequests: ScheduleDownloadInput[],
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
