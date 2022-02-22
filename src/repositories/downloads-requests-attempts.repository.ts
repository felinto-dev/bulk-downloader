import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma.service';

@Injectable()
export class DownloadsRequestsAttempts {
  constructor(private readonly prisma: PrismaService) {}

  // async addDownloadAttempt() {
  //   return this.prisma.downloadRequestAttempt.create({
  //     data: {
  //       Download: {
  //         connect: {
  //           downloadIdByHoster: {
  //             downloadId: null,
  //             hosterId: null,
  //           },
  //         },
  //       },
  //     },
  //   });
  // }
}
