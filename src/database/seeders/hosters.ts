import { HosterAuthenticationMethod, Prisma } from '@prisma/client';

export const hosters: Prisma.HosterCreateInput[] = [
  {
    hosterId: 'gplzone',
    hosterName: 'GPLZone',
    authenticationMethod: HosterAuthenticationMethod.FREE,
    maxConcurrentDownloads: 1,
    limits: {
      create: {
        daily: 50,
      },
    },
  },
  {
    hosterId: 'file-examples.com',
    hosterName: 'File-Examples.com',
    authenticationMethod: HosterAuthenticationMethod.FREE,
    maxConcurrentDownloads: 1,
    limits: {
      create: {
        hourly: 1,
        daily: 10,
      },
    },
  },
  {
    hosterId: 'file-samples.com',
    hosterName: 'File Samples',
    authenticationMethod: HosterAuthenticationMethod.FREE,
    maxConcurrentDownloads: 1,
    limits: {
      create: {
        hourly: 10,
        daily: 10,
      },
    },
  },
  {
    hosterId: 'thinkbroadband.com',
    hosterName: 'Think broad band',
    authenticationMethod: HosterAuthenticationMethod.FREE,
    maxConcurrentDownloads: 1,
  },
];
