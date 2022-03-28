import { PrismaClient } from '@prisma/client';
import { downloads } from './downloads';
import { hosters } from './hosters';
const prisma = new PrismaClient();

async function main() {
  const hostersTransactions = [
    ...hosters.map((hoster) => {
      return prisma.hoster.upsert({
        where: { hosterId: hoster.hosterId },
        update: {},
        create: hoster,
      });
    }),
  ];

  const downloadsTransactions = [
    ...downloads.map((download) => {
      return prisma.download.upsert({
        where: {
          downloadIdByHoster: {
            downloadId: download.downloadId,
            hosterId: download.Hoster.connect.hosterId,
          },
        },
        update: {},
        create: download,
      });
    }),
  ];

  await prisma.$transaction([...hostersTransactions, ...downloadsTransactions]);
}

console.time('seeding duration');
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.timeEnd('seeding duration');
    await prisma.$disconnect();
  });
