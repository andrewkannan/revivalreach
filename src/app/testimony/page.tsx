"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Plus, MessageSquare, Quote, Mic, Square, Trash2, Play, Pause, Loader2, Edit2, X } from "lucide-react";
import styles from "../Dashboard.module.css";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TestimonyPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [testimonies, setTestimonies] = useState<any[]>([]);
  const [myTestimonies, setMyTestimonies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [content, setContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
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
    if (session) {
      fetchMyTestimonies();
    }
  }, [session]);

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

  const fetchMyTestimonies = async () => {
    try {
      const res = await fetch("/api/testimonies/me");
      if (res.ok) {
        const data = await res.json();
        setMyTestimonies(data);
      }
    } catch (error) {
      console.error("Failed to fetch my testimonies:", error);
    }
  };

  // Recording Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let mimeType = '';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        }
      }
      
      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const actualMimeType = mediaRecorder.mimeType || 'audio/mp4';
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMimeType });
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

  const handleEdit = (testimony: any) => {
    setEditingId(testimony.id);
    setContent(testimony.content || "");
    setIsPrivate(testimony.isPrivate || false);
    setAudioBlob(null);
    setAudioUrl(testimony.audioUrl || null);
    setIsFormOpen(true);
    setSubmitSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !audioBlob && !audioUrl) return;
    
    setIsSubmitting(true);
    let finalAudioUrl = audioUrl && !audioBlob ? audioUrl : null; // Keep existing if not re-recorded

    try {
      if (audioBlob) {
        const actualMimeType = audioBlob.type || 'audio/mp4';
        const extension = actualMimeType.includes('webm') ? 'webm' : 'mp4';
        
        // 1. Get presigned URL
        const presignedRes = await fetch("/api/testimonies/presigned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            filename: `testimony.${extension}`, 
            contentType: actualMimeType 
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
            "Content-Type": actualMimeType
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
      const url = editingId ? `/api/testimonies/${editingId}` : "/api/testimonies";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: content.trim() || null, 
          audioUrl: finalAudioUrl,
          isPrivate
        })
      });
      
      if (res.ok) {
        setContent("");
        deleteRecording();
        setIsFormOpen(false);
        setEditingId(null);
        setSubmitSuccess(true);
        fetchTestimonies();
        fetchMyTestimonies();
        setTimeout(() => setSubmitSuccess(false), 8000);
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
    setEditingId(null);
    setContent("");
    setIsPrivate(false);
    deleteRecording();
    setIsFormOpen(true);
    setSubmitSuccess(false);
  };

  return (
    <div className={styles.dashboard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{t('testimony_title')}</h1>
          <p style={{ opacity: 0.8, marginTop: '8px' }}>{t('testimony_subtitle')}</p>
        </div>
        {!isFormOpen && (
          <button onClick={handleOpenForm} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', padding: 0, borderRadius: '50%' }}>
            <Plus size={24} />
          </button>
        )}
      </div>

      {submitSuccess && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', padding: '16px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
          {t('testimony_success_msg')}
        </div>
      )}

      {isFormOpen && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '30px', animation: 'slideDown 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{editingId ? t('testimony_edit') : t('testimony_share')}</h2>
            <button onClick={() => setIsFormOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--foreground)', opacity: 0.6, cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Audio Recorder Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--subtle-bg)', padding: '16px', borderRadius: '12px', border: '1px dashed var(--subtle-border)' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.9 }}>{t('testimony_record_audio')}</label>
              
              {!audioUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {!isRecording ? (
                    <button type="button" onClick={startRecording} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--danger, #ef4444)' }}>
                      <Mic size={18} /> {t('testimony_start_recording')}
                    </button>
                  ) : (
                    <button type="button" onClick={stopRecording} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderColor: 'var(--danger, #ef4444)', color: 'var(--danger, #ef4444)' }}>
                      <Square size={18} fill="currentColor" /> {t('testimony_stop_recording')}
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
                  <div style={{ flex: 1, fontWeight: 600 }}>{t('testimony_audio_ready')}</div>
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
              <label style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.9 }}>{t('testimony_written')} {(audioBlob || audioUrl) ? t('testimony_optional') : ''}</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required={!(audioBlob || audioUrl)}
                style={{ 
                  width: '100%', 
                  minHeight: '150px', 
                  resize: 'vertical',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--foreground)',
                  fontSize: '1rem',
                  fontFamily: 'inherit'
                }}
                placeholder={t('testimony_placeholder')}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: isPrivate ? 'rgba(99, 102, 241, 0.1)' : 'var(--subtle-bg)', padding: '12px 16px', borderRadius: '12px', border: isPrivate ? '1px solid var(--primary)' : '1px solid var(--subtle-border)', transition: 'all 0.2s ease' }}>
              <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} style={{ display: 'none' }} />
              <div style={{ width: '40px', height: '24px', background: isPrivate ? 'var(--primary)' : 'var(--subtle-border)', borderRadius: '12px', position: 'relative', transition: 'all 0.2s ease', flexShrink: 0 }}>
                <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: isPrivate ? '18px' : '2px', transition: 'all 0.2s ease' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Private Testimony</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>This testimony will only be visible to you and won't be shared publicly.</span>
              </div>
            </label>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="submit" className="btn-primary" disabled={isSubmitting || (!content.trim() && !audioBlob && !audioUrl)} style={{ flex: 1 }}>
                {isSubmitting ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> {editingId ? t('testimony_updating') : t('testimony_uploading')}
                  </span>
                ) : (editingId ? t('testimony_update') : t('testimony_submit'))}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)} style={{ flex: 1 }}>
                {t('engage_cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {myTestimonies.length > 0 && !isFormOpen && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', fontWeight: 600 }}>{t('testimony_my_submissions')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {myTestimonies.map(testimony => (
              <div key={testimony.id} className="glass-panel" style={{ padding: '20px', borderLeft: testimony.status === 'APPROVED' ? '4px solid var(--success)' : testimony.status === 'REJECTED' ? '4px solid var(--danger)' : '4px solid #f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 600, opacity: 0.8, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {new Date(testimony.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {testimony.isPrivate && <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem' }}>Private</span>}
                  </div>
                  {testimony.status === 'PENDING' && !testimony.isPrivate && (
                    <button onClick={() => handleEdit(testimony)} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Edit2 size={14} /> Edit
                    </button>
                  )}
                </div>
                {testimony.audioUrl && (
                  <audio controls src={testimony.audioUrl} style={{ width: '100%', height: '36px', marginBottom: testimony.content ? '12px' : '0' }} />
                )}
                {testimony.content && (
                  <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>"{testimony.content}"</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', opacity: 0.5, padding: '40px' }}>{t('testimony_loading')}</div>
      ) : testimonies.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', opacity: 0.7 }}>
          <MessageSquare size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5, display: 'block' }} />
          <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>{t('testimony_no_testimonies')}</p>
          <p style={{ marginTop: '8px' }}>{t('testimony_be_first')}</p>
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
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid var(--subtle-border)', paddingTop: '16px', marginTop: '16px' }}>
                <div style={{ background: 'var(--primary)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: 'white', fontWeight: 'bold', overflow: 'hidden' }}>
                  {testimony.user?.image ? (
                    <img src={testimony.user.image} alt={testimony.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    testimony.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    <a href="#" style={{ color: 'var(--foreground)', textDecoration: 'none' }}>{testimony.name}</a>
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{new Date(testimony.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
