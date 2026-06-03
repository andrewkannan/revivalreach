"use client";
import { useState } from "react";
import styles from "../Admin.module.css";
import { Check, X, Trash2 } from "lucide-react";

export default function TestimoniesTable({ initialTestimonies }: { initialTestimonies: any[] }) {
  const [testimonies, setTestimonies] = useState(initialTestimonies);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/testimonies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setTestimonies(testimonies.map(t => t.id === id ? { ...t, status } : t));
      }
    } catch (error) {
      console.error("Failed to update testimony:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimony?")) return;
    try {
      const res = await fetch(`/api/admin/testimonies/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTestimonies(testimonies.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete testimony:", error);
    }
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.adminTable}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Content</th>
            <th style={{ textAlign: 'center' }}>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {testimonies.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', opacity: 0.7 }}>No testimonies found.</td>
            </tr>
          ) : (
            testimonies.map((testimony) => {
              const date = new Date(testimony.createdAt);
              return (
                <tr key={testimony.id}>
                  <td>{date.toLocaleDateString()}</td>
                  <td>
                    <strong>{testimony.name}</strong><br />
                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{testimony.user?.email}</span>
                  </td>
                  <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {testimony.content}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`${styles.badge} ${
                      testimony.status === 'APPROVED' ? styles['badge-success'] : 
                      testimony.status === 'REJECTED' ? styles['badge-danger'] : 
                      styles['badge-warning']
                    }`}>
                      {testimony.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {testimony.status !== 'APPROVED' && (
                        <button 
                          onClick={() => handleUpdateStatus(testimony.id, "APPROVED")}
                          className="btn-primary" 
                          style={{ padding: '4px 8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Check size={14} /> Approve
                        </button>
                      )}
                      {testimony.status !== 'REJECTED' && (
                        <button 
                          onClick={() => handleUpdateStatus(testimony.id, "REJECTED")}
                          className="btn-secondary" 
                          style={{ padding: '4px 8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <X size={14} /> Reject
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(testimony.id)}
                        className="btn-danger" 
                        style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
