import { PrismaClient } from "../../prisma/generated/client/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL || "";

const globalForPrisma = global as unknown as { prisma: PrismaClient, adapter: PrismaPg };

if (!globalForPrisma.adapter) {
  globalForPrisma.adapter = new PrismaPg({
    connectionString,
    max: 15,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: globalForPrisma.adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
