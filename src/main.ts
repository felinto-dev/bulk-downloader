import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { configureApp } from './configure';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(3000);
}
bootstrap();
