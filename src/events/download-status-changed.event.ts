export class DownloadStatusChangedEvent {
  hosterId: string;
  downloadId: string;
}

export enum DownloadStatusEvent {
  STARTED = 'download.started',
  FAILED = 'download.failed',
  FINISHED = 'download.finished',
}
