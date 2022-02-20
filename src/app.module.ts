import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';

import queueConfig from '@/configs/queue.config';
import { DOWNLOADS_QUEUE } from '@/consts/queues';
import { CONSUMERS } from '@/consumers';
import { CONTROLLERS } from '@/controllers';
import { SERVICES } from '@/services';
import { PrismaService } from './prisma.service';
import { REPOSITORIES } from './repositories';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      cache: true,
      expandVariables: true,
      isGlobal: true,
      load: [queueConfig],
    }),
    ScheduleModule.forRoot(),
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
      name: DOWNLOADS_QUEUE,
    }),
  ],
  controllers: [...CONTROLLERS],
  providers: [PrismaService, ...CONSUMERS, ...SERVICES, ...REPOSITORIES],
})
export class AppModule {}
