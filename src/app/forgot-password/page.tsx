"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "../login/Auth.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("If an account with that email exists, a password reset link has been sent.");
      } else {
        setError(data.message || "An error occurred");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={`glass-panel animate-fade-in ${styles.authBox}`}>
        <h1 className={styles.authTitle}>Forgot Password</h1>
        <p className={styles.authSubtitle}>Enter your email to receive a reset link</p>
        
        {error && <div className={styles.error}>{error}</div>}
        {message && <div style={{ color: 'var(--success)', marginBottom: '1rem', textAlign: 'center', background: 'rgba(0,255,0,0.1)', padding: '10px', borderRadius: '5px' }}>{message}</div>}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input-glass"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: '100%', marginTop: '1rem', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className={styles.authFooter}>
          Remember your password? <Link href="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
