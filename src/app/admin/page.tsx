import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import styles from "./Admin.module.css";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LEADER")) {
    redirect("/login");
  }

  if (session.user.role === "LEADER") {
    redirect("/admin/my-team");
  }

  const usersCount = await prisma.user.count();
  const pendingUsersCount = await prisma.user.count({ where: { isApproved: false } });
  const eventsCount = await prisma.event.count();
  const requestsCount = await prisma.evangelismRequest.count({ where: { status: "PENDING" } });

  return (
    <div className={`glass-panel ${styles.adminContent}`} style={{ padding: '30px' }}>
      <h1 className={styles.pageTitle}>Dashboard Overview</h1>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        <div className="glass-panel" style={{ flex: '1 1 200px', padding: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: 0, opacity: 0.8, fontSize: '1.1rem' }}>Total Users</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)', margin: '10px 0 0 0' }}>{usersCount}</p>
        </div>
        <div className="glass-panel" style={{ flex: '1 1 200px', padding: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: 0, opacity: 0.8, fontSize: '1.1rem' }}>Pending Approvals</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--warning, #f59e0b)', margin: '10px 0 0 0' }}>{pendingUsersCount}</p>
        </div>
        <div className="glass-panel" style={{ flex: '1 1 200px', padding: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: 0, opacity: 0.8, fontSize: '1.1rem' }}>Total Events</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--success)', margin: '10px 0 0 0' }}>{eventsCount}</p>
        </div>
        <div className="glass-panel" style={{ flex: '1 1 200px', padding: '20px', textAlign: 'center' }}>
          <h3 style={{ margin: 0, opacity: 0.8, fontSize: '1.1rem' }}>Pending Requests</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--secondary)', margin: '10px 0 0 0' }}>{requestsCount}</p>
        </div>
      </div>
    </div>
  );
}
