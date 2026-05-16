import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MapPin, Navigation, MessageCircle, Info, Calendar as CalendarIcon, Users, User as UserIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import JoinButton from "./JoinButton"; // We will extract the join logic to a client component

export const dynamic = 'force-dynamic';

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      participants: {
        include: {
          user: {
            select: { name: true, email: true, phone: true }
          }
        }
      },
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

  // Auto-generate fallback links for old events that don't have them
  const encodedLocation = encodeURIComponent(event.location);
  const mapsLink = event.googleMapsLink || `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  const wazeUrl = event.wazeLink || `https://waze.com/ul?q=${encodedLocation}`;

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
          <a href={mapsLink} target="_blank" rel="noreferrer" style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', color: 'white', fontWeight: 500 }}>
            <MapPin size={18} /> Open in Google Maps
          </a>
          
          <a href={wazeUrl} target="_blank" rel="noreferrer" style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', color: 'white', fontWeight: 500 }}>
            <Navigation size={18} /> Open in Waze
          </a>
          
          {event.whatsappGroupLink && (
            <a href={event.whatsappGroupLink} target="_blank" rel="noreferrer" style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', color: '#25D366', fontWeight: 500, gridColumn: '1 / -1' }}>
              <MessageCircle size={18} /> Join WhatsApp Group
            </a>
          )}
          
          {event.whatsappLink && (
            <a href={`${event.whatsappLink}?text=${encodeURIComponent(defaultWhatsappMsg)}`} target="_blank" rel="noreferrer" style={{ padding: '12px', background: '#25D366', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', color: 'white', fontWeight: 500, gridColumn: '1 / -1' }}>
              <MessageCircle size={18} /> Contact Leader
            </a>
          )}
        </div>

        <div style={{ marginTop: '20px' }}>
          <JoinButton event={serializedEvent} />
        </div>

        {/* Attendance List */}
        <div style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="var(--primary)" /> 
            Attendance List ({event.participants.length})
          </h3>
          
          {event.participants.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
              No one has joined yet. Be the first!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
              {event.participants.map((p: any, index: number) => (
                <div key={p.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {p.user.name ? p.user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.user.name || "Anonymous User"}</div>
                    {(session.user.role === 'ADMIN' || session.user.role === 'LEADER') && p.user.phone && (
                      <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{p.user.phone}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
