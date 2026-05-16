"use client";
import { useState } from "react";
import styles from "../../Admin.module.css";
import authStyles from "../../../login/Auth.module.css";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
  const router = useRouter();
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
            <input type="text" name="location" className="input-glass" value={formData.location} onChange={handleChange} required />
          </div>

          <div className={authStyles.inputGroup}>
            <label>Google Maps Link (Optional)</label>
            <input type="url" name="googleMapsLink" className="input-glass" value={formData.googleMapsLink} onChange={handleChange} />
          </div>
          <div className={authStyles.inputGroup}>
            <label>Waze Link (Optional)</label>
            <input type="url" name="wazeLink" className="input-glass" value={formData.wazeLink} onChange={handleChange} />
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
            <label>Leader Name</label>
            <input type="text" name="leaderName" className="input-glass" value={formData.leaderName} onChange={handleChange} />
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
