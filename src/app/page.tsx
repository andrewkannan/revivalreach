import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    const session = await getServerSession(authOptions);

    // Get midnight of today in local time
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch upcoming events from DB
    const events = await prisma.event.findMany({
      where: {
        date: {
          gte: today,
        },
        status: "APPROVED"
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
  } catch (error: any) {
    return (
      <div style={{ padding: '50px', maxWidth: '800px', margin: '0 auto', fontFamily: 'monospace' }}>
        <h1 style={{ color: '#ff4444' }}>Critical Error</h1>
        <p>Something is crashing the server. Show this to the developer:</p>
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '8px', overflowX: 'auto', marginTop: '20px' }}>
          <strong>Message:</strong> {error.message}
          <br /><br />
          <strong>Stack:</strong>
          <pre>{error.stack}</pre>
        </div>
      </div>
    );
  }
}
