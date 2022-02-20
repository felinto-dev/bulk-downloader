import { PrismaClient } from '@prisma/client';
import { hosters } from './hosters';
const prisma = new PrismaClient();

async function main() {
  const transactions = [];

  transactions.push(
    ...hosters.map((hoster) => {
      return prisma.hoster.upsert({
        where: { id: hoster.id },
        update: {},
        create: hoster,
      });
    }),
  );

  await prisma.$transaction(transactions);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
