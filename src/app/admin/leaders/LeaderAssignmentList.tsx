"use client";
import { useState } from "react";

export default function LeaderAssignmentList({ initialUsers, leaders }: { initialUsers: any[], leaders: any[] }) {
  const [users, setUsers] = useState(initialUsers);

  const handleAssign = async (userId: string, leaderId: string) => {
    try {
      const res = await fetch("/api/admin/users/assign-leader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, leaderId: leaderId === "none" ? null : leaderId })
      });
      
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, leaderId: leaderId === "none" ? null : leaderId } : u));
      } else {
        alert("Failed to assign leader.");
      }
    } catch (error) {
      alert("Error occurred.");
    }
  };

  return (
    <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
      {users.map((user) => (
        <div key={user.id} className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 5px 0' }}>{user.name || "Unnamed"}</h3>
          <p style={{ margin: '0', fontSize: '0.9rem', opacity: 0.8 }}><strong>Email:</strong> {user.email}</p>
          <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', opacity: 0.8 }}><strong>Role:</strong> {user.role}</p>
          
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Assigned Leader:</label>
          <select 
            className="input-glass" 
            style={{ width: '100%', padding: '8px' }}
            value={user.leaderId || "none"}
            onChange={(e) => handleAssign(user.id, e.target.value)}
          >
            <option value="none">-- No Leader --</option>
            {leaders.filter(l => l.id !== user.id).map(leader => (
              <option key={leader.id} value={leader.id}>{leader.name || leader.email}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
