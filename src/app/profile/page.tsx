"use client";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import styles from "../Dashboard.module.css";
import authStyles from "../login/Auth.module.css";
import { User, Mail, ShieldCheck, LogOut, Calendar as CalendarIcon, MapPin, Users, Heart, Activity, MessageCircle, Target, Check, X, Flame, Globe, Moon, Sun, Type, Monitor, Camera, Edit3, Crown, UserCheck, HeartHandshake } from "lucide-react";
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

  // Profile Stats & Layout State
  const [profileStats, setProfileStats] = useState({ engage: 0, revivals: 0, testimony: 0, user: null as any });
  const [loadingStats, setLoadingStats] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [visionText, setVisionText] = useState("");
  const [ministryText, setMinistryText] = useState("");

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
          if (Array.isArray(data)) {
            const now = new Date().getTime();
            const sorted = data.sort((a, b) => {
               const aTime = new Date(a.date).getTime();
               const bTime = new Date(b.date).getTime();
               const aPast = aTime < now;
               const bPast = bTime < now;

               if (!aPast && !bPast) return aTime - bTime; // Upcoming ascending
               if (aPast && bPast) return bTime - aTime; // Past descending
               return aPast ? 1 : -1; // Upcoming before past
            });
            setEvents(sorted);
          }
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

      fetch("/api/profile/stats")
        .then(res => res.json())
        .then(data => {
          setProfileStats(data);
          if (data.user?.vision) setVisionText(data.user.vision);
          if (data.user?.ministry) setMinistryText(data.user.ministry);
          setLoadingStats(false);
        })
        .catch(() => setLoadingStats(false));
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await fetch('/api/profile/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type })
      });
      const { presignedUrl, publicUrl } = await res.json();
      
      await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });
      
      await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: publicUrl })
      });
      
      setProfileStats(prev => ({ ...prev, user: { ...prev.user, image: publicUrl } }));
    } catch (err) {
      console.error(err);
    }
    setIsUploading(false);
  };

  const handleProfileSave = async () => {
    try {
      await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vision: visionText, ministry: ministryText })
      });
      setProfileStats(prev => ({ 
        ...prev, 
        user: { ...prev.user, vision: visionText, ministry: ministryText } 
      }));
      setIsEditingProfile(false);
    } catch (err) {
      console.error(err);
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
        <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HeartHandshake size={18} color="var(--primary)" /> {session.user.name}
        </h1>
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
      
      {/* Instagram-style Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0 20px 0', gap: '20px' }}>
        {/* Profile Picture */}
        <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '3px' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {profileStats.user?.image ? (
                <img src={profileStats.user.image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--foreground)' }}>
                  {session.user.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          {isEditingProfile && (
            <label style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--foreground)', color: 'var(--background)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--background)' }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={isUploading} />
              {isUploading ? <Activity size={14} /> : <Camera size={14} />}
            </label>
          )}
        </div>

        {/* Stats & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '16px' }}>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'space-around', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{profileStats.revivals || 0}</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>revivals</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{profileStats.engage || 0}</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>engage</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{profileStats.testimony || 0}</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>testimony</span>
            </div>
          </div>
          
          {!isEditingProfile && (
            <button 
              onClick={() => setIsEditingProfile(true)} 
              style={{ background: 'var(--subtle-bg)', border: '1px solid var(--subtle-border)', color: 'var(--foreground)', padding: '6px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, width: '100%', cursor: 'pointer' }}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Bio / Vision Line */}
      <div style={{ marginBottom: '24px' }}>
        {isEditingProfile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.7 }}>5-Fold Ministry Role</label>
              <select
                value={ministryText}
                onChange={(e) => setMinistryText(e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--subtle-border)', background: 'var(--subtle-bg)', color: 'var(--foreground)', outline: 'none' }}
              >
                <option value="">Select 5-Fold Ministry</option>
                <option value="Apostle">Apostle</option>
                <option value="Prophet">Prophet</option>
                <option value="Evangelist">Evangelist</option>
                <option value="Pastor">Pastor</option>
                <option value="Teacher">Teacher</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.7 }}>Vision</label>
              <textarea 
                value={visionText}
                onChange={(e) => setVisionText(e.target.value)}
                placeholder="Add your vision lines..."
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--subtle-border)', background: 'var(--subtle-bg)', color: 'var(--foreground)', fontFamily: 'inherit', resize: 'none' }}
                rows={3}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button onClick={handleProfileSave} style={{ flex: 1, padding: '10px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Save Profile</button>
              <button onClick={() => { setIsEditingProfile(false); setMinistryText(profileStats.user?.ministry || ""); setVisionText(profileStats.user?.vision || ""); }} style={{ flex: 1, padding: '10px', background: 'var(--subtle-bg)', color: 'var(--foreground)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
              {profileStats.user?.ministry || session.user.name}
            </h2>
            <p style={{ fontSize: '0.9rem', opacity: 0.9, whiteSpace: 'pre-wrap', fontStyle: profileStats.user?.vision ? 'italic' : 'normal', color: profileStats.user?.vision ? 'var(--foreground)' : 'gray', margin: 0, lineHeight: 1.5 }}>
              {profileStats.user?.vision || "Add your vision lines..."}
            </p>
          </div>
        )}
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
            const isPast = date < new Date();
            const participantData = event.participants?.find((p: any) => p.userId === session.user.id);
            const isPresent = participantData?.isPresent;
            
            // Color coding borders based on status
            let borderStyle = 'none';
            if (!isPast) {
              borderStyle = '4px solid #3b82f6'; // Blue for upcoming
            } else if (isPresent) {
              borderStyle = '4px solid #10b981'; // Green for attended
            } else {
              borderStyle = '4px solid #6b7280'; // Grey for absent
            }

            return (
              <div 
                key={event.id} 
                className={`glass-panel ${styles.eventCard}`} 
                style={{ 
                  borderLeft: borderStyle,
                  filter: isPast ? 'grayscale(100%)' : 'none',
                  opacity: isPast ? 0.6 : 1
                }}
                onClick={() => router.push(`/events/${event.id}`)}
              >
                <div className={styles.eventHeader}>
                  <div>
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                    <span className={styles.eventDate}>
                      <CalendarIcon size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                      {date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    {!isPast ? (
                      <span className={`${styles.badge}`} style={{ fontSize: '0.65rem', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>UPCOMING</span>
                    ) : isPresent ? (
                      <span className={`${styles.badge}`} style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>COMPLETED</span>
                    ) : (
                      <span className={`${styles.badge}`} style={{ fontSize: '0.65rem', background: 'rgba(107, 114, 128, 0.2)', color: '#9ca3af' }}>MISSED</span>
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
          <MessageCircle size={18} /> Contact Outreach Team
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
