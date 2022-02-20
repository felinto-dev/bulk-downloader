import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma.service';

@Injectable()
export class HostersLimitsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countHosterDownloadAttempts(hosterId: string) {
    return {
      thisHour: await this.countHosterDownloadsAttemptsDidAfter(
        hosterId,
        DateTime.now().set({ minute: 0, second: 0 }).toISO(),
      ),
      thisDay: await this.countHosterDownloadsAttemptsDidAfter(
        hosterId,
        DateTime.now().set({ hour: 0, minute: 0, second: 0 }).toISO(),
      ),
      thisMonth: await this.countHosterDownloadsAttemptsDidAfter(
        hosterId,
        DateTime.now().set({ day: 1, hour: 0, minute: 0, second: 0 }).toISO(),
      ),
    };
  }

  private async countHosterDownloadsAttemptsDidAfter(
    hosterId: string,
    date: string,
  ) {
    return this.prisma.downloadRequestAttempt.count({
      where: {
        hosterId,
        createdAt: {
          gte: date,
        },
      },
    });
  }
}
