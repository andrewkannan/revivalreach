import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import styles from "../Admin.module.css";
import { redirect } from "next/navigation";
import TestimoniesTable from "./TestimoniesTable";

export default async function AdminTestimoniesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const testimonies = await prisma.testimony.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  });

  return (
    <div className={`glass-panel ${styles.adminContent}`} style={{ padding: '30px' }}>
      <h1 className={styles.pageTitle}>Testimonies Queue</h1>
      <p style={{ opacity: 0.8, marginBottom: '20px' }}>
        Review, approve, or reject testimonies submitted by users.
      </p>
      <TestimoniesTable initialTestimonies={JSON.parse(JSON.stringify(testimonies))} />
    </div>
  );
}
