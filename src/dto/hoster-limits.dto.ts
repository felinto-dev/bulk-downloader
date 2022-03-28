import { IsNumber, IsOptional } from 'class-validator';

export class HosterLimits {
  @IsNumber()
  @IsOptional()
  monthlyDownloadLimit: number;

  @IsNumber()
  @IsOptional()
  dailyDownloadLimit: number;

  @IsNumber()
  @IsOptional()
  hourlyDownloadLimit: number;
}
