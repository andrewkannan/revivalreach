"use client";
import { useState } from "react";
import styles from "./Dashboard.module.css";
import { Search, MapPin, Navigation, MessageCircle, Info, Calendar as CalendarIcon, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardClient({ initialEvents, user, settings, hideBanner = false }: { initialEvents: any[], user: any, settings: any, hideBanner?: boolean }) {
  const [events, setEvents] = useState(initialEvents);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const router = useRouter();

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleEvent = (id: string) => {
    if (expandedEventId === id) {
      setExpandedEventId(null);
    } else {
      setExpandedEventId(id);
    }
  };

  const handleJoin = async (eventObj: any) => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`/api/events/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: eventObj.id })
      });
      if (res.ok) {
        // Optimistically update participant count and join state
        setEvents(events.map(e => e.id === eventObj.id ? { 
          ...e, 
          _count: { participants: e._count.participants + 1 },
          participants: [{ id: "temp" }] 
        } : e));
        
        // Auto redirect to WhatsApp group if it exists
        if (eventObj.whatsappGroupLink) {
          window.open(eventObj.whatsappGroupLink, '_blank');
        } else {
          alert("Joined successfully!");
        }
      } else {
        const error = await res.json();
        alert(error.message || "Failed to join event");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  const defaultWhatsappMsg = settings?.whatsappTemplate || "Hi, I'm interested in the event...";

  return (
    <div className={styles.dashboard}>
      {!hideBanner ? (
        <>
          <div className={styles.searchBar}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={20} style={{ position: 'absolute', left: '16px', top: '14px', opacity: 0.5 }} />
              <input 
                type="text" 
                placeholder="Search events, locations..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '48px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
              Upcoming Revivals
              <span className={styles.blinkDot}></span>
            </h2>
            {(user?.role === 'ADMIN' || user?.role === 'LEADER') && (
              <button 
                className="btn-primary" 
                onClick={() => router.push('/admin/events/create')}
                style={{ padding: '8px 16px', fontSize: '0.9rem', borderRadius: '8px' }}
              >
                + Create Revival
              </button>
            )}
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
          {(user?.role === 'ADMIN' || user?.role === 'LEADER') && (
            <button 
              className="btn-primary" 
              onClick={() => router.push('/admin/events/create')}
              style={{ padding: '8px 16px', fontSize: '0.9rem', borderRadius: '8px' }}
            >
              + Create Revival
            </button>
          )}
        </div>
      )}

      <div className={styles.eventsList} style={{ marginBottom: hideBanner ? '0' : '30px' }}>
        {filteredEvents.length === 0 ? (
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>
            No events found.
          </div>
        ) : (
          filteredEvents.map(event => {
            const isExpanded = expandedEventId === event.id;
            const date = new Date(event.date);
            const hasJoined = event.participants && event.participants.length > 0;

            return (
              <div key={event.id} className={`glass-panel ${styles.eventCard} ${hasJoined ? styles.eventCardJoined : ''}`} onClick={() => toggleEvent(event.id)}>
                <div className={styles.eventHeader}>
                  <div>
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                    <span className={styles.eventDate}>
                      <CalendarIcon size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                      {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div className={`${styles.badge} ${styles['badge-warning']}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={12} /> {event._count?.participants || 0}
                    </div>
                  </div>
                </div>

                <div className={styles.eventDetails}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} /> {event.location}
                  </div>
                  {event.leaderName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <UserIcon size={14} /> Leaders: {event.leaderName}
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className={styles.eventExpanded} onClick={(e) => e.stopPropagation()}>
                    {event.remarks && (
                      <div style={{ background: 'rgba(0,0,0,0.05)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                        <strong>Remarks:</strong> {event.remarks}
                      </div>
                    )}
                    
                    {hasJoined ? (
                      <>
                        {event.meetingPoint && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                            <Info size={16} color="var(--primary)" /> <strong>Meeting Point:</strong> {event.meetingPoint}
                          </div>
                        )}

                        <div className={styles.linksGrid}>
                          {event.googleMapsLink && (
                            <a href={event.googleMapsLink} target="_blank" rel="noreferrer" className={styles.linkButton}>
                              <MapPin size={16} /> Google Maps
                            </a>
                          )}
                          {event.wazeLink && (
                            <a href={event.wazeLink} target="_blank" rel="noreferrer" className={styles.linkButton}>
                              <Navigation size={16} /> Waze
                            </a>
                          )}
                          {event.whatsappGroupLink && (
                            <a href={event.whatsappGroupLink} target="_blank" rel="noreferrer" className={styles.linkButton} style={{ gridColumn: '1 / -1', background: 'var(--card-bg)', color: '#25D366', borderColor: '#25D366' }}>
                              <MessageCircle size={18} /> Join WhatsApp Group
                            </a>
                          )}
                          {event.whatsappLink && (
                            <a href={`${event.whatsappLink}?text=${encodeURIComponent(defaultWhatsappMsg)}`} target="_blank" rel="noreferrer" className={styles.linkButton} style={{ gridColumn: '1 / -1', background: '#25D366', color: 'white', borderColor: '#25D366' }}>
                              <MessageCircle size={18} /> Contact Leader via WhatsApp
                            </a>
                          )}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: '0.85rem', color: 'var(--warning)', fontStyle: 'italic', opacity: 0.8 }}>
                        Join this revival to view the meeting point and location links.
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                      <button 
                        className={`btn-primary ${styles.joinButton}`} 
                        style={{ flex: 1, opacity: hasJoined ? 0.7 : 1, cursor: hasJoined ? 'default' : 'pointer' }}
                        onClick={(e) => {
                          if (!hasJoined) {
                            handleJoin(event);
                          }
                        }}
                      >
                        {hasJoined ? "Joined" : "Join Revival"}
                      </button>
                      <button 
                        className="btn-secondary" 
                        style={{ flex: 1, padding: '12px', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem' }}
                        onClick={() => router.push(`/events/${event.id}`)}
                      >
                        View Full Detail
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {!hideBanner && (
        <div className={styles.evangelismBanner} style={{ marginTop: '20px' }}>
          <h2>Request Evangelism</h2>
          <p>Would you like us to come to your area? Let us know and we'll arrange a special event!</p>
          <button className={styles.bannerButton} onClick={() => router.push('/request')}>
            Request Now
          </button>
        </div>
      )}
    </div>
  );
}

// User Icon helper
function UserIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
