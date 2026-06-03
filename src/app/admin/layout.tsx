"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Admin.module.css";
import { Users, Settings, CalendarRange, Heart, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const isLeader = session?.user?.role === "LEADER";

  return (
    <div className={styles.adminContainer}>
      <div className={`glass-panel ${styles.adminSidebar}`}>
        <h2 className={styles.sidebarTitle}>{isAdmin ? "Admin Panel" : "Leader Panel"}</h2>
        <div className={styles.sidebarLinks}>
          {(isAdmin || isLeader) && (
            <Link href="/admin/my-team" className={`${styles.sidebarLink} ${pathname === '/admin/my-team' ? styles.active : ''}`}>
              <ShieldCheck size={20} /> My Team
            </Link>
          )}
          {isAdmin && (
            <>
              <Link href="/admin/users" className={`${styles.sidebarLink} ${pathname === '/admin/users' ? styles.active : ''}`}>
                <Users size={20} /> Users
              </Link>
              <Link href="/admin/leaders" className={`${styles.sidebarLink} ${pathname === '/admin/leaders' ? styles.active : ''}`}>
                <Users size={20} /> Revival Leaders
              </Link>
              <Link href="/admin/events" className={`${styles.sidebarLink} ${pathname === '/admin/events' ? styles.active : ''}`}>
                <CalendarRange size={20} /> Events
              </Link>
              <Link href="/admin/engage" className={`${styles.sidebarLink} ${pathname === '/admin/engage' ? styles.active : ''}`}>
                <Heart size={20} /> Engage
              </Link>
              <Link href="/admin/prayer-queue" className={`${styles.sidebarLink} ${pathname === '/admin/prayer-queue' ? styles.active : ''}`}>
                <Heart size={20} /> Prayer Queue
              </Link>
              <Link href="/admin/evangelism" className={`${styles.sidebarLink} ${pathname === '/admin/evangelism' ? styles.active : ''}`}>
                <Heart size={20} /> Evangelism Requests
              </Link>
              <Link href="/admin/settings" className={`${styles.sidebarLink} ${pathname === '/admin/settings' ? styles.active : ''}`}>
                <Settings size={20} /> Settings
              </Link>
            </>
          )}
        </div>
      </div>
      <div className={styles.adminContent}>
        {children}
      </div>
    </div>
  );
}
