import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Controller, Post } from '@nestjs/common';

import { DOWNLOADS_REQUESTS_QUEUE } from '@/consts/queues';

@Controller('downloads')
export class DownloadsController {
  constructor(
    @InjectQueue(DOWNLOADS_REQUESTS_QUEUE) private downloadsRequestQueue: Queue,
  ) {}

  @Post()
  requestDownload() {
    return this.downloadsRequestQueue.add('https://example.com/file.zip');
  }
}
