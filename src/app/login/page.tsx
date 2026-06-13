"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./Auth.module.css";
import { Suspense } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const urlMessage = searchParams.get("message");
  const { status } = useSession();

  useEffect(() => {
    if (urlMessage) {
      // You can store this in a local state or just use it directly. We'll use a local state.
    }
  }, [urlMessage]);

  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '20px' }}>
        <Globe size={16} opacity={0.7} />
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value as "en" | "ta" | "ms")}
          style={{ background: 'transparent', border: 'none', color: 'var(--foreground)', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
        >
          <option value="en" style={{ color: 'black' }}>English</option>
          <option value="ta" style={{ color: 'black' }}>தமிழ்</option>
          <option value="ms" style={{ color: 'black' }}>Melayu</option>
        </select>
      </div>

      <div className={`glass-panel animate-fade-in ${styles.authBox}`}>
        <h1 className={styles.authTitle}>{t('login_welcome')}</h1>
        <p className={styles.authSubtitle}>{t('login_title')}</p>
        
        {urlMessage && <div style={{ color: 'var(--success)', marginBottom: '1rem', textAlign: 'center', background: 'rgba(0,255,0,0.1)', padding: '10px', borderRadius: '5px' }}>{urlMessage}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">{t('login_email')}</label>
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
          <div className={styles.inputGroup}>
            <label htmlFor="password">{t('login_password')}</label>
            <input
              id="password"
              type="password"
              className="input-glass"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={isLoading} style={{ width: '100%', marginTop: '1rem', opacity: isLoading ? 0.7 : 1 }}>
            {isLoading ? t('login_signing_in') : t('login_signin')}
          </button>
        </form>

        <div className={styles.authFooter}>
          <Link href="/forgot-password" style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>
            Forgot Password?
          </Link>
          <div>
            {t('login_no_account')} <Link href="/register">{t('login_signup')}</Link>
          </div>
          <div style={{ marginTop: '10px' }}>
            <a href="https://wa.me/60186647872" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '24px', fontSize: '0.85rem', color: 'var(--foreground)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              Message Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
