import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import styles from "../Admin.module.css";
import PrayerQueueList from "./PrayerQueueList";

export default async function PrayerQueuePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const souls = await prisma.soul.findMany({
    where: { requestedPrayer: true },
    include: {
      user: { select: { name: true, email: true } },
      event: { select: { title: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className={`glass-panel ${styles.adminContent}`} style={{ padding: '30px' }}>
      <h1 className={styles.pageTitle}>Prayer Request Queue</h1>
      <p style={{ opacity: 0.8, marginBottom: '20px' }}>
        List of souls who requested prayer. Click "Verify & Send" to dispatch the prayer request to the configured email targets.
      </p>
      
      <PrayerQueueList initialSouls={souls} />
    </div>
  );
}
