import { HosterAuthenticationMethod, Prisma } from '@prisma/client';

export const hosters: Prisma.HosterCreateInput[] = [
  {
    hosterId: 'gplzone',
    name: 'GPLZone',
    authenticationMethod: HosterAuthenticationMethod.FREE,
    concurrency: 1,
    limits: {
      create: {
        daily: 50,
      },
    },
  },
  {
    hosterId: 'file-examples.com',
    name: 'File-Examples.com',
    authenticationMethod: HosterAuthenticationMethod.FREE,
    concurrency: 1,
    limits: {
      create: {
        hourly: 1,
        daily: 10,
      },
    },
  },
  {
    hosterId: 'file-samples.com',
    name: 'File Samples',
    authenticationMethod: HosterAuthenticationMethod.FREE,
    concurrency: 1,
    limits: {
      create: {
        hourly: 10,
        daily: 10,
      },
    },
  },
  {
    hosterId: 'thinkbroadband.com',
    name: 'Think broad band',
    authenticationMethod: HosterAuthenticationMethod.FREE,
    concurrency: 1,
  },
];
