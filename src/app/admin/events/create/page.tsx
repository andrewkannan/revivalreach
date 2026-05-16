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
  const [leaderInput, setLeaderInput] = useState("");

  // Pre-fill leader name when session loads
  useEffect(() => {
    if (session?.user?.name && leaders.length === 0) {
      setLeaders([session.user.name as string]);
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLeaderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (leaderInput.trim()) {
        if (!leaders.includes(leaderInput.trim())) {
          setLeaders([...leaders, leaderInput.trim()]);
        }
        setLeaderInput("");
      }
    }
  };

  const removeLeader = (index: number) => {
    setLeaders(leaders.filter((_, i) => i !== index));
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
      <h1 className={styles.pageTitle}>Create New Event</h1>
      
      {status.message && (
        <div className={status.type === 'error' ? authStyles.error : authStyles.success} style={{ maxWidth: '800px' }}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className={authStyles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label>Event Title</label>
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

          <div className={authStyles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label>Location Name (Powered by Google Maps)</label>
            <Autocomplete
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
              onPlaceSelected={(place) => {
                const exactLocation = place.name ? `${place.name}, ${place.formatted_address}` : place.formatted_address || "";
                setFormData({ ...formData, location: exactLocation });
              }}
              onChange={(e: any) => setFormData({ ...formData, location: e.target.value })}
              options={{
                types: ["geocode", "establishment"],
              }}
              className="input-glass"
              placeholder="Start typing an address or place name..."
              required
            />
          </div>
          
          <div className={authStyles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label>WhatsApp Group Link (Optional)</label>
            <input type="url" name="whatsappGroupLink" className="input-glass" value={formData.whatsappGroupLink} onChange={handleChange} placeholder="https://chat.whatsapp.com/..." />
          </div>

          <div className={authStyles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label>Revival Leaders</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              {leaders.map((leader, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '16px', fontSize: '0.9rem' }}>
                  {leader}
                  <button type="button" onClick={() => removeLeader(idx)} style={{ background: 'transparent', border: 'none', color: 'white', marginLeft: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>×</button>
                </div>
              ))}
              <input 
                type="text" 
                value={leaderInput} 
                onChange={(e) => setLeaderInput(e.target.value)}
                onKeyDown={handleLeaderKeyDown}
                placeholder={leaders.length === 0 ? "Type a name and press Enter..." : "Add another leader..."}
                style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', outline: 'none', minWidth: '200px', padding: '6px' }}
              />
            </div>
            <small style={{ opacity: 0.6, marginTop: '4px', display: 'block' }}>Type a name and press Enter or comma to add.</small>
          </div>

          <div className={authStyles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label>Meeting Point Details</label>
            <input type="text" name="meetingPoint" className="input-glass" value={formData.meetingPoint} onChange={handleChange} placeholder="e.g. By the main entrance" />
          </div>

          <div className={authStyles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label>Special Remarks</label>
            <textarea name="remarks" className="input-glass" value={formData.remarks} onChange={handleChange} style={{ minHeight: '100px', resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          <button type="submit" className="btn-primary" disabled={status.type === 'success'}>
            Create Event
          </button>
          <button type="button" className="btn-secondary" onClick={() => router.push('/admin/events')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
