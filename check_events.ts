import { PrismaClient } from "./prisma/generated/client/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || "",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const events = await prisma.event.findMany({
    where: {
      date: {
        gte: today,
      },
      status: "APPROVED"
    }
  });

  console.log("Upcoming Approved Events:");
  console.log(events);

  const allEvents = await prisma.event.findMany();
  console.log("All Events:", allEvents.length);
  console.log("Event details:", allEvents);
}

main().catch(console.error).finally(() => prisma.$disconnect());
