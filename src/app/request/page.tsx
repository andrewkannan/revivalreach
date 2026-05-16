"use client";
import { useState } from "react";
import styles from "../login/Auth.module.css";
import { useRouter } from "next/navigation";

export default function RequestEvangelismPage() {
  const [name, setName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [area, setArea] = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    try {
      const res = await fetch(`/api/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contactInfo, area, details }),
      });

      if (res.ok) {
        setStatus({ type: "success", message: "Request submitted successfully. We will contact you soon!" });
        setName("");
        setContactInfo("");
        setArea("");
        setDetails("");
        setTimeout(() => router.push("/"), 3000);
      } else {
        const error = await res.json();
        setStatus({ type: "error", message: error.message || "Failed to submit request" });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Server error occurred" });
    }
  };

  return (
    <div className={styles.authContainer} style={{ padding: '20px' }}>
      <div className={`glass-panel animate-fade-in ${styles.authBox}`} style={{ maxWidth: '600px' }}>
        <h1 className={styles.authTitle}>Request Evangelism</h1>
        <p className={styles.authSubtitle} style={{ textAlign: 'center' }}>
          Would you like us to come to your area? Fill out the form below and a Revival Leader will get in touch with you.
        </p>

        {status.message && (
          <div className={status.type === 'error' ? styles.error : styles.success}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.inputGroup}>
            <label>Your Name</label>
            <input type="text" className="input-glass" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Contact Info (Phone / Email)</label>
            <input type="text" className="input-glass" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Area / Location</label>
            <input type="text" className="input-glass" value={area} onChange={(e) => setArea(e.target.value)} required placeholder="e.g., Downtown, Main Street..." />
          </div>
          <div className={styles.inputGroup}>
            <label>Additional Details</label>
            <textarea 
              className="input-glass" 
              value={details} 
              onChange={(e) => setDetails(e.target.value)} 
              style={{ minHeight: '100px', resize: 'vertical' }}
              placeholder="Tell us more about the situation or best time to visit..."
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}
