"use client";
import { useState } from "react";
import { CheckCircle, Save, Loader2 } from "lucide-react";

export default function PrayerQueueList({ initialSouls }: { initialSouls: any[] }) {
  const [souls, setSouls] = useState(initialSouls);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Transcription state
  const [transcribingId, setTranscribingId] = useState<string | null>(null);
  const [transcriptionText, setTranscriptionText] = useState<string>("");
  const [savingTranscriptionId, setSavingTranscriptionId] = useState<string | null>(null);

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

  const handleTranscribeSubmit = async (id: string) => {
    if (!transcriptionText.trim()) return;
    setSavingTranscriptionId(id);
    try {
      const res = await fetch(`/api/admin/prayer-requests/${id}/transcribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcription: transcriptionText })
      });
      if (res.ok) {
        setSouls(souls.map(s => s.id === id ? { ...s, prayerNeeds: transcriptionText } : s));
        setTranscribingId(null);
        setTranscriptionText("");
        alert("Transcribed text saved! It will now appear on the prayer ticker.");
      } else {
        alert("Failed to save transcription.");
      }
    } catch (error) {
      alert("Error occurred.");
    }
    setSavingTranscriptionId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {souls.length === 0 && <p>No prayer requests found.</p>}
      {souls.map((soul) => (
        <div key={soul.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 5px 0' }}>{soul.name}</h3>
              <p style={{ margin: '0', fontSize: '0.9rem', opacity: 0.8 }}><strong>Phone:</strong> {soul.phone}</p>
              {soul.event && <p style={{ margin: '0', fontSize: '0.9rem', opacity: 0.8 }}><strong>Event:</strong> {soul.event.title}</p>}
              <p style={{ margin: '0', fontSize: '0.9rem', opacity: 0.8 }}><strong>Added By:</strong> {soul.user.name || soul.user.email}</p>
              
              <div style={{ marginTop: '12px', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '3px solid #f59e0b', padding: '12px', borderRadius: '4px' }}>
                <strong style={{ display: 'block', marginBottom: '8px', color: '#f59e0b' }}>Prayer Needs:</strong>
                
                {soul.prayerNeedsAudioUrl && (
                  <audio controls src={soul.prayerNeedsAudioUrl} style={{ width: '100%', height: '36px', marginBottom: '8px' }} />
                )}
                
                {soul.prayerNeeds ? (
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>{soul.prayerNeeds}</p>
                ) : (
                  <div style={{ marginTop: '8px' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#f59e0b', opacity: 0.8 }}>
                      <em>Audio only. Requires transcription to appear on the global prayer ticker.</em>
                    </p>
                    
                    {transcribingId === soul.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <textarea 
                          value={transcriptionText} 
                          onChange={(e) => setTranscriptionText(e.target.value)} 
                          className="input-glass" 
                          rows={3} 
                          placeholder="Type out the prayer points here..." 
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn-primary" 
                            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }} 
                            onClick={() => handleTranscribeSubmit(soul.id)}
                            disabled={savingTranscriptionId === soul.id}
                          >
                            {savingTranscriptionId === soul.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                            Save Transcription
                          </button>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '8px 16px', fontSize: '0.85rem' }} 
                            onClick={() => { setTranscribingId(null); setTranscriptionText(""); }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '0.85rem', borderColor: '#f59e0b', color: '#f59e0b' }} 
                        onClick={() => { setTranscribingId(soul.id); setTranscriptionText(""); }}
                      >
                        Transcribe Now
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ marginLeft: '16px' }}>
              {soul.prayerEmailSent ? (
                <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
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
        </div>
      ))}
    </div>
  );
}
