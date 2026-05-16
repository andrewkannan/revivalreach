"use client";
import { useState } from "react";
import styles from "../Admin.module.css";
import authStyles from "../../login/Auth.module.css";
import { useRouter } from "next/navigation";

export default function SettingsForm({ initialSettings }: { initialSettings: any }) {
  const [settings, setSettings] = useState(initialSettings);
  const [status, setStatus] = useState({ type: "", message: "" });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch(`/api/admin/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setStatus({ type: "success", message: "Settings updated successfully" });
        router.refresh();
      } else {
        const error = await res.json();
        setStatus({ type: "error", message: error.message || "Failed to update settings" });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Server error occurred" });
    }
  };

  return (
    <div>
      {status.message && (
        <div className={status.type === 'error' ? authStyles.error : authStyles.success}>
          {status.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ marginBottom: '16px' }}>SMTP Configuration</h2>
          <p style={{ opacity: 0.7, marginBottom: '24px', fontSize: '0.9rem' }}>
            Configure your mail server details to enable automated emails for user signups, approvals, and event reminders.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className={authStyles.inputGroup}>
              <label>SMTP Host</label>
              <input type="text" className="input-glass" value={settings.smtpHost || ""} onChange={(e) => setSettings({...settings, smtpHost: e.target.value})} placeholder="smtp.example.com" />
            </div>
            <div className={authStyles.inputGroup}>
              <label>SMTP Port</label>
              <input type="number" className="input-glass" value={settings.smtpPort || ""} onChange={(e) => setSettings({...settings, smtpPort: parseInt(e.target.value) || null})} placeholder="587" />
            </div>
          </div>
          
          <div className={authStyles.inputGroup} style={{ marginBottom: '16px' }}>
            <label>SMTP User / Email</label>
            <input type="text" className="input-glass" value={settings.smtpUser || ""} onChange={(e) => setSettings({...settings, smtpUser: e.target.value})} placeholder="user@example.com" />
          </div>
          
          <div className={authStyles.inputGroup}>
            <label>SMTP Password / App Password</label>
            <input type="password" className="input-glass" value={settings.smtpPass || ""} onChange={(e) => setSettings({...settings, smtpPass: e.target.value})} placeholder="••••••••" />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ marginBottom: '16px' }}>WhatsApp Integration</h2>
          <div className={authStyles.inputGroup}>
            <label>Default Message Template</label>
            <textarea 
              className="input-glass" 
              style={{ minHeight: '100px', resize: 'vertical' }}
              value={settings.whatsappTemplate || ""} 
              onChange={(e) => setSettings({...settings, whatsappTemplate: e.target.value})}
              placeholder="Hi, I'm interested in the event..."
            />
            <small style={{ opacity: 0.6, marginTop: '4px' }}>This text will be pre-filled when a user clicks the WhatsApp link to contact a Revival Leader.</small>
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
          Save Settings
        </button>
      </form>
    </div>
  );
}
