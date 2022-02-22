import { DownloadStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma.service';
import { HostersLimitsRepository } from './hosters-limit.repository';
import { subtractObjects } from '@/utils/objects';

@Injectable()
export class HostersRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hostersLimitsRepository: HostersLimitsRepository,
  ) {}

  getInactiveHosters() {
    return this.prisma.hoster.findMany({
      where: {
        downloads: {
          none: {
            status: DownloadStatus.DOWNLOADING,
          },
        },
      },
      select: {
        id: true,
        concurrency: true,
        limits: {
          select: {
            hourly: true,
            daily: true,
            monthly: true,
          },
        },
      },
    });
  }

  async getHosterQuotaLeft(hosterId: string) {
    return subtractObjects(
      await this.hostersLimitsRepository.getHosterLimits(hosterId),
      await this.hostersLimitsRepository.countHosterDownloadAttempts(hosterId),
    );
  }
}
