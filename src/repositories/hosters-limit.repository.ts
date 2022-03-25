import { HosterLimits } from '@/dto/hoster-limits.dto';
import { PrismaService } from '@/prisma.service';
import { startOfDay, startOfHour, startOfMonth } from '@/utils/date';
import { Injectable } from '@nestjs/common';
import { PrismaPromise } from '@prisma/client';

@Injectable()
export class HostersLimitsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getHosterLimits(hosterId: string) {
    return this.prisma.hosterLimit.findUnique({
      where: { hosterId },
      select: { hourly: true, daily: true, monthly: true },
    });
  }

  countHosterDownloadsAttemptsByPeriod(
    hosterId: string,
    date: string,
  ): PrismaPromise<number> {
    return this.prisma.download.count({
      where: {
        status: { in: ['DOWNLOADING', 'FAILED', 'SUCCESS'] },
        Hoster: { id: hosterId },
        updatedAt: { gte: date },
      },
    });
  }

  async countHosterDownloadsAttempts(hosterId: string): Promise<HosterLimits> {
    const [monthly, daily, hourly] = await this.prisma.$transaction([
      this.countHosterDownloadsAttemptsByPeriod(hosterId, startOfMonth()),
      this.countHosterDownloadsAttemptsByPeriod(hosterId, startOfDay()),
      this.countHosterDownloadsAttemptsByPeriod(hosterId, startOfHour()),
    ]);
    return { monthly, daily, hourly };
  }
}
