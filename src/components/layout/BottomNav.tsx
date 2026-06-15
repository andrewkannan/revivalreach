"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Calendar, User, BookOpen, HeartHandshake } from "lucide-react";
import styles from "./Nav.module.css";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [badges, setBadges] = useState({ pendingEngage: 0, newRevivals: 0 });
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    fetch('/api/notifications/badges')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.pendingEngage === 'number') {
          setBadges(data);
        }
      })
      .catch(err => console.error("Failed to load badges", err));
  }, [pathname]); // Refresh on route change

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false); // Scrolling down, hide
      } else {
        setIsVisible(true);  // Scrolling up, show
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav className={`${styles.bottomNav} ${!isVisible ? styles.bottomNavHidden : ''}`}>
      <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}>
        <div className={styles.iconWrapper}>
          <Flame size={24} />
          {badges.newRevivals > 0 && <div className={styles.badge}>{badges.newRevivals}</div>}
        </div>
        <span>{t('nav_revivals')}</span>
      </Link>
      <Link href="/engage" className={`${styles.navLink} ${pathname?.startsWith('/engage') ? styles.active : ''}`}>
        <div className={styles.iconWrapper}>
          <HeartHandshake size={24} />
          {badges.pendingEngage > 0 && <div className={styles.badge}>{badges.pendingEngage}</div>}
        </div>
        <span>{t('nav_engage')}</span>
      </Link>
      <Link href="/testimony" className={`${styles.navLink} ${pathname?.startsWith('/testimony') ? styles.active : ''}`}>
        <div className={styles.iconWrapper}>
          <BookOpen size={24} />
        </div>
        <span>{t('nav_testimonies')}</span>
      </Link>
      <Link href="/profile" className={`${styles.navLink} ${pathname === '/profile' ? styles.active : ''}`}>
        <div className={styles.iconWrapper}>
          <User size={24} style={session ? { filter: 'drop-shadow(0 0 8px var(--primary))', color: 'var(--primary)' } : {}} />
        </div>
        <span>{t('nav_profile')}</span>
      </Link>
    </nav>
  );
}
