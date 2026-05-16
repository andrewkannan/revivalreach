import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import styles from "../Admin.module.css";
import { redirect } from "next/navigation";
import EventsTable from "./EventsTable";
import Link from "next/link";

export default async function AdminEventsPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LEADER")) {
    redirect("/login");
  }

  // If Leader, only show their events? For now, let's show all events to Leaders too, or maybe they just manage all.
  // The prompt says "added by revival leaders during event creation" so leaders can create events.
  const events = await prisma.event.findMany({
    orderBy: { date: 'desc' }
  });

  return (
    <div className={`glass-panel ${styles.adminContent}`} style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>Event Management</h1>
        <Link href="/admin/events/create" className="btn-primary">
          + Create Event
        </Link>
      </div>
      <EventsTable initialEvents={events} />
    </div>
  );
}
