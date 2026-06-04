"use client";
import { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, Play, Pause, Loader2 } from "lucide-react";

interface AudioRecorderProps {
  label: string;
  onAudioReady: (audioUrl: string | null) => void;
  initialAudioUrl?: string | null;
}

export default function AudioRecorder({ label, onAudioReady, initialAudioUrl }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl || null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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

      mediaRecorder.onstop = async () => {
        const actualMimeType = mediaRecorder.mimeType || 'audio/mp4';
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMimeType });
        stream.getTracks().forEach(track => track.stop());
        
        await uploadAudio(audioBlob, actualMimeType);
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

  const uploadAudio = async (audioBlob: Blob, mimeType: string) => {
    setIsUploading(true);
    try {
      const extension = mimeType.includes('webm') ? 'webm' : 'mp4';
      
      // 1. Get presigned URL
      const presignedRes = await fetch("/api/testimonies/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          filename: `engage.${extension}`, 
          contentType: mimeType 
        })
      });

      if (!presignedRes.ok) throw new Error("Failed to get upload URL");
      
      const { signedUrl, publicUrl } = await presignedRes.json();

      // 2. Upload to S3
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": mimeType },
        body: audioBlob
      });

      if (!uploadRes.ok) throw new Error("Failed to upload audio to S3");
      
      setAudioUrl(publicUrl);
      onAudioReady(publicUrl);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload audio.");
    } finally {
      setIsUploading(false);
    }
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    setRecordingTime(0);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    onAudioReady(null);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.2)' }}>
      <label style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.9 }}>{label}</label>
      
      {isUploading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', color: 'var(--primary)' }}>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Uploading audio...
        </div>
      ) : !audioUrl ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {!isRecording ? (
            <button type="button" onClick={startRecording} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--danger, #ef4444)' }}>
              <Mic size={18} /> Record Audio
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
  );
}
