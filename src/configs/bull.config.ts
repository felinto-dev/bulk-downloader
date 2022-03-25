import {
  DOWNLOADS_PROCESSING_QUEUE,
  DOWNLOADS_SORTING_QUEUE,
} from '@/consts/queues';
import { BullModule, SharedBullAsyncConfiguration } from '@nestjs/bull';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
    name: DOWNLOADS_PROCESSING_QUEUE,
  }),
  BullModule.registerQueue({
    name: DOWNLOADS_SORTING_QUEUE,
  }),
];
