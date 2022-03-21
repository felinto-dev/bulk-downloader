export interface DownloadParams {
  downloadUrl: string;
  saveLocation: string;
  maxAttempts?: number;
  onDownloadProgress?: { (downloadPercentage: number): Promise<void> };
}

export interface DownloadClientInterface {
  download(params: DownloadParams): Promise<void>;
}
