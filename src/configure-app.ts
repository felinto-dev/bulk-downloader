import { INestApplication } from '@nestjs/common';

export const configureApp = (app: INestApplication) => {
  app.enableShutdownHooks();
};
