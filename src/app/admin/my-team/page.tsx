import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import styles from "../Admin.module.css";

export default async function MyTeamPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LEADER")) {
    redirect("/login");
  }

  const members = await prisma.user.findMany({
    where: { leaderId: session.user.id },
    include: {
      _count: {
        select: {
          participations: true,
          souls: true,
        }
      }
    }
  });

  return (
    <div className={`glass-panel ${styles.adminContent}`} style={{ padding: '30px' }}>
      <h1 className={styles.pageTitle}>My Team Progress</h1>
      <p style={{ opacity: 0.8, marginBottom: '20px' }}>
        Track the progress of members assigned to your leadership.
      </p>
      
      <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {members.length === 0 && <p>You have no assigned members yet.</p>}
        {members.map((member) => (
          <div key={member.id} className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 5px 0' }}>{member.name || "Unnamed"}</h3>
            <p style={{ margin: '0', fontSize: '0.9rem', opacity: 0.8 }}><strong>Email:</strong> {member.email}</p>
            <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', opacity: 0.8 }}><strong>Phone:</strong> {member.phone || "Not provided"}</p>
            
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{member._count.participations}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Events Joined</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{member._count.souls}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Souls Won</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
