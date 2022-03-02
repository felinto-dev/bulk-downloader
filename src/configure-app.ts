import { INestApplication, ValidationPipe } from '@nestjs/common';

export const configureApp = (app: INestApplication) => {
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableShutdownHooks();
};
