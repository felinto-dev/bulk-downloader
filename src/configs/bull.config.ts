import { DOWNLOADS_QUEUE, DOWNLOADS_REQUESTS_QUEUE } from '@/consts/queues';
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
    name: DOWNLOADS_QUEUE,
  }),
  BullModule.registerQueue({
    name: DOWNLOADS_REQUESTS_QUEUE,
  }),
];
