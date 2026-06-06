"use client";
import { useState, useEffect } from "react";
import styles from "../Admin.module.css";

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  status: string;
  error: string | null;
  createdAt: string;
}

export default function EmailLogsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/email-logs");
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      setError("Failed to load email logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className={`glass-panel ${styles.adminContent}`} style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className={styles.pageTitle} style={{ margin: 0 }}>Email Logs</h1>
        <button onClick={fetchLogs} className="btn-secondary" style={{ padding: '8px 15px' }}>
          Refresh
        </button>
      </div>

      {error && <div style={{ color: "var(--error)", marginBottom: "15px" }}>{error}</div>}

      {loading ? (
        <p>Loading logs...</p>
      ) : logs.length === 0 ? (
        <p>No email logs found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>To</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Error Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>{log.to}</td>
                  <td>{log.subject}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      backgroundColor: log.status === 'SUCCESS' ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)',
                      color: log.status === 'SUCCESS' ? 'var(--success)' : 'var(--error)'
                    }}>
                      {log.status}
                    </span>
                  </td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.error || ""}>
                    {log.error || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
