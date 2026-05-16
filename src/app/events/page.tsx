import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import DashboardClient from "../DashboardClient";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  // Fetch ONLY events the user has joined
  const participations = await prisma.eventParticipant.findMany({
    where: { userId: session.user.id },
    select: { eventId: true }
  });

  const joinedEventIds = participations.map(p => p.eventId);

  const events = await prisma.event.findMany({
    where: {
      id: { in: joinedEventIds }
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

  const settings = await prisma.systemSettings.findUnique({
    where: { id: "singleton" }
  });

  const serializedEvents = JSON.parse(JSON.stringify(events));
  const serializedSettings = JSON.parse(JSON.stringify(settings));

  // We can reuse the DashboardClient component, it will just display the filtered events.
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px', color: 'white' }}>My Events</h1>
      {events.length === 0 ? (
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>
          You haven't joined any events yet.
        </div>
      ) : (
        <DashboardClient initialEvents={serializedEvents} user={session.user} settings={serializedSettings} hideBanner={true} />
      )}
    </div>
  );
}
