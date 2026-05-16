"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./Auth.module.css";
import { Suspense } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

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
      <div className={`glass-panel animate-fade-in ${styles.authBox}`}>
        <h1 className={styles.authTitle}>Welcome Back</h1>
        <p className={styles.authSubtitle}>Sign in to Revival Reach</p>
        
        {error && <div className={styles.error}>{error}</div>}

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
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
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
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className={styles.authFooter}>
          Don't have an account? <Link href="/register">Sign Up</Link>
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
