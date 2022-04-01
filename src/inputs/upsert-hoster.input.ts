import { MAX_CONCURRENT_DOWNLOADS_ALLOWED } from '@/consts/app';
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
import { HosterQuotas } from '../dto/hoster-quotas.dto';

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
  @Max(MAX_CONCURRENT_DOWNLOADS_ALLOWED)
  @IsNumber()
  concurrencyConnections: number;

  /** Limits for the hoster (e.g. max. downloads allowed per day) */
  @IsDefined()
  @ValidateNested()
  @Type(() => HosterQuotas)
  limits: HosterQuotas;

  /** Authentication method for the hoster (e.g. "basic") */
  @IsEnum(HosterAuthenticationMethod)
  credentialsStrategy: HosterAuthenticationMethod;
}
