import { IsNumber, IsOptional } from 'class-validator';

export class HosterLimits {
  @IsNumber()
  @IsOptional()
  monthly: number;

  @IsNumber()
  @IsOptional()
  daily: number;

  @IsNumber()
  @IsOptional()
  hourly: number;
}
