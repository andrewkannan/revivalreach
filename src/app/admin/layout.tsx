"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Admin.module.css";
import { Users, Settings, CalendarRange, Heart, ShieldCheck, HeartHandshake, MessageSquare, Mail, QrCode } from "lucide-react";
import { useSession } from "next-auth/react";

import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const isLeader = session?.user?.role === "LEADER";

  const [allowedPaths, setAllowedPaths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetch("/api/admin/permissions")
        .then(res => res.json())
        .then(data => {
          setAllowedPaths(data.allowedPaths || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  const hasAccess = (path: string) => allowedPaths.includes("ALL") || allowedPaths.includes(path);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center', color: 'var(--foreground)' }}>Loading admin panel...</div>;

  return (
    <div className={styles.adminContainer}>
      <div className={`glass-panel ${styles.adminSidebar}`}>
        <h2 className={styles.sidebarTitle}>{isAdmin ? "Admin Panel" : "Leader Panel"}</h2>
        <div className={styles.sidebarLinks}>
          {hasAccess('/admin/my-team') && (
            <Link href="/admin/my-team" className={`${styles.sidebarLink} ${pathname === '/admin/my-team' ? styles.active : ''}`}>
              <ShieldCheck size={20} /> My Team
            </Link>
          )}
          {hasAccess('/admin/users') && (
            <Link href="/admin/users" className={`${styles.sidebarLink} ${pathname === '/admin/users' ? styles.active : ''}`}>
              <Users size={20} /> Users
            </Link>
          )}
          {hasAccess('/admin/leaders') && (
            <Link href="/admin/leaders" className={`${styles.sidebarLink} ${pathname === '/admin/leaders' ? styles.active : ''}`}>
              <Users size={20} /> Revival Leaders
            </Link>
          )}
          {hasAccess('/admin/events') && (
            <Link href="/admin/events" className={`${styles.sidebarLink} ${pathname === '/admin/events' ? styles.active : ''}`}>
              <CalendarRange size={20} /> Events
            </Link>
          )}
          {hasAccess('/admin/engage') && (
            <Link href="/admin/engage" className={`${styles.sidebarLink} ${pathname === '/admin/engage' ? styles.active : ''}`}>
              <HeartHandshake size={20} /> Engage
            </Link>
          )}
          {hasAccess('/admin/prayer-queue') && (
            <Link href="/admin/prayer-queue" className={`${styles.sidebarLink} ${pathname === '/admin/prayer-queue' ? styles.active : ''}`}>
              <Heart size={20} /> Prayer Queue
            </Link>
          )}
          {hasAccess('/admin/evangelism') && (
            <Link href="/admin/evangelism" className={`${styles.sidebarLink} ${pathname === '/admin/evangelism' ? styles.active : ''}`}>
              <MessageSquare size={20} /> Evangelism Requests
            </Link>
          )}
          {hasAccess('/admin/testimonies') && (
            <Link href="/admin/testimonies" className={`${styles.sidebarLink} ${pathname === '/admin/testimonies' ? styles.active : ''}`}>
              <MessageSquare size={20} /> Testimonies
            </Link>
          )}
          {hasAccess('/admin/email-logs') && (
            <Link href="/admin/email-logs" className={`${styles.sidebarLink} ${pathname === '/admin/email-logs' ? styles.active : ''}`}>
              <Mail size={20} /> Email Logs
            </Link>
          )}
          {hasAccess('/admin/settings') && (
            <Link href="/admin/settings" className={`${styles.sidebarLink} ${pathname === '/admin/settings' ? styles.active : ''}`}>
              <Settings size={20} /> Settings
            </Link>
          )}
          <Link href="/admin/registration-qr" className={`${styles.sidebarLink} ${pathname === '/admin/registration-qr' ? styles.active : ''}`}>
            <QrCode size={20} /> Registration QR
          </Link>
        </div>
      </div>
      <div className={styles.adminContent}>
        {children}
      </div>
    </div>
  );
}
