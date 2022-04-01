import { Prisma } from '@prisma/client';

const pendingDownload = Prisma.validator<Prisma.DownloadArgs>()({
  select: {
    url: true,
    downloadId: true,
    hosterId: true,
    Hoster: { select: { maxConcurrentDownloads: true } },
  },
});

export type PendingDownload = Prisma.DownloadGetPayload<typeof pendingDownload>;
