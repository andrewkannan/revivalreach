"use client";
import { useState, useEffect } from "react";
import { Share2, MessageCircle, Copy, Check } from "lucide-react";

export default function EventShareButtons({ event }: { event: any }) {
  const [copied, setCopied] = useState(false);
  const [shareSupported, setShareSupported] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setShareSupported(true);
    }
  }, []);

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

  const handleWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: event.title,
        text: `Join us for: ${event.title}`,
        url: eventUrl,
      });
    } catch (err) {
      console.error("Error sharing", err);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginTop: '20px' }}>
      <button 
        onClick={handleWhatsApp}
        style={{ 
          width: '100%', padding: '12px', background: '#25D366', color: 'white', 
          borderRadius: '8px', border: 'none', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', gap: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' 
        }}
      >
        <MessageCircle size={18} /> Share to WhatsApp
      </button>

      <button 
        onClick={handleCopy}
        style={{ 
          width: '100%', padding: '12px', background: 'var(--card-bg)', color: 'var(--foreground)', 
          borderRadius: '8px', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', gap: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' 
        }}
      >
        {copied ? <Check size={18} color="var(--success)" /> : <Copy size={18} />}
        {copied ? "Copied!" : "Copy Details"}
      </button>

      {shareSupported && (
        <button 
          onClick={handleNativeShare}
          style={{ 
            width: '100%', padding: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', 
            borderRadius: '8px', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' 
          }}
          title="More Share Options"
        >
          <Share2 size={18} /> Share
        </button>
      )}
    </div>
  );
}
