import Image from "next/image";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Fetch upcoming events from DB
  const events = await prisma.event.findMany({
    where: {
      date: {
        gte: new Date(),
      },
    },
    orderBy: {
      date: 'asc',
    },
    include: {
      _count: {
        select: { participants: true }
      }
    }
  });

  // Also fetch system settings for the whatsapp message
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "singleton" }
  });

  // Next.js cannot pass Date objects from Server to Client components.
  const serializedEvents = JSON.parse(JSON.stringify(events));
  const serializedSettings = JSON.parse(JSON.stringify(settings));

  return <DashboardClient initialEvents={serializedEvents} user={session?.user} settings={serializedSettings} />;
}
