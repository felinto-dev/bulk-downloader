import { ConfigModuleOptions } from '@nestjs/config';

import queueConfig from './queue.config';

export const configModuleConfig: ConfigModuleOptions = {
  ignoreEnvFile: true,
  cache: true,
  expandVariables: true,
  isGlobal: true,
  load: [queueConfig],
};
