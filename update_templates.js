const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const s = await prisma.systemSettings.findUnique({where: {id: 'singleton'}});
  if (s) {
    let t1 = s.emailTemplateApproved;
    let t2 = s.emailTemplateReset;
    if (t1) {
      t1 = t1.replace('Empowering the church to reach the world.', 'Season of territory expansion.').replace('Revival Reach. All rights reserved.', 'CCC Bilingual. All rights reserved.');
    }
    if (t2) {
      t2 = t2.replace('Empowering the church to reach the world.', 'Season of territory expansion.').replace('Revival Reach. All rights reserved.', 'CCC Bilingual. All rights reserved.');
    }
    await prisma.systemSettings.update({
      where: {id: 'singleton'},
      data: {emailTemplateApproved: t1, emailTemplateReset: t2}
    });
    console.log("Updated DB templates");
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
