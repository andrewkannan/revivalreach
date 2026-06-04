"use client";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import styles from "../Dashboard.module.css";
import authStyles from "../login/Auth.module.css";
import { User, Mail, ShieldCheck, LogOut, Calendar as CalendarIcon, MapPin, Users, Heart, Activity, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [stats, setStats] = useState({ totalSouls: 0, revivalsJoined: 0, prayedFor: 0, healed: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (session) {
      fetch("/api/profile/events")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setEvents(data);
          setLoadingEvents(false);
        })
        .catch(() => setLoadingEvents(false));
        
      fetch("/api/profile/stats")
        .then(res => res.json())
        .then(data => {
          setStats(data);
          setLoadingStats(false);
        })
        .catch(() => setLoadingStats(false));
    }
  }, [session]);

  if (status === "loading") {
    return <div style={{ padding: '50px', textAlign: 'center', color: 'white' }}>Loading...</div>;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.sectionTitle}>My Profile</h1>
      
      <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--primary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white', fontWeight: 'bold' }}>
            {session.user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{session.user.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8, fontSize: '0.9rem', marginTop: '4px' }}>
              <Mail size={14} /> {session.user.email}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--card-border)', margin: '10px 0' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={20} color="var(--primary)" />
          <div>
            <strong>Account Role:</strong> <span style={{ textTransform: 'capitalize' }}>{session.user.role.toLowerCase()}</span>
          </div>
        </div>

      </div>

      <h2 className={styles.sectionTitle} style={{ marginTop: '30px' }}>My Impact</h2>
      {loadingStats ? (
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>Loading your impact...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(236, 72, 153, 0.15)', padding: '12px', borderRadius: '12px', color: 'var(--secondary)', flexShrink: 0 }}>
              <CalendarIcon size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Revivals Joined</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2 }}>{stats.revivalsJoined}</div>
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '12px', borderRadius: '12px', color: '#f59e0b', flexShrink: 0 }}>
              <Heart size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Prayers Offered</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2 }}>{stats.prayedFor}</div>
            </div>
          </div>
        </div>
      )}

      <h2 className={styles.sectionTitle} style={{ marginTop: '30px' }}>My Events</h2>
      {loadingEvents ? (
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>Loading your events...</div>
      ) : events.length === 0 ? (
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>You haven't joined any upcoming events yet.</div>
      ) : (
        <div className={styles.eventsList}>
          {events.map(event => {
            const date = new Date(event.date);
            return (
              <div key={event.id} className={`glass-panel ${styles.eventCard}`} onClick={() => router.push(`/events/${event.id}`)}>
                <div className={styles.eventHeader}>
                  <div>
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                    <span className={styles.eventDate}>
                      <CalendarIcon size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                      {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    {event.status === 'PENDING' && (
                      <span className={`${styles.badge} ${styles['badge-warning']}`} style={{ fontSize: '0.65rem' }}>PENDING</span>
                    )}
                  </div>
                </div>

                <div className={styles.eventDetails}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} /> {event.location}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button 
          onClick={() => window.open('https://wa.me/60186647872', '_blank')}
          className="btn-secondary" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}
        >
          <MessageCircle size={18} /> Message Support
        </button>

        {(session.user.role === "ADMIN" || session.user.role === "LEADER") && (
          <button 
            onClick={() => router.push('/admin')}
            className="btn-primary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <ShieldCheck size={18} /> Admin Panel
          </button>
        )}

        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="btn-secondary" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
}
