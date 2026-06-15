import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe('ALTER TABLE "Event" ADD COLUMN "slug" TEXT UNIQUE;');
  console.log('Done altering table.');
}
main().catch(console.error).finally(() => prisma.$disconnect());
