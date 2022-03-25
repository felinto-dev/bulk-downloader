export interface DownloadParams {
  downloadUrl: string;
  saveLocation: string;
  retry?: number;
  onDownloadProgress?: { (downloadPercentage: number): Promise<void> };
}

export interface DownloadClientInterface {
  download(params: DownloadParams): Promise<void>;
}
