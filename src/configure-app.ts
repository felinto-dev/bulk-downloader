import { INestApplication, ValidationPipe } from '@nestjs/common';

import { classValidatorConfig } from './configs/class-validator';

export const configureApp = (app: INestApplication) => {
  app.useGlobalPipes(new ValidationPipe(classValidatorConfig));
  app.enableShutdownHooks();
};
