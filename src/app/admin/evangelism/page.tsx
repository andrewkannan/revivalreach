import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { hasAccess } from "@/lib/permissions";
import styles from "../Admin.module.css";

export default async function EvangelismRequestsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !(await hasAccess(session.user.role, "/admin/evangelism"))) {
    redirect("/login");
  }

  const requests = await prisma.evangelismRequest.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className={`glass-panel ${styles.adminContent}`} style={{ padding: '30px' }}>
      <h1 className={styles.pageTitle}>Evangelism Requests</h1>
      <p style={{ opacity: 0.8, marginBottom: '20px' }}>
        List of public evangelism and support requests.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {requests.length === 0 && <p>No evangelism requests found.</p>}
        {requests.map((req) => (
          <div key={req.id} className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: '0 0 5px 0' }}>{req.name}</h3>
              <span style={{ 
                padding: '2px 8px', 
                borderRadius: '12px', 
                fontSize: '0.8rem',
                backgroundColor: req.status === 'PENDING' ? 'var(--warning)' : 'var(--success)',
                color: '#fff'
              }}>
                {req.status}
              </span>
            </div>
            <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Contact:</strong> {req.contactInfo}</p>
            <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Area:</strong> {req.area}</p>
            <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Details:</strong> {req.details || "None"}</p>
            <p style={{ margin: '10px 0 0 0', fontSize: '0.8rem', opacity: 0.6 }}>Received: {new Date(req.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
