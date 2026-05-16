"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinButton({ event }: { event: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event.id })
      });
      if (res.ok) {
        if (event.whatsappGroupLink) {
          window.open(event.whatsappGroupLink, '_blank');
        } else {
          alert("Joined successfully!");
        }
        router.refresh(); // Refresh the page to update participant count
      } else {
        const error = await res.json();
        alert(error.message || "Failed to join event");
      }
    } catch (err) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleJoin}
      disabled={loading}
      style={{ 
        width: '100%', 
        padding: '16px', 
        fontSize: '1.1rem', 
        fontWeight: 'bold', 
        borderRadius: '12px',
        background: 'var(--primary)',
        color: 'white',
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1
      }}
    >
      {loading ? "Joining..." : "Join Revival"}
    </button>
  );
}
