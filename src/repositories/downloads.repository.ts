import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma.service';

@Injectable()
export class DownloadsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPendingDownloadsByHosterId(id: string, limit?: number) {
    return this.prisma.download.findMany({
      where: { hosterId: id, status: 'PENDING' },
      take: limit,
    });
  }
}
