import { ConfigService } from '@nestjs/config';
import { DynamicModule } from '@nestjs/common';
import { BullModule, SharedBullAsyncConfiguration } from '@nestjs/bull';

import { DOWNLOADS_QUEUE } from '@/consts/queues';

export const bullConfig: SharedBullAsyncConfiguration = {
  useFactory: async (configService: ConfigService) => ({
    redis: {
      host: configService.get('queue.host'),
      port: +configService.get('queue.port'),
    },
  }),
  inject: [ConfigService],
};

export const BULL_QUEUES: DynamicModule[] = [
  BullModule.registerQueue({
    name: DOWNLOADS_QUEUE,
  }),
];
