"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinButton({ event, initialHasJoined = false }: { event: any, initialHasJoined?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [hasJoined, setHasJoined] = useState(initialHasJoined);
  const router = useRouter();

  const handleJoinToggle = async () => {
    setLoading(true);
    try {
      const method = hasJoined ? "DELETE" : "POST";
      const res = await fetch(`/api/events/join`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id })
      });
      
      if (res.ok) {
        if (!hasJoined) {
          if (event.whatsappGroupLink) {
            window.open(event.whatsappGroupLink, '_blank');
          } else {
            alert("Joined successfully!");
          }
        }
        setHasJoined(!hasJoined);
        router.refresh(); // Refresh the page to update participant count and sensitive info
      } else {
        const error = await res.json();
        alert(error.message || `Failed to ${hasJoined ? 'unjoin' : 'join'} event`);
      }
    } catch (err) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleJoinToggle}
      disabled={loading}
      style={{ 
        width: '100%', 
        padding: '16px', 
        fontSize: '1.1rem', 
        fontWeight: 'bold', 
        borderRadius: '12px',
        background: hasJoined ? 'transparent' : 'var(--primary)',
        color: hasJoined ? 'var(--danger)' : 'var(--foreground)',
        border: hasJoined ? '2px solid var(--danger)' : 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1
      }}
    >
      {loading ? "Processing..." : hasJoined ? "Unjoin Revival" : "Join Revival"}
    </button>
  );
}
