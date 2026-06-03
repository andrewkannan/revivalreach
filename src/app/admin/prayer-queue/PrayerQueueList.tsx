"use client";
import { useState } from "react";
import { CheckCircle } from "lucide-react";

export default function PrayerQueueList({ initialSouls }: { initialSouls: any[] }) {
  const [souls, setSouls] = useState(initialSouls);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleVerify = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await fetch("/api/admin/prayer-requests/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      
      if (res.ok) {
        setSouls(souls.map(s => s.id === id ? { ...s, prayerEmailSent: true } : s));
        alert("Prayer request verified and email sent!");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to verify.");
      }
    } catch (error) {
      alert("Error occurred.");
    }
    setLoadingId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {souls.length === 0 && <p>No prayer requests found.</p>}
      {souls.map((soul) => (
        <div key={soul.id} className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: '0 0 5px 0' }}>{soul.name}</h3>
            <p style={{ margin: '0', fontSize: '0.9rem', opacity: 0.8 }}><strong>Phone:</strong> {soul.phone}</p>
            <p style={{ margin: '0', fontSize: '0.9rem', opacity: 0.8 }}><strong>Needs:</strong> {soul.prayerNeeds || "Not specified"}</p>
            {soul.event && <p style={{ margin: '0', fontSize: '0.9rem', opacity: 0.8 }}><strong>Event:</strong> {soul.event.title}</p>}
            <p style={{ margin: '0', fontSize: '0.9rem', opacity: 0.8 }}><strong>Added By:</strong> {soul.user.name || soul.user.email}</p>
          </div>
          <div>
            {soul.prayerEmailSent ? (
              <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle size={18} /> Sent
              </span>
            ) : (
              <button 
                className="btn-primary" 
                onClick={() => handleVerify(soul.id)}
                disabled={loadingId === soul.id}
              >
                {loadingId === soul.id ? "Sending..." : "Verify & Send"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
