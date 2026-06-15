"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Calendar, User, Settings, BookOpen, HeartHandshake } from "lucide-react";
import styles from "./Nav.module.css";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

export default function TopNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
    <nav className={`${styles.topNav} ${!isVisible ? styles.topNavHidden : ''}`}>
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
