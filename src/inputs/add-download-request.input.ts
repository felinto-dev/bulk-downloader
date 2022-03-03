import { IsUrl, Matches, Validate } from 'class-validator';

import { HosterExistsRule } from '@/validators/hoster-exists.validator';

export class AddDownloadRequestInput {
  @IsUrl()
  url: string;

  @Matches(/^([a-z0-9-_]+)$/)
  @Validate(HosterExistsRule)
  hosterId: string;

  @Matches(/^([a-z0-9-_]+)$/)
  downloadId: string;

  fingerprint: string;
}
