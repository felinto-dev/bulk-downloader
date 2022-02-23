import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

import { CONSUMERS } from '@/consumers';
import { CONTROLLERS } from '@/controllers';
import { SERVICES } from '@/services';
import { PrismaService } from '@/prisma.service';
import { REPOSITORIES } from '@/repositories';
import { configModuleConfig } from '@/configs/config-module.config';
import { bullConfig, BULL_QUEUES } from '@/configs/bull.config';
import { ORCHESTRATORS } from './orchestrators';
import { SCHEDULES } from './schedulers';
import { LOGGERS } from './logger';

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
    ...CONSUMERS,
    ...SERVICES,
    ...REPOSITORIES,
    ...ORCHESTRATORS,
    ...SCHEDULES,
    ...LOGGERS,
  ],
})
export class AppModule {}
