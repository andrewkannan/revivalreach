"use client";
import { useState } from "react";
import styles from "../Admin.module.css";
import { useRouter } from "next/navigation";

export default function UsersTable({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const router = useRouter();

  const handleUpdateUser = async (userId: string, action: string, value: any) => {
    try {
      const basePath = window.location.pathname.startsWith('/reach') ? '/reach' : '';
      const res = await fetch(`${basePath}/api/admin/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, value }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(users.map(u => u.id === userId ? { ...u, ...updatedUser } : u));
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update user", error);
    }
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.adminTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => handleUpdateUser(user.id, "role", e.target.value)}
                  className="input-glass"
                  style={{ padding: '6px', fontSize: '0.85rem' }}
                >
                  <option value="MEMBER">Member</option>
                  <option value="LEADER">Revival Leader</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </td>
              <td>
                {user.isApproved ? (
                  <span className={`${styles.badge} ${styles['badge-success']}`}>Approved</span>
                ) : (
                  <span className={`${styles.badge} ${styles['badge-warning']}`}>Pending</span>
                )}
              </td>
              <td>
                {!user.isApproved && (
                  <button
                    onClick={() => handleUpdateUser(user.id, "approve", true)}
                    className={styles.actionButton}
                    style={{ color: 'var(--success)', borderColor: 'var(--success)' }}
                  >
                    Approve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
