import { Prisma } from '@prisma/client';

const hosterReadyToPull = Prisma.validator<Prisma.HosterArgs>()({
  select: { hosterId: true, concurrency: true },
});

export type HosterReadyToPull = Prisma.HosterGetPayload<
  typeof hosterReadyToPull
>;
