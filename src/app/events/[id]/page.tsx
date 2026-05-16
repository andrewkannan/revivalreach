import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MapPin, Navigation, MessageCircle, Info, Calendar as CalendarIcon, Users, User as UserIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import JoinButton from "./JoinButton"; // We will extract the join logic to a client component

export const dynamic = 'force-dynamic';

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      _count: {
        select: { participants: true }
      }
    }
  });

  if (!event) {
    return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Event not found</div>;
  }

  const settings = await prisma.systemSettings.findUnique({
    where: { id: "singleton" }
  });
  
  const defaultWhatsappMsg = settings?.whatsappTemplate || "Hi, I'm interested in the event...";
  const date = new Date(event.date);

  // We serialize the event to pass to the client component
  const serializedEvent = JSON.parse(JSON.stringify(event));

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%', color: 'white' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '20px', textDecoration: 'none', fontWeight: 600 }}>
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>

      <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '10px' }}>{event.title}</h1>
          
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', opacity: 0.9 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CalendarIcon size={16} color="var(--primary)" /> 
              {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} color="var(--primary)" /> 
              {event._count.participants} Participants
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <MapPin size={18} color="var(--primary)" style={{ marginTop: '2px' }} />
            <div>
              <strong style={{ display: 'block', opacity: 0.7, fontSize: '0.85rem', textTransform: 'uppercase' }}>Location</strong>
              <span style={{ fontSize: '1.1rem' }}>{event.location}</span>
            </div>
          </div>

          {event.meetingPoint && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Info size={18} color="var(--primary)" style={{ marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', opacity: 0.7, fontSize: '0.85rem', textTransform: 'uppercase' }}>Meeting Point</strong>
                <span style={{ fontSize: '1.1rem' }}>{event.meetingPoint}</span>
              </div>
            </div>
          )}

          {event.leaderName && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <UserIcon size={18} color="var(--primary)" style={{ marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', opacity: 0.7, fontSize: '0.85rem', textTransform: 'uppercase' }}>Revival Leaders</strong>
                <span style={{ fontSize: '1.1rem' }}>{event.leaderName}</span>
              </div>
            </div>
          )}
        </div>

        {event.remarks && (
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Special Remarks</h3>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', lineHeight: 1.6 }}>
              {event.remarks}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '10px' }}>
          {event.googleMapsLink && (
            <a href={event.googleMapsLink} target="_blank" rel="noreferrer" style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', color: 'white', fontWeight: 500 }}>
              <MapPin size={18} /> Open in Google Maps
            </a>
          )}
          {event.wazeLink && (
            <a href={event.wazeLink} target="_blank" rel="noreferrer" style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', color: 'white', fontWeight: 500 }}>
              <Navigation size={18} /> Open in Waze
            </a>
          )}
          {event.whatsappLink && (
            <a href={`${event.whatsappLink}?text=${encodeURIComponent(defaultWhatsappMsg)}`} target="_blank" rel="noreferrer" style={{ padding: '12px', background: '#25D366', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', color: 'white', fontWeight: 500 }}>
              <MessageCircle size={18} /> Contact Leader
            </a>
          )}
        </div>

        <div style={{ marginTop: '20px' }}>
          <JoinButton event={serializedEvent} />
        </div>
      </div>
    </div>
  );
}
