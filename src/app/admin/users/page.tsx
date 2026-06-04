import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import styles from "../Admin.module.css";
import { redirect } from "next/navigation";
import { hasAccess } from "@/lib/permissions";
import UsersTable from "./UsersTable";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session || !(await hasAccess(session.user.role, "/admin/users"))) {
    redirect("/login");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className={`glass-panel ${styles.adminContent}`} style={{ padding: '30px' }}>
      <h1 className={styles.pageTitle}>User Management</h1>
      <UsersTable initialUsers={JSON.parse(JSON.stringify(users))} />
    </div>
  );
}
