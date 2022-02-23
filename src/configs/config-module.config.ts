import { ConfigModuleOptions } from '@nestjs/config';

import { validate } from '@/env.validation';
import queueConfig from './queue.config';

// TODO: Use TypeScript type-checking for configService using InjectKey()
export const configModuleConfig: ConfigModuleOptions = {
  ignoreEnvFile: true,
  cache: true,
  expandVariables: true,
  isGlobal: true,
  load: [queueConfig],
  validate,
};
