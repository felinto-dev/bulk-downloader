import { validate } from '@/env.validation';
import { ConfigModuleOptions } from '@nestjs/config';
import appConfig from './app.config';

// TODO: Use TypeScript type-checking for configService using InjectKey()
export const configModuleConfig: ConfigModuleOptions = {
  ignoreEnvFile: true,
  cache: true,
  expandVariables: true,
  isGlobal: true,
  load: [appConfig],
  validate,
};
