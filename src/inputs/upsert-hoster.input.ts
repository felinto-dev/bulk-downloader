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

export class UpsertHosterInput {
  /** The unique ID for Hoster (e.g "wp.org") */
  @IsDefined()
  @Matches(/^([a-z0-9-_]+)$/)
  id: string;

  /** Name of the hoster (e.g. "wordpress.org") */
  @IsNotEmpty()
  name: string;

  /** how many concurrent downloads are allowed  */
  @Min(0)
  @Max(GLOBAL_DOWNLOADS_CONCURRENCY)
  @IsNumber()
  concurrencyConnections: number;

  /** Limits for the hoster (e.g. max. downloads allowed per day) */
  @IsDefined()
  @ValidateNested()
  @Type(() => HosterLimits)
  limits: HosterLimits;

  /** Authentication method for the hoster (e.g. "basic") */
  @IsEnum(HosterAuthenticationMethod)
  credentialsStrategy: HosterAuthenticationMethod;
}
