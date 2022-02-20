import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma.service';

@Injectable()
export class HostersLimitsRepository {
  constructor(private readonly prisma: PrismaService) {}

  countHosterHourlyAttempts(hosterId: string) {
    return this.prisma.downloadRequestAttempt.count({
      where: {
        hosterId,
        createdAt: {
          gte: DateTime.now().set({ minute: 0, second: 0 }).toISO(),
        },
      },
    });
  }

  countHosterDailyAttempts(hosterId: string) {
    return this.prisma.downloadRequestAttempt.count({
      where: {
        hosterId,
        createdAt: {
          gte: DateTime.now().set({ hour: 0, minute: 0, second: 0 }).toISO(),
        },
      },
    });
  }

  countHosterMonthlyAttempts(hosterId: string) {
    return this.prisma.downloadRequestAttempt.count({
      where: {
        hosterId,
        createdAt: {
          gte: DateTime.now()
            .set({ day: 1, hour: 0, minute: 0, second: 0 })
            .toISO(),
        },
      },
    });
  }
}
