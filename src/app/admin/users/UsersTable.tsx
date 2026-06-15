"use client";
import { useState, useMemo } from "react";
import styles from "../Admin.module.css";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function UsersTable({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const router = useRouter();

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || 
                            u.email?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      
      let matchesStatus = true;
      if (statusFilter === "PENDING") matchesStatus = !u.isApproved;
      if (statusFilter === "APPROVED") matchesStatus = u.isApproved && u.isActive;
      if (statusFilter === "DISABLED") matchesStatus = !u.isActive;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleUpdateUser = async (userId: string, action: string, value?: any) => {
    if (action === "delete") {
      if (!confirm("Are you sure you want to PERMANENTLY delete this user and all associated records? This cannot be undone.")) return;
    }
    if (action === "trigger-reset") {
      if (!confirm("Send a password reset email to this user?")) return;
    }

    try {
      const res = await fetch(`/api/admin/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, value }),
      });

      if (res.ok) {
        if (action === "delete") {
          setUsers(users.filter(u => u.id !== userId));
        } else if (action === "trigger-reset") {
          alert("Password reset email sent.");
        } else {
          const updatedUser = await res.json();
          setUsers(users.map(u => u.id === userId ? { ...u, ...updatedUser } : u));
        }
        router.refresh();
      } else {
        const data = await res.json();
        alert(`Action failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Failed to update user", error);
    }
  };

  const handleImpersonate = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to log in as ${email}? You will be signed out of your admin account.`)) return;
    try {
      const res = await fetch(`/api/admin/impersonate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        const { token } = await res.json();
        await signIn("credentials", {
          redirect: true,
          email,
          password: `IMPERSONATE:${token}`,
          callbackUrl: "/"
        });
      } else {
        alert("Failed to generate impersonation token.");
      }
    } catch (err) {
      alert("Error initiating impersonation.");
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Role", "Status", "Joined Date"];
    const rows = filteredUsers.map(u => [
      u.name || "",
      u.email || "",
      u.role,
      !u.isActive ? "Disabled" : (!u.isApproved ? "Pending" : "Approved"),
      new Date(u.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "revival_reach_users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
          <input 
            type="text" 
            placeholder="Search name or email..." 
            className="input-glass"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: '1 1 200px', minWidth: '200px', width: 'auto' }}
          />
          <select className="input-glass" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ flex: '1 1 140px', width: 'auto' }}>
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admins</option>
            <option value="LEADER">Leaders</option>
            <option value="MEMBER">Members</option>
          </select>
          <select className="input-glass" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ flex: '1 1 140px', width: 'auto' }}>
            <option value="ALL">All Statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="DISABLED">Disabled</option>
          </select>
          <button onClick={exportToCSV} className="btn-secondary" style={{ flex: '0 0 auto', whiteSpace: 'nowrap' }}>Export CSV</button>
        </div>
      </div>

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
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td data-label="Name">{user.name}</td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Role">
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
                <td data-label="Status">
                  {!user.isActive ? (
                    <span className={`${styles.badge}`} style={{ backgroundColor: 'rgba(255,0,0,0.1)', color: 'var(--error)' }}>Disabled</span>
                  ) : user.isApproved ? (
                    <span className={`${styles.badge} ${styles['badge-success']}`}>Approved</span>
                  ) : (
                    <span className={`${styles.badge} ${styles['badge-warning']}`}>Pending</span>
                  )}
                </td>
                <td data-label="Actions">
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {!user.isApproved && user.isActive && (
                      <button
                        onClick={() => handleUpdateUser(user.id, "approve", true)}
                        className={styles.actionButton}
                        style={{ color: 'var(--success)', borderColor: 'var(--success)' }}
                      >
                        Approve
                      </button>
                    )}
                    
                    {user.isApproved && (
                      <button
                        onClick={() => handleUpdateUser(user.id, user.isActive ? "disable" : "enable")}
                        className={styles.actionButton}
                        style={{ color: user.isActive ? 'var(--warning)' : 'var(--success)', borderColor: user.isActive ? 'var(--warning)' : 'var(--success)' }}
                      >
                        {user.isActive ? "Disable" : "Enable"}
                      </button>
                    )}

                    <button
                      onClick={() => handleUpdateUser(user.id, "trigger-reset")}
                      className={styles.actionButton}
                      style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }}
                    >
                      Reset PW
                    </button>

                    <button
                      onClick={() => handleImpersonate(user.id, user.email)}
                      className={styles.actionButton}
                      style={{ color: 'var(--foreground)', borderColor: 'var(--foreground)' }}
                    >
                      Log In As
                    </button>

                    <button
                      onClick={() => handleUpdateUser(user.id, "delete")}
                      className={styles.actionButton}
                      style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>No users found matching your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '15px', textAlign: 'right' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--foreground)', opacity: 0.8 }}>
          Total Users: {filteredUsers.length}
        </h3>
      </div>
    </div>
  );
}
