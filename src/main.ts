import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { name } from '../package.json';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ bodyLimit: 1048576 * 50 }), // 50 MB
  );
  configureApp(app);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RMQ_URI],
      queue: name,
      noAck: false,
      queueOptions: { durable: true },
    },
  });
  await app.startAllMicroservices();
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
