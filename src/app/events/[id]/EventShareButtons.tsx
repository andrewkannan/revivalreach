"use client";
import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function EventShareButtons({ event }: { event: any }) {
  const [copied, setCopied] = useState(false);

  const eventDate = new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  const shareId = event.slug || event.id;
  const eventUrl = typeof window !== 'undefined' ? `${window.location.origin}/events/${shareId}` : `https://revivalreach.com/events/${shareId}`;
  
  const shareText = `*Join us for: ${event.title}*\n🗓 *Date:* ${eventDate}\n📍 *Location:* ${event.location}\n\n*Click here to join the team and find out more:*\n${eventUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleNativeShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({
          title: event.title,
          text: `Join us for: ${event.title}`,
          url: eventUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Error sharing", err);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
      <button 
        onClick={handleNativeShare}
        style={{ 
          width: '100%', maxWidth: '300px', padding: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', 
          borderRadius: '8px', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', gap: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' 
        }}
        title="Share Revival"
      >
        {copied ? <Check size={18} color="var(--success)" /> : <Share2 size={18} />}
        {copied ? "Copied to Clipboard!" : "Share"}
      </button>
    </div>
  );
}
