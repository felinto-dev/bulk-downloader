import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DownloadsLogger {
  private readonly logger: Logger = new Logger(DownloadsLogger.name);

  async pullDownloadsForAllHosters(hosters: { id: string }[]) {
    if (hosters.length >= 1) {
      this.logger.log(
        `Pulling downloads from database to queue from ${
          hosters.length
        } hosters: ${hosters.map((hoster) => hoster.id).join(', ')}`,
      );
    }
  }

  async pullDownloadsByHoster(
    hosterId: string,
    quotaLeft: number,
    jobs: { downloadId: string; url: string }[],
  ) {
    this.logger.log(`Adding download jobs for hoster id "${hosterId}":`);

    if (jobs.length >= 1) {
      this.logger.log({
        hosterId,
        quotaLeft,
        jobs: jobs.map((job) => ({ downloadId: job.downloadId, url: job.url })),
      });
    } else {
      this.logger.warn(
        `There are no more downloads available for hoster id "${hosterId}", so the spot will be offered to another hoster.`,
      );
    }
  }
}
