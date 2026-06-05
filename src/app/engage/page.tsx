"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Edit2, MessageCircle, Heart, Activity, CheckCircle, Trash2, Star, Mic, Users } from "lucide-react";
import AudioRecorder from "@/components/AudioRecorder";
import { useLanguage } from "@/contexts/LanguageContext";

type Soul = {
  id: string;
  name: string;
  phone: string;
  prayed: boolean;
  healed: boolean;
  requestedPrayer: boolean;
  prayerNeeds: string | null;
  prayerNeedsAudioUrl: string | null;
  remarks: string | null;
  remarksAudioUrl: string | null;
  eventId: string | null;
  isPriority: boolean;
  hasFollowedUp: boolean;
  lastFollowedUpAt: string | null;
  event?: { title: string };
  createdAt: string;
};

export default function EngagePage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [souls, setSouls] = useState<Soul[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [todayEvents, setTodayEvents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "+60",
    prayed: false,
    healed: false,
    requestedPrayer: false,
    prayerNeeds: "",
    prayerNeedsAudioUrl: null as string | null,
    remarks: "",
    remarksAudioUrl: null as string | null,
    eventId: null as string | null,
    isPriority: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isContactPickerSupported, setIsContactPickerSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'contacts' in navigator && 'ContactsManager' in window) {
      setIsContactPickerSupported(true);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchSouls();
      fetchTodayEvents();
    }
  }, [session]);

  const fetchTodayEvents = async () => {
    try {
      const res = await fetch("/api/events/today");
      if (res.ok) {
        const data = await res.json();
        setTodayEvents(data);
        
        // Default to joined event if there is exactly 1
        const joined = data.filter((e: any) => e.hasJoined);
        if (joined.length === 1) {
          setFormData(prev => ({ ...prev, eventId: joined[0].id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      const res = await fetch("/api/events/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId })
      });
      if (res.ok) {
        fetchTodayEvents();
        setFormData(prev => ({ ...prev, eventId }));
      } else {
        alert("Failed to join event.");
      }
    } catch (err) {
      alert("Error joining event.");
    }
  };

  const fetchSouls = async () => {
    try {
      const res = await fetch("/api/engage");
      if (res.ok) {
        const data = await res.json();
        const sortedData = data.sort((a: Soul, b: Soul) => Number(b.isPriority) - Number(a.isPriority));
        setSouls(sortedData);
      }
    } catch (err) {
      console.error("Failed to fetch souls", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'phone') {
      let formattedPhone = value;
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+60' + formattedPhone.substring(1);
      }
      setFormData(prev => ({ ...prev, [name]: formattedPhone }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectContact = async () => {
    try {
      const props = ['name', 'tel'];
      const opts = { multiple: false };
      // @ts-ignore
      const contacts = await navigator.contacts.select(props, opts);
      if (contacts && contacts.length > 0) {
        const contact = contacts[0];
        const name = contact.name && contact.name.length > 0 ? contact.name[0] : '';
        let phone = contact.tel && contact.tel.length > 0 ? contact.tel[0] : '';
        
        if (phone) {
           phone = phone.replace(/[\s-]/g, '');
           if (phone.startsWith('0')) {
             phone = '+60' + phone.substring(1);
           }
        }
        
        setFormData(prev => ({
          ...prev,
          name: name || prev.name,
          phone: phone || prev.phone
        }));
      }
    } catch (err) {
      console.error('Contact picker error:', err);
    }
  };

  const resetForm = () => {
    const joined = todayEvents.filter(e => e.hasJoined);
    const defaultEventId = joined.length === 1 ? joined[0].id : null;
    
    setFormData({ 
      name: "", phone: "+60", prayed: false, healed: false, requestedPrayer: false, 
      prayerNeeds: "", prayerNeedsAudioUrl: null, remarks: "", remarksAudioUrl: null, 
      eventId: defaultEventId, isPriority: false 
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const openAddForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (soul: Soul) => {
    setFormData({
      name: soul.name,
      phone: soul.phone,
      prayed: soul.prayed,
      healed: soul.healed,
      requestedPrayer: soul.requestedPrayer || false,
      prayerNeeds: soul.prayerNeeds || "",
      prayerNeedsAudioUrl: soul.prayerNeedsAudioUrl || null,
      remarks: soul.remarks || "",
      remarksAudioUrl: soul.remarksAudioUrl || null,
      eventId: soul.eventId || null,
      isPriority: soul.isPriority || false
    });
    setEditingId(soul.id);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingId ? `/api/engage/${editingId}` : "/api/engage";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        await fetchSouls();
        resetForm();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to save soul");
      }
    } catch (err) {
      alert("Server error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(`/api/engage/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchSouls();
      }
    } catch (err) {
      alert("Failed to delete soul");
    }
  };

  const handleToggleFollowUp = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/engage/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasFollowedUp: !currentStatus })
      });
      if (res.ok) {
        setSouls(prev => prev.map(s => s.id === id ? { ...s, hasFollowedUp: !currentStatus, lastFollowedUpAt: !currentStatus ? new Date().toISOString() : null } : s));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatWhatsAppLink = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

  if (!session) {
    return <div style={{ padding: '50px', textAlign: 'center', color: 'white' }}>{t('engage_login_prompt')}</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%', color: 'white' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{t('engage_title')}</h1>
          <p style={{ opacity: 0.8, marginTop: '8px' }}>{t('engage_subtitle')}</p>
        </div>
        {!isFormOpen && (
          <button onClick={openAddForm} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', padding: 0, borderRadius: '50%' }}>
            <Plus size={24} />
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '30px', animation: 'slideDown 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{editingId ? t('engage_edit_record') : t('engage_add_new')}</h2>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: formData.isPriority ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', border: formData.isPriority ? '1px solid #eab308' : '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s ease' }}>
              <input type="checkbox" name="isPriority" checked={formData.isPriority} onChange={handleInputChange} style={{ display: 'none' }} />
              <Star size={16} color={formData.isPriority ? "#eab308" : "rgba(255,255,255,0.4)"} fill={formData.isPriority ? "#eab308" : "none"} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: formData.isPriority ? '#eab308' : 'rgba(255,255,255,0.6)' }}>{t('engage_priority')}</span>
              
              <div style={{ width: '36px', height: '20px', background: formData.isPriority ? '#eab308' : 'rgba(255,255,255,0.2)', borderRadius: '10px', position: 'relative', transition: 'all 0.2s ease', marginLeft: '4px' }}>
                <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: formData.isPriority ? '18px' : '2px', transition: 'all 0.2s ease' }} />
              </div>
            </label>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {todayEvents.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '4px', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 'bold' }}>
                  <Activity size={16} /> {t('engage_tag_event')}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({ ...prev, eventId: null }))}
                    style={{ 
                      padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease',
                      border: formData.eventId === null ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                      background: formData.eventId === null ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                      color: formData.eventId === null ? 'white' : 'rgba(255,255,255,0.6)'
                    }}
                  >
                    {t('engage_none')}
                  </button>
                  {todayEvents.map(evt => (
                    <div key={evt.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, eventId: evt.id }))}
                        style={{ 
                          padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease',
                          border: formData.eventId === evt.id ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                          background: formData.eventId === evt.id ? 'var(--primary)' : 'transparent',
                          color: formData.eventId === evt.id ? 'white' : 'rgba(255,255,255,0.8)'
                        }}
                      >
                        {evt.title}
                      </button>
                      {!evt.hasJoined && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleJoinEvent(evt.id); }}
                          style={{
                            padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', cursor: 'pointer',
                            background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', border: '1px solid var(--success)',
                            fontWeight: 'bold', transition: 'all 0.2s ease'
                          }}
                        >
                          {t('engage_join')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {isContactPickerSupported && (
              <button 
                type="button" 
                onClick={handleSelectContact}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)',
                  border: '1px solid var(--primary)', padding: '12px', borderRadius: '12px',
                  fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s ease'
                }}
              >
                <Users size={18} /> {t('engage_choose_contacts')}
              </button>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>{t('engage_name')}</label>
              <input type="text" name="name" className="input-glass" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>{t('engage_phone')}</label>
              <input type="tel" name="phone" className="input-glass" value={formData.phone} onChange={handleInputChange} required placeholder="+60123456789" />
            </div>

            <div style={{ display: 'flex', gap: '16px', margin: '10px 0' }}>
              <button 
                type="button" 
                onClick={() => setFormData(prev => ({ ...prev, prayed: !prev.prayed }))}
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  border: formData.prayed ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)', 
                  background: formData.prayed ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)', 
                  color: formData.prayed ? 'var(--primary)' : 'rgba(255,255,255,0.6)', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: 600
                }}
              >
                <Heart size={18} color={formData.prayed ? "var(--primary)" : "rgba(255,255,255,0.6)"} fill={formData.prayed ? "var(--primary)" : "none"} /> {t('engage_prayed')}
              </button>

              <button 
                type="button" 
                onClick={() => setFormData(prev => ({ ...prev, healed: !prev.healed }))}
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  border: formData.healed ? '1px solid var(--success)' : '1px solid rgba(255,255,255,0.1)', 
                  background: formData.healed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)', 
                  color: formData.healed ? 'var(--success)' : 'rgba(255,255,255,0.6)', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: 600
                }}
              >
                <Activity size={18} color={formData.healed ? "var(--success)" : "rgba(255,255,255,0.6)"} /> {t('engage_healed')}
              </button>

              <button 
                type="button" 
                onClick={() => setFormData(prev => ({ ...prev, requestedPrayer: !prev.requestedPrayer }))}
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  border: formData.requestedPrayer ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)', 
                  background: formData.requestedPrayer ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.05)', 
                  color: formData.requestedPrayer ? '#f59e0b' : 'rgba(255,255,255,0.6)', 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontWeight: 600
                }}
              >
                <MessageCircle size={18} color={formData.requestedPrayer ? "#f59e0b" : "rgba(255,255,255,0.6)"} /> {t('engage_prayer_request')}
              </button>
            </div>

            {formData.requestedPrayer && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', animation: 'fadeIn 0.3s ease-out' }}>
                <label style={{ color: '#f59e0b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{t('engage_prayer_needs')}</span>
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <textarea name="prayerNeeds" className="input-glass" value={formData.prayerNeeds} onChange={handleInputChange} rows={3} style={{ borderColor: 'rgba(245, 158, 11, 0.3)', flex: 1 }} required={formData.requestedPrayer && !formData.prayerNeedsAudioUrl} />
                  <AudioRecorder 
                    compact
                    initialAudioUrl={formData.prayerNeedsAudioUrl}
                    onAudioReady={(url) => setFormData(prev => ({ ...prev, prayerNeedsAudioUrl: url }))} 
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{t('engage_remarks')}</span>
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <textarea name="remarks" className="input-glass" value={formData.remarks} onChange={handleInputChange} rows={3} style={{ flex: 1 }} />
                  <AudioRecorder 
                    compact
                    initialAudioUrl={formData.remarksAudioUrl}
                    onAudioReady={(url) => setFormData(prev => ({ ...prev, remarksAudioUrl: url }))} 
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ flex: 1 }}>
                {isSubmitting ? t('engage_saving') : t('engage_save_record')}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm} style={{ flex: 1 }}>
                {t('engage_cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
          {t('engage_my_records')} ({souls.length})
        </h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>{t('engage_loading')}</div>
        ) : souls.length === 0 ? (
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>
            {t('engage_no_records')}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {souls.map(soul => {
              const isFollowedUpToday = soul.lastFollowedUpAt 
                ? new Date(soul.lastFollowedUpAt).toDateString() === new Date().toDateString()
                : false;
                
              return (
                <div key={soul.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', border: soul.isPriority ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)', boxShadow: soul.isPriority ? '0 0 10px rgba(234, 179, 8, 0.1)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {soul.name}
                        {soul.isPriority && <Star size={18} color="#eab308" fill="#eab308" />}
                      </h3>
                    <p style={{ opacity: 0.7, fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                      {soul.event ? `${t('engage_event')}: ${soul.event.title}` : `${t('engage_added')}: ${new Date(soul.createdAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEditForm(soul)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(soul.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  {soul.prayed && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                      <Heart size={12} /> {t('engage_prayed')}
                    </span>
                  )}
                  {soul.healed && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                      <CheckCircle size={12} /> {t('engage_healed')}
                    </span>
                  )}
                  {soul.requestedPrayer && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                      <MessageCircle size={12} /> {t('engage_prayer_request')}
                    </span>
                  )}
                </div>

                {(soul.prayerNeeds || soul.prayerNeedsAudioUrl) && (
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', borderLeft: '3px solid #f59e0b', padding: '12px', borderRadius: '4px', fontSize: '0.9rem', marginTop: '4px' }}>
                    <strong style={{ display: 'block', marginBottom: '8px', color: '#f59e0b' }}>Prayer Needs:</strong>
                    {soul.prayerNeedsAudioUrl && (
                      <audio controls src={soul.prayerNeedsAudioUrl} style={{ width: '100%', height: '36px', marginBottom: soul.prayerNeeds ? '8px' : '0' }} />
                    )}
                    {soul.prayerNeeds}
                  </div>
                )}

                {(soul.remarks || soul.remarksAudioUrl) && (
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', marginTop: '4px' }}>
                    <strong style={{ display: 'block', marginBottom: '8px', opacity: 0.7 }}>Remarks:</strong>
                    {soul.remarksAudioUrl && (
                      <audio controls src={soul.remarksAudioUrl} style={{ width: '100%', height: '36px', marginBottom: soul.remarks ? '8px' : '0' }} />
                    )}
                    {soul.remarks}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <a 
                    href={formatWhatsAppLink(soul.phone)} 
                    target="_blank" 
                    rel="noreferrer"
                    onClick={() => {
                      if (!isFollowedUpToday) {
                        handleToggleFollowUp(soul.id, false);
                      }
                    }}
                    className="btn-primary"
                    style={{ 
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                      background: isFollowedUpToday ? 'rgba(16, 185, 129, 0.2)' : '#25D366', 
                      borderColor: isFollowedUpToday ? 'var(--success)' : '#25D366',
                      color: isFollowedUpToday ? 'var(--success)' : 'white'
                    }}
                  >
                    {isFollowedUpToday ? <CheckCircle size={18} /> : <MessageCircle size={18} />}
                    {isFollowedUpToday ? t('engage_followed_up') : t('engage_follow_up')}
                  </a>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
