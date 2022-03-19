import { GLOBAL_DOWNLOADS_CONCURRENCY } from '@/consts/app';
import { HosterAuthenticationMethod } from '@prisma/client';
import { Type } from 'class-transformer';
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
