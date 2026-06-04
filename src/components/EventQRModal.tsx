"use client";

import { X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface EventQRModalProps {
  eventId: string;
  eventTitle: string;
  onClose: () => void;
}

export default function EventQRModal({ eventId, eventTitle, onClose }: EventQRModalProps) {
  const checkinUrl = typeof window !== 'undefined' ? `${window.location.origin}/checkin/${eventId}` : '';

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--card-bg)',
        padding: '30px',
        borderRadius: '16px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.1)'
      }} onClick={e => e.stopPropagation()}>
        
        <button onClick={onClose} style={{
          position: 'absolute', top: '15px', right: '15px',
          background: 'none', border: 'none', color: 'white', cursor: 'pointer'
        }}>
          <X size={24} />
        </button>

        <h2 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>{eventTitle}</h2>
        <p style={{ opacity: 0.8, marginBottom: '25px', fontSize: '0.95rem' }}>Scan this QR code to check in to the revival event.</p>

        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', display: 'inline-block' }}>
          <QRCodeSVG value={checkinUrl} size={200} level="H" includeMargin={false} />
        </div>
        
        <p style={{ marginTop: '25px', fontSize: '0.8rem', opacity: 0.6, wordBreak: 'break-all' }}>
          Or visit:<br/>
          {checkinUrl}
        </p>
      </div>
    </div>
  );
}
