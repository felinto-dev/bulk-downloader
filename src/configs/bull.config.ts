import {
  DOWNLOADS_ORCHESTRATING_QUEUE,
  DOWNLOADS_PROCESSING_QUEUE,
  DOWNLOADS_SORTING_QUEUE,
} from '@/consts/queues';
import { BullModule, SharedBullAsyncConfiguration } from '@nestjs/bull';
import { DynamicModule } from '@nestjs/common';

export const bullConfig: SharedBullAsyncConfiguration = {
  useFactory: async () => ({
    redis: {
      host: process.env.BULL_DB_HOST,
    },
  }),
};

export const BULL_QUEUES: DynamicModule[] = [
  BullModule.registerQueue({
    name: DOWNLOADS_PROCESSING_QUEUE,
  }),
  BullModule.registerQueue({
    name: DOWNLOADS_SORTING_QUEUE,
  }),
  BullModule.registerQueue({
    name: DOWNLOADS_ORCHESTRATING_QUEUE,
    defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
  }),
];
