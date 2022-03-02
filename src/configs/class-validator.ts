import { ValidationPipeOptions } from '@nestjs/common';

export const classValidatorConfig: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
};
