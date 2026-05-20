"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Admin.module.css";
import { Users, Settings, CalendarRange, Heart } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={styles.adminContainer}>
      <div className={`glass-panel ${styles.adminSidebar}`}>
        <h2 className={styles.sidebarTitle}>Admin Panel</h2>
        <div className={styles.sidebarLinks}>
          <Link href="/admin/users" className={`${styles.sidebarLink} ${pathname === '/admin/users' ? styles.active : ''}`}>
            <Users size={20} /> Users
          </Link>
          <Link href="/admin/events" className={`${styles.sidebarLink} ${pathname === '/admin/events' ? styles.active : ''}`}>
            <CalendarRange size={20} /> Events
          </Link>
          <Link href="/admin/souls" className={`${styles.sidebarLink} ${pathname === '/admin/souls' ? styles.active : ''}`}>
            <Heart size={20} /> Souls
          </Link>
          <Link href="/admin/settings" className={`${styles.sidebarLink} ${pathname === '/admin/settings' ? styles.active : ''}`}>
            <Settings size={20} /> Settings
          </Link>
        </div>
      </div>
      <div className={styles.adminContent}>
        {children}
      </div>
    </div>
  );
}
