"use client";
import { useSession, signOut } from "next-auth/react";
import styles from "../Dashboard.module.css";
import authStyles from "../login/Auth.module.css";
import { User, Mail, ShieldCheck, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <div style={{ padding: '50px', textAlign: 'center', color: 'white' }}>Loading...</div>;
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.sectionTitle}>My Profile</h1>
      
      <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--primary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white', fontWeight: 'bold' }}>
            {session.user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{session.user.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8, fontSize: '0.9rem', marginTop: '4px' }}>
              <Mail size={14} /> {session.user.email}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--card-border)', margin: '10px 0' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={20} color="var(--primary)" />
          <div>
            <strong>Account Role:</strong> <span style={{ textTransform: 'capitalize' }}>{session.user.role.toLowerCase()}</span>
          </div>
        </div>

        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px', background: 'var(--danger)', borderColor: 'var(--danger)' }}
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
}
