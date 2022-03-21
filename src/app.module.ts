import { bullConfig, BULL_QUEUES } from '@/configs/bull.config';
import { configModuleConfig } from '@/configs/config-module.config';
import { CONSUMERS } from '@/consumers';
import { CONTROLLERS } from '@/controllers';
import { PrismaService } from '@/prisma.service';
import { REPOSITORIES } from '@/repositories';
import { SERVICES } from '@/services';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { NodeJsFileDownloader } from './adapters/download-client/nodejs-file-downloader.service';
import { ORCHESTRATORS } from './orchestrators';
import { SCHEDULES } from './schedulers';
import { VALIDATORS } from './validators';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleConfig),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync(bullConfig),
    ...BULL_QUEUES,
  ],
  controllers: [...CONTROLLERS],
  providers: [
    PrismaService,
    {
      provide: 'DOWNLOAD_CLIENT',
      useClass: NodeJsFileDownloader,
    },
    ...CONSUMERS,
    ...SERVICES,
    ...REPOSITORIES,
    ...VALIDATORS,
    ...ORCHESTRATORS,
    ...SCHEDULES,
  ],
})
export class AppModule {}
