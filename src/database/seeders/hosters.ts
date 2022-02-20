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
];
