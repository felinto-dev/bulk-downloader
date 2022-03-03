import { useContainer } from 'class-validator';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { classValidatorConfig } from './configs/class-validator';

export const configureApp = (app: INestApplication) => {
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(new ValidationPipe(classValidatorConfig));
  app.enableShutdownHooks();
};
