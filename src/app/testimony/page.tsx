"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, MessageSquare, Quote } from "lucide-react";
import styles from "../Dashboard.module.css";
import authStyles from "../login/Auth.module.css";
import { useRouter } from "next/navigation";

export default function TestimonyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [testimonies, setTestimonies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/testimonies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      
      if (res.ok) {
        setContent("");
        setIsFormOpen(false);
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 5000);
      }
    } catch (error) {
      console.error("Failed to submit testimony:", error);
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
          <p style={{ opacity: 0.8, marginTop: '8px' }}>Read stories of how God is moving in our lives.</p>
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
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.9 }}>Your Testimony</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
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
              <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ flex: 1 }}>
                {isSubmitting ? "Submitting..." : "Submit Testimony"}
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
              <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '16px', position: 'relative', zIndex: 1 }}>
                "{testimony.content}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
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
