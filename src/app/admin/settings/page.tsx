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
    autoFollowUpReminders: true,
    rolePermissions: {} as Record<string, string[]>
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [testMessage, setTestMessage] = useState("");

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
          autoFollowUpReminders: data.autoFollowUpReminders !== undefined ? data.autoFollowUpReminders : true,
          rolePermissions: data.rolePermissions ? (typeof data.rolePermissions === 'string' ? JSON.parse(data.rolePermissions) : data.rolePermissions) : {}
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

  const handleTestEmail = async () => {
    if (!testEmail) return;
    setSendingTest(true);
    setTestMessage("");
    try {
      const res = await fetch("/api/admin/settings/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setTestMessage(data.message || "Test email sent successfully!");
      } else {
        setTestMessage(data.message || "Failed to send test email.");
      }
    } catch (err) {
      setTestMessage("An error occurred while sending test email.");
    }
    setSendingTest(false);
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

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3>Test Email Setup</h3>
          <p style={{ opacity: 0.8, marginBottom: '15px' }}>Test your SMTP configuration by sending a test email.</p>
          {testMessage && <div style={{ padding: '10px', marginBottom: '15px', background: testMessage.includes('Failed') || testMessage.includes('error') ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.1)', color: testMessage.includes('Failed') || testMessage.includes('error') ? 'var(--error)' : 'var(--success)' }}>{testMessage}</div>}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="email" 
              className="input-glass"
              placeholder="Enter test email address"
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              style={{ flex: 1 }}
            />
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={handleTestEmail}
              disabled={sendingTest || !testEmail}
            >
              {sendingTest ? "Sending..." : "Send Test Email"}
            </button>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3>Automated Systems</h3>
          <p style={{ opacity: 0.8, marginBottom: '15px' }}>Configure automated background tasks.</p>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={settings.autoFollowUpReminders}
              onChange={e => setSettings({...settings, autoFollowUpReminders: e.target.checked})}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontWeight: 500 }}>Enable Follow-up Reminders</span>
          </label>
          <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '5px', marginLeft: '28px' }}>
            Sends emails to users who haven't followed up on Engage records after 24 hours, 3 days, and 7 days.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3>Role Permissions (LEADER)</h3>
          <p style={{ opacity: 0.8, marginBottom: '15px' }}>Select which admin modules are accessible to the LEADER role.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { path: '/admin/my-team', label: 'My Team' },
              { path: '/admin/users', label: 'Users' },
              { path: '/admin/leaders', label: 'Revival Leaders' },
              { path: '/admin/events', label: 'Events' },
              { path: '/admin/engage', label: 'Engage (Souls)' },
              { path: '/admin/prayer-queue', label: 'Prayer Queue' },
              { path: '/admin/evangelism', label: 'Evangelism Requests' },
              { path: '/admin/testimonies', label: 'Testimonies' }
            ].map(mod => {
              const leaderPerms = settings.rolePermissions?.LEADER || [];
              const isChecked = leaderPerms.includes(mod.path);
              return (
                <label key={mod.path} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={isChecked}
                    onChange={(e) => {
                      const newPerms = e.target.checked 
                        ? [...leaderPerms, mod.path]
                        : leaderPerms.filter(p => p !== mod.path);
                      setSettings({
                        ...settings,
                        rolePermissions: {
                          ...settings.rolePermissions,
                          LEADER: newPerms
                        }
                      });
                    }}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>{mod.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
