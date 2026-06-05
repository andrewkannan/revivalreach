"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Calendar, User, Settings, BookOpen, HeartHandshake } from "lucide-react";
import styles from "./Nav.module.css";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TopNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useLanguage();

  return (
    <nav className={styles.topNav}>
      <Link href="/" className={styles.logo}>Revival Reach</Link>
      <div className={styles.topNavLinks}>
        <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}>
          <Flame size={20} />
          <span>{t('nav_revivals')}</span>
        </Link>
        <Link href="/engage" className={`${styles.navLink} ${pathname?.startsWith('/engage') ? styles.active : ''}`}>
          <HeartHandshake size={20} />
          <span>{t('nav_engage')}</span>
        </Link>
        <Link href="/testimony" className={`${styles.navLink} ${pathname?.startsWith('/testimony') ? styles.active : ''}`}>
          <BookOpen size={20} />
          <span>{t('nav_testimonies')}</span>
        </Link>
        <Link href="/profile" className={`${styles.navLink} ${pathname === '/profile' ? styles.active : ''}`}>
          <User size={20} style={session ? { filter: 'drop-shadow(0 0 8px var(--primary))', color: 'var(--primary)' } : {}} />
          <span>{t('nav_profile')}</span>
        </Link>
      </div>
    </nav>
  );
}
