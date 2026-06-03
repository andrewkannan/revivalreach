"use client";
import { useState, useEffect } from "react";
import styles from "../Admin.module.css";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPass: "",
    prayerEmailTargets: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        setSettings({
          smtpHost: data.smtpHost || "",
          smtpPort: data.smtpPort || "",
          smtpUser: data.smtpUser || "",
          smtpPass: data.smtpPass || "",
          prayerEmailTargets: data.prayerEmailTargets || "",
        });
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setMessage("Settings saved successfully!");
      } else {
        setMessage("Failed to save settings.");
      }
    } catch (err) {
      setMessage("An error occurred.");
    }
    setSaving(false);
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className={`glass-panel ${styles.adminContent}`} style={{ padding: '30px' }}>
      <h1 className={styles.pageTitle}>System Settings</h1>
      
      {message && <div style={{ padding: '10px', marginBottom: '20px', background: 'rgba(0,255,0,0.1)', color: 'var(--success)' }}>{message}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3>Prayer Request Queue</h3>
          <p style={{ opacity: 0.8, marginBottom: '15px' }}>Configure the email addresses that will receive prayer requests when verified.</p>
          <label style={{ display: 'block', marginBottom: '5px' }}>Target Emails (Comma separated)</label>
          <input 
            type="text" 
            className="input-glass"
            placeholder="pastor@church.com, prayerteam@church.com"
            value={settings.prayerEmailTargets}
            onChange={e => setSettings({...settings, prayerEmailTargets: e.target.value})}
            style={{ width: '100%' }}
          />
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3>SMTP Configuration</h3>
          <p style={{ opacity: 0.8, marginBottom: '15px' }}>Configure the outgoing email server used by the system.</p>
          
          <label style={{ display: 'block', marginBottom: '5px' }}>SMTP Host</label>
          <input 
            type="text" 
            className="input-glass"
            placeholder="smtp.gmail.com"
            value={settings.smtpHost}
            onChange={e => setSettings({...settings, smtpHost: e.target.value})}
            style={{ width: '100%', marginBottom: '15px' }}
          />

          <label style={{ display: 'block', marginBottom: '5px' }}>SMTP Port</label>
          <input 
            type="number" 
            className="input-glass"
            placeholder="465"
            value={settings.smtpPort}
            onChange={e => setSettings({...settings, smtpPort: e.target.value})}
            style={{ width: '100%', marginBottom: '15px' }}
          />

          <label style={{ display: 'block', marginBottom: '5px' }}>SMTP Username</label>
          <input 
            type="text" 
            className="input-glass"
            value={settings.smtpUser}
            onChange={e => setSettings({...settings, smtpUser: e.target.value})}
            style={{ width: '100%', marginBottom: '15px' }}
          />

          <label style={{ display: 'block', marginBottom: '5px' }}>SMTP Password</label>
          <input 
            type="password" 
            className="input-glass"
            value={settings.smtpPass}
            onChange={e => setSettings({...settings, smtpPass: e.target.value})}
            style={{ width: '100%' }}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
