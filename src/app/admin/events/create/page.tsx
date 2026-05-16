"use client";
import { useState, useEffect } from "react";
import styles from "../../Admin.module.css";
import authStyles from "../../../login/Auth.module.css";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Autocomplete from "react-google-autocomplete";

export default function CreateEventPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [status, setStatus] = useState({ type: "", message: "" });
  
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    whatsappGroupLink: "",
    meetingPoint: "",
    remarks: ""
  });

  const [leaders, setLeaders] = useState<string[]>([]);
  const [availableLeaders, setAvailableLeaders] = useState<any[]>([]);

  // Fetch leaders on mount
  useEffect(() => {
    fetch("/api/admin/users/leaders")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAvailableLeaders(data);
        }
      })
      .catch(err => console.error("Failed to load leaders", err));
  }, []);

  // Pre-fill leader name when session loads and leaders are fetched
  useEffect(() => {
    if (session?.user?.name && leaders.length === 0 && availableLeaders.length > 0) {
      // Check if logged in user is in the available leaders list
      const isLeader = availableLeaders.some(l => l.name === session.user.name || l.email === session.user.email);
      if (isLeader) {
        setLeaders([session.user.name as string]);
      }
    }
  }, [session, availableLeaders]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    setStatus({ type: "", message: "" });

    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString();
      const finalLeaderName = leaders.join(", ");
      
      const res = await fetch(`/api/admin/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, date: dateTime, leaderName: finalLeaderName }),
      });

      if (res.ok) {
        setStatus({ type: "success", message: "Event created successfully!" });
        setTimeout(() => router.push("/admin/events"), 2000);
      } else {
        const error = await res.json();
        setStatus({ type: "error", message: error.message || "Failed to create event" });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Server error occurred" });
    }
  };

  return (
    <div className={`glass-panel ${styles.adminContent}`} style={{ padding: '30px' }}>
      <h1 className={styles.pageTitle}>Create New Revival</h1>
      
      {status.message && (
        <div className={status.type === 'error' ? authStyles.error : authStyles.success} style={{ maxWidth: '800px' }}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px' }}>
        <div className={authStyles.inputGroup}>
          <label>Revival Title</label>
          <input type="text" name="title" className="input-glass" value={formData.title} onChange={handleChange} required />
        </div>
        
        <div className={authStyles.inputGroup}>
          <label>Date</label>
          <input type="date" name="date" className="input-glass" value={formData.date} onChange={handleChange} required />
        </div>
        <div className={authStyles.inputGroup}>
          <label>Time</label>
          <input type="time" name="time" className="input-glass" value={formData.time} onChange={handleChange} required />
        </div>

          <div className={authStyles.inputGroup}>
            <label>Location Name (Manual Entry)</label>
            <input 
              type="text" 
              name="location" 
              className="input-glass" 
              value={formData.location} 
              onChange={handleChange} 
              required 
              placeholder="Full address or location name..." 
            />
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
            <small style={{ opacity: 0.6, marginTop: '4px', display: 'block' }}>Tap to select or deselect leaders.</small>
          </div>

          <div className={authStyles.inputGroup}>
            <label>Meeting Point Details</label>
            <input type="text" name="meetingPoint" className="input-glass" value={formData.meetingPoint} onChange={handleChange} placeholder="e.g. By the main entrance" />
          </div>

          <div className={authStyles.inputGroup}>
            <label>Special Remarks</label>
            <textarea name="remarks" className="input-glass" value={formData.remarks} onChange={handleChange} style={{ minHeight: '100px', resize: 'vertical' }} />
          </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          <button type="submit" className="btn-primary" disabled={status.type === 'success'}>
            Create Revival
          </button>
          <button type="button" className="btn-secondary" onClick={() => router.push('/admin/events')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
