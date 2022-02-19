import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

import queueConfig from '@/configs/queue.config';
import { DownloadsController } from '@/controllers/downloads.controller';
import { DOWNLOADS_REQUESTS_QUEUE } from '@/consts/queues';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      cache: true,
      expandVariables: true,
      isGlobal: true,
      load: [queueConfig],
    }),
    BullModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('queue.host'),
          port: +configService.get('queue.port'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: DOWNLOADS_REQUESTS_QUEUE,
    }),
  ],
  controllers: [DownloadsController],
})
export class AppModule {}
