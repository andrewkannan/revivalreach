"use client";

import { useState } from "react";
import { Users, QrCode, CheckCircle, Circle, MessageCircle } from "lucide-react";
import EventQRModal from "@/components/EventQRModal";

interface AttendanceControlsProps {
  eventId: string;
  eventTitle: string;
  initialParticipants: any[];
  canManage: boolean;
  canViewSensitiveInfo: boolean;
}

export default function AttendanceControls({ eventId, eventTitle, initialParticipants, canManage, canViewSensitiveInfo }: AttendanceControlsProps) {
  const [participants, setParticipants] = useState(initialParticipants);
  const [showQR, setShowQR] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  const toggleAttendance = async (userId: string, currentStatus: boolean) => {
    if (!canManage) return;
    setLoadingId(userId);
    
    try {
      const res = await fetch(`/api/admin/events/${eventId}/participants`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isPresent: !currentStatus })
      });
      
      if (res.ok) {
        setParticipants(prev => prev.map(p => p.userId === userId ? { ...p, isPresent: !currentStatus } : p));
      } else {
        alert("Failed to update attendance");
      }
    } catch (err) {
      alert("An error occurred");
    }
    
    setLoadingId(null);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail || !canManage) return;
    
    setAddingMember(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/add-participant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newMemberEmail })
      });
      
      const data = await res.json();
      if (res.ok) {
        setParticipants(prev => [...prev, data.participant]);
        setNewMemberEmail("");
        alert("Member added successfully!");
      } else {
        alert(data.message || "Failed to add member");
      }
    } catch (err) {
      alert("An error occurred while adding the member.");
    } finally {
      setAddingMember(false);
    }
  };

  return (
    <div style={{ marginTop: '30px', borderTop: '1px solid var(--subtle-border)', paddingTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
        <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} color="var(--primary)" /> 
          Revival Team ({participants.length})
        </h3>
        
        {canManage && (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setShowQR(true)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.9rem', flex: '1 1 auto' }}>
              <QrCode size={16} /> QR Check-in
            </button>
            <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '6px' }}>
              <input 
                type="email" 
                placeholder="User Email" 
                value={newMemberEmail}
                onChange={e => setNewMemberEmail(e.target.value)}
                required
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--subtle-border)', background: 'var(--card-bg)', color: 'var(--foreground)', fontSize: '0.9rem', width: '180px' }}
              />
              <button type="submit" disabled={addingMember} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                {addingMember ? "..." : "Add"}
              </button>
            </form>
          </div>
        )}
      </div>
      
      {participants.length === 0 ? (
        <div style={{ background: 'var(--subtle-bg)', padding: '15px', borderRadius: '8px', color: 'var(--foreground)', opacity: 0.5, textAlign: 'center' }}>
          No one is on the team yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
          {participants.map((p: any) => (
            <div key={p.id} style={{ background: 'var(--subtle-bg)', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden' }}>
                  {p.user.image ? (
                    <img src={p.user.image} alt={p.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    p.user.name ? p.user.name.charAt(0).toUpperCase() : '?'
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600 }}>{p.user.name || "Anonymous User"}</div>
                  {canViewSensitiveInfo && p.user.phone && (
                    <a href={`https://wa.me/${p.user.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', padding: '4px', borderRadius: '50%', background: '#25D366', color: 'white', textDecoration: 'none', marginLeft: '6px' }} title="WhatsApp">
                      <MessageCircle size={14} />
                    </a>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {canManage ? (
                  <button 
                    onClick={() => toggleAttendance(p.userId, p.isPresent)} 
                    disabled={loadingId === p.userId}
                    style={{ background: 'none', border: 'none', cursor: loadingId === p.userId ? 'wait' : 'pointer', color: p.isPresent ? 'var(--success)' : 'var(--foreground)', opacity: p.isPresent ? 1 : 0.3, display: 'flex', alignItems: 'center', gap: '6px', padding: '4px' }}
                    title={p.isPresent ? "Mark Absent" : "Mark Present"}
                  >
                    {p.isPresent ? <CheckCircle size={24} /> : <Circle size={24} />}
                  </button>
                ) : (
                  p.isPresent && <span title="Checked In"><CheckCircle size={20} color="var(--success)" /></span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showQR && <EventQRModal eventId={eventId} eventTitle={eventTitle} onClose={() => setShowQR(false)} />}
    </div>
  );
}
