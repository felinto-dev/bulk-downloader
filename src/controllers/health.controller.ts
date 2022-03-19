import { DOWNLOADS_QUEUE } from '@/consts/queues';
import { DownloadsRequestsAttemptsRepository } from '@/repositories/downloads-requests-attempts.repository';
import { DownloadsRepository } from '@/repositories/downloads.repository';
import { HostersRepository } from '@/repositories/hosters.repository';
import { InjectQueue } from '@nestjs/bull';
import { Controller, Get } from '@nestjs/common';
import { Queue } from 'bull';

@Controller('health')
export class HealthController {
  constructor(
    @InjectQueue(DOWNLOADS_QUEUE) private readonly downloadsQueue: Queue,
    private readonly hostersRepository: HostersRepository,
    private readonly downloadsRepository: DownloadsRepository,
    private readonly downloadsRequestsAttempts: DownloadsRequestsAttemptsRepository,
  ) {}

  @Get()
  async health() {
    return {
      downloadsInProgress: (await this.downloadsQueue.getJobs(['active'])).map(
        (job) => ({
          data: job.data,
          progress: job.progress(),
          timestamp: job.timestamp,
        }),
      ),
      stats: {
        downloadsInProgress: await this.downloadsQueue.getActiveCount(),
        notPendingDownloads:
          await this.downloadsRepository.countNotPendingDownloads(),
        downloadsAttempts:
          await this.downloadsRequestsAttempts.countDownloadsAttempts(),
      },
      hosters: await this.hostersRepository.findProblematicHosters(),
    };
  }
}
