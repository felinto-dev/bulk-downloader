import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'redis',
        port: 6379,
      },
    }),
  ],
})
export class AppModule {}
