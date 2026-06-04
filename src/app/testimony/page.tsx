"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Plus, MessageSquare, Quote, Mic, Square, Trash2, Play, Pause, Loader2 } from "lucide-react";
import styles from "../Dashboard.module.css";
import { useRouter } from "next/navigation";

export default function TestimonyPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [testimonies, setTestimonies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchTestimonies();
  }, []);

  const fetchTestimonies = async () => {
    try {
      const res = await fetch("/api/testimonies");
      if (res.ok) {
        const data = await res.json();
        setTestimonies(data);
      }
    } catch (error) {
      console.error("Failed to fetch testimonies:", error);
    } finally {
      setLoading(false);
    }
  };

  // Recording Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop()); // release mic
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
      } else {
        audioPlayerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !audioBlob) return;
    
    setIsSubmitting(true);
    let finalAudioUrl = null;

    try {
      if (audioBlob) {
        // 1. Get presigned URL
        const presignedRes = await fetch("/api/testimonies/presigned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            filename: "testimony.webm", 
            contentType: "audio/webm" 
          })
        });

        if (!presignedRes.ok) {
          const text = await presignedRes.text();
          throw new Error(`Failed to get upload URL: ${text}`);
        }
        
        const { signedUrl, publicUrl } = await presignedRes.json();

        // 2. Upload to S3
        const uploadRes = await fetch(signedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "audio/webm"
          },
          body: audioBlob
        });

        if (!uploadRes.ok) {
          const text = await uploadRes.text();
          throw new Error(`Failed to upload audio to S3: ${uploadRes.status} ${uploadRes.statusText} - ${text}`);
        }
        
        finalAudioUrl = publicUrl;
      }

      // 3. Submit Testimony
      const res = await fetch("/api/testimonies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: content.trim() || null, 
          audioUrl: finalAudioUrl 
        })
      });
      
      if (res.ok) {
        setContent("");
        deleteRecording();
        setIsFormOpen(false);
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        const text = await res.text();
        throw new Error(`Backend error: ${res.status} ${text}`);
      }
    } catch (error) {
      console.error("Failed to submit testimony:", error);
      alert(`Error submitting testimony:\n${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenForm = () => {
    if (!session) {
      router.push("/login");
      return;
    }
    setIsFormOpen(true);
  };

  return (
    <div className={styles.dashboard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Testimonies</h1>
          <p style={{ opacity: 0.8, marginTop: '8px' }}>Read and listen to stories of how God is moving.</p>
        </div>
        {!isFormOpen && (
          <button onClick={handleOpenForm} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', padding: 0, borderRadius: '50%' }}>
            <Plus size={24} />
          </button>
        )}
      </div>

      {submitSuccess && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', padding: '16px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
          <strong>Hallelujah!</strong> Your testimony has been submitted and is pending approval.
        </div>
      )}

      {isFormOpen && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '30px', animation: 'slideDown 0.3s ease-out' }}>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 16px 0' }}>Share Your Testimony</h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Audio Recorder Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.2)' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.9 }}>Record Audio (Optional)</label>
              
              {!audioUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {!isRecording ? (
                    <button type="button" onClick={startRecording} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--danger, #ef4444)' }}>
                      <Mic size={18} /> Start Recording
                    </button>
                  ) : (
                    <button type="button" onClick={stopRecording} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderColor: 'var(--danger, #ef4444)', color: 'var(--danger, #ef4444)' }}>
                      <Square size={18} fill="currentColor" /> Stop Recording
                    </button>
                  )}
                  
                  {isRecording && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger, #ef4444)', fontWeight: 'bold', animation: 'pulse 1.5s infinite' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'currentColor' }}></div>
                      {formatTime(recordingTime)}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                  <button type="button" onClick={togglePlay} className="btn-secondary" style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <div style={{ flex: 1, fontWeight: 600 }}>Audio Ready</div>
                  <button type="button" onClick={deleteRecording} style={{ background: 'transparent', border: 'none', color: 'var(--danger, #ef4444)', cursor: 'pointer', padding: '8px' }}>
                    <Trash2 size={20} />
                  </button>
                  <audio 
                    ref={audioPlayerRef} 
                    src={audioUrl} 
                    onEnded={() => setIsPlaying(false)} 
                    style={{ display: 'none' }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.9 }}>Written Testimony {audioBlob ? '(Optional)' : ''}</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required={!audioBlob}
                style={{ 
                  width: '100%', 
                  minHeight: '150px', 
                  resize: 'vertical',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '1rem',
                  fontFamily: 'inherit'
                }}
                placeholder="Share what God has done..."
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="submit" className="btn-primary" disabled={isSubmitting || (!content.trim() && !audioBlob)} style={{ flex: 1 }}>
                {isSubmitting ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...
                  </span>
                ) : "Submit Testimony"}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)} style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', opacity: 0.5, padding: '40px' }}>Loading testimonies...</div>
      ) : testimonies.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', opacity: 0.7 }}>
          <MessageSquare size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5, display: 'block' }} />
          <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>No Testimonies Yet</p>
          <p style={{ marginTop: '8px' }}>Be the first to share what God has done!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {testimonies.map((testimony) => (
            <div key={testimony.id} className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
              <Quote size={32} style={{ position: 'absolute', top: '24px', right: '24px', opacity: 0.1 }} />
              
              {testimony.audioUrl && (
                <div style={{ marginBottom: testimony.content ? '16px' : '0' }}>
                  <audio controls src={testimony.audioUrl} style={{ width: '100%', height: '40px', borderRadius: '8px' }} />
                </div>
              )}

              {testimony.content && (
                <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '16px', position: 'relative', zIndex: 1 }}>
                  "{testimony.content}"
                </p>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginTop: '16px' }}>
                <div style={{ background: 'var(--primary)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: 'white', fontWeight: 'bold' }}>
                  {testimony.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{testimony.name}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{new Date(testimony.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
