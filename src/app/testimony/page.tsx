import styles from "../Dashboard.module.css";
import { MessageSquare } from "lucide-react";

export default function TestimonyPage() {
  return (
    <div className={styles.dashboard}>
      <h1 className={styles.sectionTitle}>Testimonies</h1>
      <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', opacity: 0.7, marginTop: '20px' }}>
        <MessageSquare size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5, display: 'block' }} />
        <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Testimonies Space</p>
        <p style={{ marginTop: '8px' }}>This page is coming soon. Stay tuned!</p>
      </div>
    </div>
  );
}
