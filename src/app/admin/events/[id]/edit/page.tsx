"use client";
import { useState, useEffect, use } from "react";
import styles from "../../../Admin.module.css";
import authStyles from "../../../../login/Auth.module.css";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [statusMsg, setStatusMsg] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const resolvedParams = use(params);
  
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    googleMapsLink: "",
    wazeLink: "",
    whatsappGroupLink: "",
    meetingPoint: "",
    remarks: "",
    status: "PENDING"
  });

  const [leaders, setLeaders] = useState<string[]>([]);
  const [availableLeaders, setAvailableLeaders] = useState<any[]>([]);

  useEffect(() => {
    // Fetch leaders
    fetch("/api/admin/users/leaders")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAvailableLeaders(data);
      })
      .catch(err => console.error("Failed to load leaders", err));

    // Fetch event details
    fetch(`/api/admin/events/${resolvedParams.id}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load event");
        return res.json();
      })
      .then(data => {
        const eventDate = new Date(data.date);
        const yyyy = eventDate.getFullYear();
        const mm = String(eventDate.getMonth() + 1).padStart(2, '0');
        const dd = String(eventDate.getDate()).padStart(2, '0');
        
        const hh = String(eventDate.getHours()).padStart(2, '0');
        const min = String(eventDate.getMinutes()).padStart(2, '0');

        setFormData({
          title: data.title || "",
          date: `${yyyy}-${mm}-${dd}`,
          time: `${hh}:${min}`,
          location: data.location || "",
          googleMapsLink: data.googleMapsLink || "",
          wazeLink: data.wazeLink || "",
          whatsappGroupLink: data.whatsappGroupLink || "",
          meetingPoint: data.meetingPoint || "",
          remarks: data.remarks || "",
          status: data.status || "PENDING"
        });

        if (data.leaderName) {
          setLeaders(data.leaderName.split(", ").filter(Boolean));
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setStatusMsg({ type: "error", message: "Event not found or access denied." });
        setIsLoading(false);
      });
  }, [resolvedParams.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleLeader = (name: string) => {
    if (leaders.includes(name)) {
      setLeaders(leaders.filter(l => l !== name));
    } else {
      setLeaders([...leaders, name]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg({ type: "", message: "" });

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString();
      const finalLeaderName = leaders.join(", ");
      
      const res = await fetch(`/api/admin/events/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, date: dateTime, leaderName: finalLeaderName }),
      });

      if (res.ok) {
        setStatusMsg({ type: "success", message: "Revival updated successfully!" });
        setTimeout(() => router.push("/admin/events"), 2000);
      } else {
        const error = await res.json();
        setStatusMsg({ type: "error", message: error.message || "Failed to update revival" });
      }
    } catch (err) {
      setStatusMsg({ type: "error", message: "Server error occurred" });
    }
  };

  if (isLoading) return <div style={{ padding: '50px', color: 'white', textAlign: 'center' }}>Loading...</div>;

  const isAdmin = session?.user?.role === "ADMIN";
  const isApproved = formData.status === "APPROVED";
  const canEdit = isAdmin || !isApproved;

  return (
    <div className={`glass-panel ${styles.adminContent}`} style={{ padding: '30px' }}>
      <h1 className={styles.pageTitle}>Edit Revival</h1>
      
      {statusMsg.message && (
        <div className={statusMsg.type === 'error' ? authStyles.error : authStyles.success} style={{ maxWidth: '800px' }}>
          {statusMsg.message}
        </div>
      )}

      {!canEdit && (
        <div className={authStyles.error} style={{ maxWidth: '800px' }}>
          This revival is already approved. Only Administrators can edit approved revivals.
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', opacity: canEdit ? 1 : 0.6, pointerEvents: canEdit ? 'auto' : 'none' }}>
        
        {isAdmin && (
          <div className={authStyles.inputGroup} style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '12px', border: '1px solid var(--primary)' }}>
            <label style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Admin Controls</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '10px' }}>
              <div className={authStyles.inputGroup}>
                <label>Status</label>
                <select name="status" className="input-glass" value={formData.status} onChange={handleChange} style={{ background: 'var(--card-bg)' }}>
                  <option value="PENDING">PENDING</option>
                  <option value="APPROVED">APPROVED</option>
                </select>
              </div>
              <div className={authStyles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                <label>Google Maps Override Link</label>
                <input type="url" name="googleMapsLink" className="input-glass" value={formData.googleMapsLink} onChange={handleChange} placeholder="Leave blank to auto-generate" />
              </div>
              <div className={authStyles.inputGroup} style={{ gridColumn: '1 / -1' }}>
                <label>Waze Override Link</label>
                <input type="url" name="wazeLink" className="input-glass" value={formData.wazeLink} onChange={handleChange} placeholder="Leave blank to auto-generate" />
              </div>
            </div>
          </div>
        )}

        <div className={authStyles.inputGroup}>
          <label>Revival Title</label>
          <input type="text" name="title" className="input-glass" value={formData.title} onChange={handleChange} required />
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <div className={authStyles.inputGroup} style={{ flex: '1 1 120px' }}>
            <label>Date</label>
            <input type="date" name="date" className="input-glass" value={formData.date} onChange={handleChange} required />
          </div>
          <div className={authStyles.inputGroup} style={{ flex: '1 1 120px' }}>
            <label>Time</label>
            <input type="time" name="time" className="input-glass" value={formData.time} onChange={handleChange} required />
          </div>
        </div>

        <div className={authStyles.inputGroup}>
          <label>Location Name (Manual Entry)</label>
          <input type="text" name="location" className="input-glass" value={formData.location} onChange={handleChange} required placeholder="Full address or location name..." />
        </div>
        
        <div className={authStyles.inputGroup}>
          <label>WhatsApp Group Link (Optional)</label>
          <input type="url" name="whatsappGroupLink" className="input-glass" value={formData.whatsappGroupLink} onChange={handleChange} placeholder="https://chat.whatsapp.com/..." />
        </div>

        <div className={authStyles.inputGroup}>
            <label>Revival Leaders (Multi-select)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {availableLeaders.length === 0 ? (
                <span style={{ opacity: 0.5 }}>Loading leaders...</span>
              ) : (
                availableLeaders.map(l => {
                  const displayName = l.name || l.email;
                  const isSelected = leaders.includes(displayName);
                  return (
                    <div 
                      key={l.id} 
                      onClick={() => toggleLeader(displayName)}
                      style={{ 
                        display: 'flex', alignItems: 'center', padding: '6px 14px', borderRadius: '20px', fontSize: '0.9rem', cursor: 'pointer',
                        background: isSelected ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                        color: isSelected ? 'white' : 'rgba(255,255,255,0.8)',
                        border: isSelected ? '1px solid transparent' : '1px solid rgba(255,255,255,0.2)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {displayName}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className={authStyles.inputGroup}>
            <label>Meeting Point Details</label>
            <input type="text" name="meetingPoint" className="input-glass" value={formData.meetingPoint} onChange={handleChange} placeholder="e.g. By the main entrance" />
          </div>

          <div className={authStyles.inputGroup}>
            <label>Special Remarks</label>
            <textarea name="remarks" className="input-glass" value={formData.remarks} onChange={handleChange} style={{ minHeight: '100px', resize: 'vertical' }} />
          </div>

        {canEdit && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button type="submit" className="btn-primary" disabled={statusMsg.type === 'success'}>
              Update Revival
            </button>
            <button type="button" className="btn-secondary" onClick={() => router.push('/admin/events')}>
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
