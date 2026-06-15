"use client";
import { useState } from "react";
import styles from "../Admin.module.css";
import { useRouter } from "next/navigation";

export default function EventsTable({ initialEvents }: { initialEvents: any[] }) {
  const [events, setEvents] = useState(initialEvents);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    
    try {
      const res = await fetch(`/api/admin/events?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setEvents(events.filter(e => e.id !== id));
        router.refresh();
      } else {
        alert("Failed to delete event");
      }
    } catch (error) {
      console.error("Delete error", error);
    }
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.adminTable}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Location</th>
            <th>Leader</th>
            <th style={{ textAlign: 'center' }}>Status</th>
            <th style={{ textAlign: 'center' }}>Engage</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', opacity: 0.7 }}>No events found.</td>
            </tr>
          ) : (
            events.map((event) => {
              const date = new Date(event.date);
              return (
                <tr key={event.id}>
                  <td data-label="Title">{event.title}</td>
                  <td data-label="Date">{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td data-label="Location">{event.location}</td>
                  <td data-label="Leader">{event.leaderName || "-"}</td>
                  <td data-label="Status" style={{ textAlign: 'center' }}>
                    <span className={`${styles.badge} ${event.status === 'APPROVED' ? styles['badge-success'] : styles['badge-warning']}`}>
                      {event.status}
                    </span>
                  </td>
                  <td data-label="Engage" style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {event._count?.souls || 0}
                  </td>
                  <td data-label="Actions">
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => router.push(`/admin/events/${event.id}/edit`)}
                      className={styles.actionButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className={styles.actionButton}
                      style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                    >
                      Delete
                    </button>
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
