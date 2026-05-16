import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import styles from "../Admin.module.css";
import { redirect } from "next/navigation";
import SettingsForm from "./SettingsForm";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  let settings = await prisma.systemSettings.findUnique({
    where: { id: "singleton" },
  });

  if (!settings) {
    settings = await prisma.systemSettings.create({
      data: { id: "singleton", whatsappTemplate: "Hi, I'm interested in the event..." },
    });
  }

  return (
    <div className={`glass-panel ${styles.adminContent}`} style={{ padding: '30px' }}>
      <h1 className={styles.pageTitle}>System Settings</h1>
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
