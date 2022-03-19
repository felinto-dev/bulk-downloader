import {
	IsNumber,
	IsOptional,
	IsUrl,
	Matches
} from 'class-validator';

export class AddDownloadRequestInput {
  @IsUrl()
  url: string;

  @Matches(/^([a-z0-9-_]+)$/)
  hosterId: string;

  @Matches(/^([a-z0-9-_]+)$/)
  downloadId: string;

  fingerprint: string;

  @IsNumber()
  @IsOptional()
  priority?: number;
}
