"use client";
import { useState } from "react";
import styles from "../Admin.module.css";
import { Heart, Activity, MessageCircle, Star } from "lucide-react";

export default function EngageTable({ initialSouls }: { initialSouls: any[] }) {
  const [souls, setSouls] = useState(initialSouls);

  return (
    <div className={styles.tableContainer}>
      <table className={styles.adminTable}>
        <thead>
          <tr>
            <th>Soul Name</th>
            <th>Contact</th>
            <th>Submitted By</th>
            <th>Event</th>
            <th>Status</th>
            <th>Remarks / Prayer Needs</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {souls.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', opacity: 0.7 }}>No engage records found.</td>
            </tr>
          ) : (
            souls.map((soul) => {
              const date = new Date(soul.createdAt);
              return (
                <tr key={soul.id}>
                  <td style={{ fontWeight: 'bold' }}>{soul.name}</td>
                  <td>{soul.phone}</td>
                  <td>
                    <div>{soul.user?.name || "Unknown"}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{soul.user?.email || ""}</div>
                  </td>
                  <td>{soul.event?.title || "-"}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {soul.prayed && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                          <Heart size={10} /> Prayed
                        </span>
                      )}
                      {soul.hasTestimony && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                          <Activity size={10} /> Testimony
                        </span>
                      )}
                      {soul.requestedPrayer && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                          <MessageCircle size={10} /> Prayer
                        </span>
                      )}
                      {soul.isPriority && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(234, 179, 8, 0.2)', color: '#eab308', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                          <Star size={10} fill="#eab308" /> Priority
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ maxWidth: '250px' }}>
                    {soul.prayerNeeds && (
                      <div style={{ fontSize: '0.85rem', marginBottom: '4px', color: '#f59e0b' }}>
                        <strong>Prayer Needs:</strong> {soul.prayerNeeds}
                      </div>
                    )}
                    {soul.testimonyText && (
                      <div style={{ fontSize: '0.85rem', marginBottom: '4px', color: 'var(--success)' }}>
                        <strong>Testimony:</strong> {soul.testimonyText}
                      </div>
                    )}
                    {soul.remarks && (
                      <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                        {soul.remarks}
                      </div>
                    )}
                  </td>
                  <td>{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
