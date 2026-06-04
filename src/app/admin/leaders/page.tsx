import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { hasAccess } from "@/lib/permissions";
import styles from "../Admin.module.css";
import LeaderAssignmentList from "./LeaderAssignmentList";

export default async function RevivalLeadersPage() {
  const session = await getServerSession(authOptions);

  if (!session || !(await hasAccess(session.user.role, "/admin/leaders"))) {
    redirect("/login");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      leaderId: true,
      leader: { select: { name: true, email: true } }
    },
    orderBy: { name: 'asc' }
  });

  const leaders = users.filter(u => u.role === "LEADER" || u.role === "ADMIN");

  return (
    <div className={`glass-panel ${styles.adminContent}`} style={{ padding: '30px' }}>
      <h1 className={styles.pageTitle}>Revival Leaders</h1>
      <p style={{ opacity: 0.8, marginBottom: '20px' }}>
        Assign users to specific Revival Leaders so leaders can track their members' progress.
      </p>
      
      <LeaderAssignmentList initialUsers={users} leaders={leaders} />
    </div>
  );
}
