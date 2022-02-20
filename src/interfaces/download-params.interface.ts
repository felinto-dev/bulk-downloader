export interface DownloadParams {
  url: string;
  onDownloadProgress?: { (progress: number): Promise<void> };
}
