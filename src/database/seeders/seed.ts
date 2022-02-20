import { HosterAuthenticationMethod, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.hoster.upsert({
    where: { id: 'gplzone' },
    update: {},
    create: {
      id: 'gplzone',
      name: 'GPLZone',
      authenticationMethod: HosterAuthenticationMethod.FREE,
      limits: {
        daily: 50,
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
