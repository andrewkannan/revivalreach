"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";

export default function CheckinPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=/checkin/${eventId}`);
    } else if (status === "authenticated") {
      handleCheckin();
    }
  }, [status, eventId, router]);

  const handleCheckin = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/checkin`, {
        method: "POST",
      });
      
      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to check in");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'white', gap: '20px' }}>
        <Loader2 size={48} className="spin" color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <h2>Checking you in...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '40px auto', textAlign: 'center', color: 'white' }}>
      <div className="glass-panel" style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        {success ? (
          <>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <CheckCircle size={48} />
            </div>
            <h1 style={{ fontSize: '1.8rem', margin: 0 }}>You're Checked In!</h1>
            <p style={{ opacity: 0.8, fontSize: '1.1rem' }}>Welcome to the event. We are glad you're here!</p>
          </>
        ) : (
          <>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
              <XCircle size={48} />
            </div>
            <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Check-in Failed</h1>
            <p style={{ color: '#ef4444' }}>{error}</p>
          </>
        )}
        
        <Link href="/" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block', textDecoration: 'none', padding: '12px 30px' }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
