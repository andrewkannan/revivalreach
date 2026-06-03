import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('godisgoodallthetime', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: { passwordHash: hash, role: 'ADMIN', isApproved: true },
    create: { email: 'admin@admin.com', name: 'Admin', passwordHash: hash, role: 'ADMIN', isApproved: true }
  });
  console.log('Created Admin:', user.email);
}
main().catch(console.error).finally(() => prisma.$disconnect());
