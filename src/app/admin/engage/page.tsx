import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import styles from "../Admin.module.css";
import { redirect } from "next/navigation";
import EngageTable from "./EngageTable";

export default async function AdminEngagePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const souls = await prisma.soul.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true, email: true }
      },
      event: {
        select: { title: true }
      }
    }
  });

  return (
    <div className={`glass-panel ${styles.adminContent}`} style={{ padding: '30px' }}>
      <h1 className={styles.pageTitle}>Engage Submitted</h1>
      <EngageTable initialSouls={JSON.parse(JSON.stringify(souls))} />
    </div>
  );
}
