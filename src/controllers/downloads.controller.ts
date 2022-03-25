import { ScheduleDownloadInput } from '@/inputs/schedule-download.input';
import { DownloadsService } from '@/services/downloads.service';
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
  constructor(private readonly downloadsService: DownloadsService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async scheduleDownloadRequest(
    @Body() downloadRequest: ScheduleDownloadInput,
  ) {
    await this.downloadsService.upsertDownloadRequest(downloadRequest);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.NO_CONTENT)
  async scheduleBulkDownloadRequestByRestApi(
    @Body(new ParseArrayPipe({ items: ScheduleDownloadInput }))
    downloadRequests: ScheduleDownloadInput[],
  ) {
    await this.downloadsService.upsertBulkDownloadRequest(downloadRequests);
  }

  @MessagePattern({ cmd: 'schedule-bulk-downloads' })
  async scheduleBulkDownloadRequestByRMQ(
    @Payload(new ParseArrayPipe({ items: ScheduleDownloadInput }))
    downloadsRequests: ScheduleDownloadInput[],
    @Ctx() context: RmqContext,
  ) {
    await this.downloadsService.upsertBulkDownloadRequest(downloadsRequests);

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }
}
