import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import styles from "./Admin.module.css";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const usersCount = await prisma.user.count();
  const pendingUsersCount = await prisma.user.count({ where: { isApproved: false } });
  const eventsCount = await prisma.event.count();
  const requestsCount = await prisma.evangelismRequest.count({ where: { status: "PENDING" } });

  return (
    <div className={`glass-panel ${styles.adminContent}`} style={{ padding: '30px' }}>
      <h1 className={styles.pageTitle}>Dashboard Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <h3>Total Users</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{usersCount}</p>
        </div>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <h3>Pending Approvals</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning, #f59e0b)' }}>{pendingUsersCount}</p>
        </div>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <h3>Total Events</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>{eventsCount}</p>
        </div>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <h3>Pending Requests</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{requestsCount}</p>
        </div>
      </div>
    </div>
  );
}
