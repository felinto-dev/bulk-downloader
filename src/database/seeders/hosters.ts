import { Prisma, HosterAuthenticationMethod } from '@prisma/client';

export const hosters: Prisma.HosterCreateInput[] = [
  {
    id: 'gplzone',
    name: 'GPLZone',
    authenticationMethod: HosterAuthenticationMethod.FREE,
    limits: {
      daily: 50,
    },
  },
  {
    id: 'file-examples.com',
    name: 'File-Examples.com',
    authenticationMethod: HosterAuthenticationMethod.FREE,
    limits: {
      hourly: 1,
      daily: 10,
    },
  },
  {
    id: 'file-samples.com',
    name: 'File Samples',
    authenticationMethod: HosterAuthenticationMethod.FREE,
    limits: {
      hourly: 10,
      daily: 10,
    },
  },
  {
    id: 'thinkbroadband.com',
    name: 'Think broad band',
    authenticationMethod: HosterAuthenticationMethod.FREE,
    limits: {},
  },
];
