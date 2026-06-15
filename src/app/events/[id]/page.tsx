import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MapPin, Navigation, MessageCircle, Info, Calendar as CalendarIcon, Users, User as UserIcon, ArrowLeft, Activity } from "lucide-react";
import Link from "next/link";
import JoinButton from "./JoinButton";
import AttendanceControls from "./AttendanceControls";
import EventShareButtons from "./EventShareButtons";

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
        select: { participants: true, souls: true }
      }
    }
  });

  if (!event) {
    return <div style={{ color: 'var(--foreground)', textAlign: 'center', padding: '50px' }}>Event not found</div>;
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
  const hasJoined = event.participants.some((p: any) => p.userId === session.user.id);
  const canViewSensitiveInfo = hasJoined || session.user.role === "ADMIN" || session.user.role === "LEADER";

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%', color: 'var(--foreground)' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '20px', textDecoration: 'none', fontWeight: 600 }}>
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>

      <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '10px' }}>{event.title}</h1>
          
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', opacity: 0.9 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CalendarIcon size={16} color="var(--primary)" /> 
              {date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} color="var(--primary)" /> 
              {event._count.participants} Participants
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontWeight: 600 }}>
              <Activity size={16} /> 
              {event._count.souls || 0} Engaged
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

          {canViewSensitiveInfo ? (
            <>
              {event.meetingPoint && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '16px' }}>
                  <Info size={18} color="var(--primary)" style={{ marginTop: '2px' }} />
                  <div>
                    <strong style={{ display: 'block', opacity: 0.7, fontSize: '0.85rem', textTransform: 'uppercase' }}>Meeting Point</strong>
                    <span style={{ fontSize: '1.1rem' }}>{event.meetingPoint}</span>
                  </div>
                </div>
              )}
            </>
          ) : null}

          {event.leaderName && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '16px' }}>
              <UserIcon size={18} color="var(--primary)" style={{ marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', opacity: 0.7, fontSize: '0.85rem', textTransform: 'uppercase' }}>Revival Leaders</strong>
                <span style={{ fontSize: '1.1rem' }}>
                  {event.whatsappLink ? (
                    <a href={`${event.whatsappLink}?text=${encodeURIComponent(defaultWhatsappMsg)}`} target="_blank" rel="noreferrer" style={{ color: 'var(--foreground)', textDecoration: 'underline', textDecorationColor: 'var(--primary)', textUnderlineOffset: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {event.leaderName}
                    </a>
                  ) : (
                    event.leaderName
                  )}
                </span>
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

        {canViewSensitiveInfo ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginTop: '10px' }}>
            <a href={mapsLink} target="_blank" rel="noreferrer" style={{ padding: '12px', background: 'var(--card-bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', color: 'var(--foreground)', fontWeight: 500, border: '1px solid var(--card-border)', textAlign: 'center' }}>
              <MapPin size={18} /> Google Maps
            </a>
            
            <a href={wazeUrl} target="_blank" rel="noreferrer" style={{ padding: '12px', background: 'var(--card-bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', color: 'var(--foreground)', fontWeight: 500, border: '1px solid var(--card-border)', textAlign: 'center' }}>
              <Navigation size={18} /> Waze
            </a>
            
            {event.whatsappGroupLink && (
              <a href={event.whatsappGroupLink} target="_blank" rel="noreferrer" style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', color: '#25D366', fontWeight: 500, textAlign: 'center' }}>
                <MessageCircle size={18} /> WhatsApp Group
              </a>
            )}
            
            {event.whatsappLink && (
              <a href={`${event.whatsappLink}?text=${encodeURIComponent(defaultWhatsappMsg)}`} target="_blank" rel="noreferrer" style={{ padding: '12px', background: '#25D366', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', color: 'white', fontWeight: 500, textAlign: 'center' }}>
                <MessageCircle size={18} /> Contact
              </a>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b', padding: '16px', borderRadius: '12px', textAlign: 'center', fontWeight: 500 }}>
              Join this revival to view the meeting point, map links, and WhatsApp group.
            </div>
            {event.whatsappGroupLink && (
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'rgba(255,255,255,0.3)', fontWeight: 500, cursor: 'not-allowed' }}>
                <MessageCircle size={18} /> Join WhatsApp Group
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          <JoinButton event={serializedEvent} initialHasJoined={hasJoined} />
        </div>

        {event.status === 'APPROVED' && (
          <EventShareButtons event={serializedEvent} />
        )}

        {/* Attendance List with Check-in Controls */}
        <AttendanceControls 
          eventId={event.id}
          eventTitle={event.title}
          initialParticipants={event.participants}
          canManage={session.user.role === 'ADMIN' || session.user.role === 'LEADER'}
          canViewSensitiveInfo={canViewSensitiveInfo}
        />

      </div>
    </div>
  );
}
