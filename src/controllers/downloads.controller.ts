import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Controller, Post } from '@nestjs/common';

import { DOWNLOADS_QUEUE } from '@/consts/queues';

@Controller('downloads')
export class DownloadsController {
  constructor(
    @InjectQueue(DOWNLOADS_QUEUE) private downloadsRequestQueue: Queue,
  ) {}

  @Post()
  requestDownload() {
    return this.downloadsRequestQueue.add({
      url: 'https://speed.hetzner.de/1GB.bin',
    });
  }
}
