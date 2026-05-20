"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Edit2, MessageCircle, Heart, Activity, CheckCircle, Trash2, Star } from "lucide-react";

type Soul = {
  id: string;
  name: string;
  phone: string;
  prayed: boolean;
  healed: boolean;
  requestedPrayer: boolean;
  prayerNeeds: string | null;
  remarks: string | null;
  eventId: string | null;
  isPriority: boolean;
  event?: { title: string };
  createdAt: string;
};

export default function SoulsPage() {
  const { data: session } = useSession();
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
    remarks: "",
    eventId: null as string | null,
    isPriority: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const fetchSouls = async () => {
    try {
      const res = await fetch("/api/souls");
      if (res.ok) {
        const data = await res.json();
        setSouls(data);
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
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    const joined = todayEvents.filter(e => e.hasJoined);
    const defaultEventId = joined.length === 1 ? joined[0].id : null;
    
    setFormData({ name: "", phone: "+60", prayed: false, healed: false, requestedPrayer: false, prayerNeeds: "", remarks: "", eventId: defaultEventId, isPriority: false });
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
      remarks: soul.remarks || "",
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
      const url = editingId ? `/api/souls/${editingId}` : "/api/souls";
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
      const res = await fetch(`/api/souls/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchSouls();
      }
    } catch (err) {
      alert("Failed to delete soul");
    }
  };

  const formatWhatsAppLink = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

  if (!session) {
    return <div style={{ padding: '50px', textAlign: 'center', color: 'white' }}>Please log in to manage souls.</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%', color: 'white' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Souls</h1>
        {!isFormOpen && (
          <button onClick={openAddForm} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add Soul
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '30px', animation: 'slideDown 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{editingId ? "Edit Soul" : "Add New Soul"}</h2>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: formData.isPriority ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', border: formData.isPriority ? '1px solid #eab308' : '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s ease' }}>
              <input type="checkbox" name="isPriority" checked={formData.isPriority} onChange={handleInputChange} style={{ display: 'none' }} />
              <Star size={16} color={formData.isPriority ? "#eab308" : "rgba(255,255,255,0.4)"} fill={formData.isPriority ? "#eab308" : "none"} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: formData.isPriority ? '#eab308' : 'rgba(255,255,255,0.6)' }}>Priority</span>
              
              <div style={{ width: '36px', height: '20px', background: formData.isPriority ? '#eab308' : 'rgba(255,255,255,0.2)', borderRadius: '10px', position: 'relative', transition: 'all 0.2s ease', marginLeft: '4px' }}>
                <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: formData.isPriority ? '18px' : '2px', transition: 'all 0.2s ease' }} />
              </div>
            </label>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {todayEvents.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '4px', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 'bold' }}>
                  <Activity size={16} /> Tag to Event
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
                    None
                  </button>
                  {todayEvents.map(evt => (
                    <button 
                      key={evt.id}
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, eventId: evt.id }))}
                      style={{ 
                        padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease',
                        border: formData.eventId === evt.id ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                        background: formData.eventId === evt.id ? 'var(--primary)' : 'transparent',
                        color: formData.eventId === evt.id ? 'white' : 'rgba(255,255,255,0.8)'
                      }}
                    >
                      {evt.title} {!evt.hasJoined && "(Not Joined)"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>Name</label>
              <input type="text" name="name" className="input-glass" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>Phone Number</label>
              <input type="tel" name="phone" className="input-glass" value={formData.phone} onChange={handleInputChange} required placeholder="+1234567890" />
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
                <Heart size={18} color={formData.prayed ? "var(--primary)" : "rgba(255,255,255,0.6)"} fill={formData.prayed ? "var(--primary)" : "none"} /> Prayed
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
                <Activity size={18} color={formData.healed ? "var(--success)" : "rgba(255,255,255,0.6)"} /> Healed
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
                <MessageCircle size={18} color={formData.requestedPrayer ? "#f59e0b" : "rgba(255,255,255,0.6)"} /> Prayer Request
              </button>
            </div>

            {formData.requestedPrayer && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', animation: 'fadeIn 0.3s ease-out' }}>
                <label style={{ color: '#f59e0b' }}>Prayer Needs</label>
                <textarea name="prayerNeeds" className="input-glass" value={formData.prayerNeeds} onChange={handleInputChange} rows={3} placeholder="What do they need prayer for?" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }} required={formData.requestedPrayer} />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label>Remarks (Optional)</label>
              <textarea name="remarks" className="input-glass" value={formData.remarks} onChange={handleInputChange} rows={3} placeholder="Notes about background, etc." />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ flex: 1 }}>
                {isSubmitting ? "Saving..." : "Save Soul"}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm} style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
          My Souls ({souls.length})
        </h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>Loading your souls...</div>
        ) : souls.length === 0 ? (
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>
            No souls recorded yet. Click 'Add Soul' to start!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {souls.map(soul => (
              <div key={soul.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {soul.name}
                      {soul.isPriority && <Star size={18} color="#eab308" fill="#eab308" />}
                    </h3>
                    <p style={{ opacity: 0.7, fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                      {soul.event ? `Event: ${soul.event.title}` : `Added: ${new Date(soul.createdAt).toLocaleDateString()}`}
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
                      <Heart size={12} /> Prayed
                    </span>
                  )}
                  {soul.healed && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                      <CheckCircle size={12} /> Healed
                    </span>
                  )}
                  {soul.requestedPrayer && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                      <MessageCircle size={12} /> Prayer Requested
                    </span>
                  )}
                </div>

                {soul.prayerNeeds && (
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', borderLeft: '3px solid #f59e0b', padding: '12px', borderRadius: '4px', fontSize: '0.9rem', marginTop: '4px' }}>
                    <strong style={{ display: 'block', marginBottom: '4px', color: '#f59e0b' }}>Prayer Needs:</strong>
                    {soul.prayerNeeds}
                  </div>
                )}

                {soul.remarks && (
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', marginTop: '4px' }}>
                    {soul.remarks}
                  </div>
                )}

                <a 
                  href={formatWhatsAppLink(soul.phone)} 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#25D366', borderColor: '#25D366', marginTop: '8px' }}
                >
                  <MessageCircle size={18} /> WhatsApp
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
