import { Prisma } from '@prisma/client';

const pendingDownload = Prisma.validator<Prisma.DownloadArgs>()({
  select: {
    url: true,
    downloadId: true,
    hosterId: true,
  },
});

export type PendingDownload = Prisma.DownloadGetPayload<typeof pendingDownload>;
