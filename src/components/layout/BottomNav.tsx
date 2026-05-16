"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, User, ShieldCheck } from "lucide-react";
import styles from "./Nav.module.css";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav}>
      <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}>
        <Home size={24} />
        <span>Home</span>
      </Link>
      <Link href="/events" className={`${styles.navLink} ${pathname === '/events' ? styles.active : ''}`}>
        <Calendar size={24} />
        <span>Events</span>
      </Link>
      <Link href="/profile" className={`${styles.navLink} ${pathname === '/profile' ? styles.active : ''}`}>
        <User size={24} />
        <span>Profile</span>
      </Link>
      <Link href="/admin" className={`${styles.navLink} ${pathname?.startsWith('/admin') ? styles.active : ''}`}>
        <ShieldCheck size={24} />
        <span>Admin</span>
      </Link>
    </nav>
  );
}
