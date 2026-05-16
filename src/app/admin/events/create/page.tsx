"use client";
import { useState, useEffect } from "react";
import styles from "../../Admin.module.css";
import authStyles from "../../../login/Auth.module.css";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CreateEventPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [status, setStatus] = useState({ type: "", message: "" });
  
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    googleMapsLink: "",
    wazeLink: "",
    whatsappLink: "",
    whatsappGroupLink: "",
    meetingPoint: "",
    remarks: "",
    leaderName: ""
  });

  // Pre-fill leader name when session loads
  useEffect(() => {
    if (session?.user?.name && !formData.leaderName) {
      setFormData(prev => ({ ...prev, leaderName: session.user.name as string }));
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString();
      
      const res = await fetch(`/api/admin/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, date: dateTime }),
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
            <label>Location Name</label>
            <input type="text" name="location" className="input-glass" value={formData.location} onChange={handleChange} required placeholder="e.g., Central Park, New York" />
          </div>

          <div className={authStyles.inputGroup}>
            <label>Leader WhatsApp Link (Optional)</label>
            <input type="url" name="whatsappLink" className="input-glass" value={formData.whatsappLink} onChange={handleChange} placeholder="https://wa.me/..." />
          </div>
          
          <div className={authStyles.inputGroup}>
            <label>WhatsApp Group Link (Optional)</label>
            <input type="url" name="whatsappGroupLink" className="input-glass" value={formData.whatsappGroupLink} onChange={handleChange} placeholder="https://chat.whatsapp.com/..." />
          </div>

          <div className={authStyles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label>Revival Leaders</label>
            <input type="text" name="leaderName" className="input-glass" value={formData.leaderName} onChange={handleChange} placeholder="e.g. John Doe, Jane Smith" />
          </div>

          <div className={authStyles.inputGroup} style={{ gridColumn: '1 / -1' }}>
            <label>Meeting Point Details</label>
            <input type="text" name="meetingPoint" className="input-glass" value={formData.meetingPoint} onChange={handleChange} />
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
