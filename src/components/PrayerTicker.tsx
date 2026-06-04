"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { usePathname } from "next/navigation";

export default function PrayerTicker() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [prayers, setPrayers] = useState<any[]>([]);

  useEffect(() => {
    if (session) {
      fetchPrayers();
    }
  }, [session]);

  const fetchPrayers = async () => {
    try {
      const res = await fetch("/api/prayers/ticker");
      if (res.ok) {
        const data = await res.json();
        setPrayers(data);
      }
    } catch (err) {
      console.error("Failed to fetch prayer ticker:", err);
    }
  };

  if (!session || prayers.length === 0 || pathname !== "/") {
    return null;
  }

  // Calculate animation duration based on content length
  // Assuming ~50px per second for a comfortable reading speed
  const totalCharacters = prayers.reduce((acc, p) => acc + p.name.length + p.prayerNeeds.length + 10, 0);
  const duration = Math.max(30, totalCharacters / 10); // Minimum 30s

  return (
    <div className="prayer-ticker-container">
      <div 
        className="prayer-ticker-scroll" 
        style={{ animationDuration: `${duration}s` }}
      >
        {prayers.map((prayer, index) => (
          <span key={prayer.id || index} className="prayer-item">
            <Heart size={16} style={{ strokeWidth: 2, fill: "none", color: "var(--primary)" }} /> <strong>Pray for {prayer.name}:</strong> {prayer.prayerNeeds}
            {index < prayers.length - 1 && <span style={{ margin: '0 12px', opacity: 0.3 }}>&bull;</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
