"use client";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import styles from "../Dashboard.module.css";
import authStyles from "../login/Auth.module.css";
import { User, Mail, ShieldCheck, LogOut, Calendar as CalendarIcon, MapPin, Users, Heart, Activity, MessageCircle, Target, Check, X, Flame, Globe, Moon, Sun, Type, Monitor } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePreferences } from "@/contexts/PreferencesContext";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme, textSize, setTextSize } = usePreferences();
  const [events, setEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Goal Tracker State
  const [goalData, setGoalData] = useState({ goal: 0, current: 0 });
  const [loadingGoal, setLoadingGoal] = useState(true);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoalValue, setNewGoalValue] = useState("");

  useEffect(() => {
    if (session) {
      fetch("/api/profile/events")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setEvents(data);
          setLoadingEvents(false);
        })
        .catch(() => setLoadingEvents(false));

      fetch("/api/profile/goal")
        .then(res => res.json())
        .then(data => {
          setGoalData(data);
          setNewGoalValue(data.goal.toString());
          setLoadingGoal(false);
        })
        .catch(() => setLoadingGoal(false));
    }
  }, [session]);

  const saveGoal = async () => {
    const parsed = parseInt(newGoalValue, 10);
    if (isNaN(parsed) || parsed < 0) return;
    try {
      await fetch("/api/profile/goal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: parsed })
      });
      setGoalData(prev => ({ ...prev, goal: parsed }));
      setIsEditingGoal(false);
    } catch (err) {
      console.error("Error saving goal", err);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div style={{ padding: '50px', textAlign: 'center', color: 'var(--foreground)' }}>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className={styles.dashboard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className={styles.sectionTitle} style={{ margin: 0 }}>{t('profile_title')}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--subtle-bg)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--subtle-border)' }}>
          <Globe size={16} opacity={0.7} />
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as "en" | "ta" | "ms")}
            style={{ background: 'transparent', border: 'none', color: 'var(--foreground)', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
          >
            <option value="en" style={{ color: 'black' }}>English</option>
            <option value="ta" style={{ color: 'black' }}>தமிழ் (Tamil)</option>
            <option value="ms" style={{ color: 'black' }}>Melayu (Malay)</option>
          </select>
        </div>
      </div>
      
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={20} color="var(--primary)" />
            <div>
              <strong>{t('profile_role')}:</strong> <span style={{ textTransform: 'capitalize' }}>{session.user.role.toLowerCase()}</span>
            </div>
          </div>
          {((session.user as any).createdAt || (goalData as any).memberSince) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CalendarIcon size={20} color="var(--primary)" />
              <div>
                <strong>{t('profile_member_since')}:</strong> {new Date((session.user as any).createdAt || (goalData as any).memberSince).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          )}
        </div>

      </div>

      <h2 className={styles.sectionTitle} style={{ marginTop: '30px' }}>{t('profile_evangelism_goal')}</h2>
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loadingGoal ? (
          <div style={{ opacity: 0.7, textAlign: 'center' }}>{t('profile_loading_goal')}</div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--primary)' }}>
                <Target size={20} /> {t('profile_monthly_target')}
              </div>
              {!isEditingGoal && (
                <button 
                  onClick={() => setIsEditingGoal(true)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--foreground)', opacity: 0.6, fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {t('profile_edit_goal')}
                </button>
              )}
            </div>

            {isEditingGoal ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  type="number" 
                  className="input-glass" 
                  value={newGoalValue} 
                  onChange={(e) => setNewGoalValue(e.target.value)}
                  style={{ width: '80px', padding: '8px' }}
                  min="0"
                />
                <button onClick={saveGoal} className="btn-primary" style={{ padding: '8px 16px' }}><Check size={16} /></button>
                <button onClick={() => { setIsEditingGoal(false); setNewGoalValue(goalData.goal.toString()); }} className="btn-secondary" style={{ padding: '8px 16px' }}><X size={16} /></button>
              </div>
            ) : goalData.goal === 0 ? (
              <div style={{ background: 'var(--subtle-bg)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 12px 0', opacity: 0.8 }}>{t('profile_set_goal_prompt')}</p>
                <button onClick={() => setIsEditingGoal(true)} className="btn-primary" style={{ display: 'inline-flex', padding: '8px 16px', fontSize: '0.9rem' }}>{t('profile_set_my_goal')}</button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{goalData.current} / {goalData.goal} {t('profile_completed')}</span>
                  {goalData.current >= goalData.goal && <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}><Flame size={16} /> {t('profile_goal_met')}</span>}
                </div>
                <div style={{ width: '100%', height: '12px', background: 'var(--subtle-bg)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      background: goalData.current >= goalData.goal ? '#10b981' : 'var(--primary)', 
                      width: `${Math.min(100, (goalData.current / goalData.goal) * 100)}%`,
                      transition: 'width 0.5s ease-out'
                    }} 
                  />
                </div>
                <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '8px', marginBottom: 0 }}>{t('profile_based_on_records')}</p>
              </div>
            )}
          </>
        )}
      </div>

      <h2 className={styles.sectionTitle} style={{ marginTop: '30px' }}>{t('profile_my_events')}</h2>
      {loadingEvents ? (
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>{t('profile_loading_events')}</div>
      ) : events.length === 0 ? (
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>{t('profile_no_events')}</div>
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
                      {date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
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

      <h2 className={styles.sectionTitle} style={{ marginTop: '30px' }}>{t('profile_accessibility')}</h2>
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Theme Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--subtle-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {theme === 'dark' ? <Moon size={20} color="var(--primary)" /> : theme === 'light' ? <Sun size={20} color="var(--primary)" /> : <Monitor size={20} color="var(--primary)" />}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{t('profile_theme')}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                {theme === 'dark' ? t('profile_theme_dark') : theme === 'light' ? t('profile_theme_light') : t('profile_theme_system')}
              </div>
            </div>
          </div>
          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value as any)}
            style={{ background: 'var(--subtle-bg)', border: '1px solid var(--subtle-border)', color: 'var(--foreground)', padding: '6px 12px', borderRadius: '8px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="system" style={{ color: 'black' }}>{t('profile_theme_system')}</option>
            <option value="light" style={{ color: 'black' }}>{t('profile_theme_light')}</option>
            <option value="dark" style={{ color: 'black' }}>{t('profile_theme_dark')}</option>
          </select>
        </div>

        {/* Text Size Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--subtle-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--subtle-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Type size={20} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{t('profile_large_text')}</div>
            </div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
            <input 
              type="checkbox" 
              checked={textSize === 'large'} 
              onChange={(e) => setTextSize(e.target.checked ? 'large' : 'normal')}
              style={{ opacity: 0, width: 0, height: 0 }} 
            />
            <span style={{
              position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: textSize === 'large' ? 'var(--primary)' : 'var(--subtle-border)',
              transition: '.4s', borderRadius: '24px'
            }}>
              <span style={{
                position: 'absolute', content: '""', height: '18px', width: '18px', left: textSize === 'large' ? '22px' : '3px', bottom: '3px',
                backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
              }} />
            </span>
          </label>
        </div>
      </div>

      <div style={{ marginTop: '40px', borderTop: '1px solid var(--subtle-border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button 
          onClick={() => window.open('https://wa.me/60186647872', '_blank')}
          className="btn-secondary" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}
        >
          <MessageCircle size={18} /> {t('profile_msg_support')}
        </button>

        {(session.user.role === "ADMIN" || session.user.role === "LEADER") && (
          <button 
            onClick={() => router.push('/admin')}
            className="btn-primary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <ShieldCheck size={18} /> {t('profile_admin_panel')}
          </button>
        )}

        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="btn-secondary" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
        >
          <LogOut size={18} /> {t('profile_sign_out')}
        </button>
      </div>
    </div>
  );
}
