export class DownloadJobDto {
  url: string;

  hosterId: string;

  downloadId: string;

  authorization?: string;

  // ⚠️ Needs to be in future!
  expires_at?: Date;
}
