"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, User, ShieldCheck } from "lucide-react";
import styles from "./Nav.module.css";

import { useSession } from "next-auth/react";

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className={styles.bottomNav}>
      <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}>
        <Home size={24} />
        <span>Home</span>
      </Link>
      <Link href="/souls" className={`${styles.navLink} ${pathname === '/souls' ? styles.active : ''}`}>
        <Calendar size={24} />
        <span>Souls</span>
      </Link>
      <Link href="/profile" className={`${styles.navLink} ${pathname === '/profile' ? styles.active : ''}`}>
        <User size={24} style={session ? { filter: 'drop-shadow(0 0 8px var(--primary))', color: 'var(--primary)' } : {}} />
        <span>Profile</span>
      </Link>
      <Link href="/admin" className={`${styles.navLink} ${pathname?.startsWith('/admin') ? styles.active : ''}`}>
        <ShieldCheck size={24} />
        <span>Admin</span>
      </Link>
    </nav>
  );
}
