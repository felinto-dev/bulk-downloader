import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HosterAuthenticationMethod } from '@prisma/client';

import { GLOBAL_DOWNLOADS_CONCURRENCY } from '@/consts/app';
import { HosterLimits } from '../dto/hoster-limits.dto';

export class CreateHosterInput {
  @Matches(/^([a-z0-9-_]+)$/)
  id: string;

  @IsNotEmpty()
  name: string;

  @Min(0)
  @Max(GLOBAL_DOWNLOADS_CONCURRENCY)
  @IsNumber()
  concurrencyConnections: number;

  @IsDefined()
  @ValidateNested()
  @Type(() => HosterLimits)
  limits: HosterLimits;

  @IsEnum(HosterAuthenticationMethod)
  credentialsStrategy: HosterAuthenticationMethod;
}
