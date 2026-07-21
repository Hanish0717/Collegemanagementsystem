import { useState, useMemo } from "react";
import { Search, Filter, Shield, Users, UserCheck, UserX, Loader2, ArrowUpDown } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { useUsers } from "@/hooks/useUsers";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export function SuperAdminUsers() {
  const { data: users = [], isLoading, toggleStatus, isMutating } = useUsers();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.id.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "All" || u.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" ? u.is_active : !u.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const roleDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach((u) => {
      counts[u.role] = (counts[u.role] || 0) + 1;
    });

    const colors: Record<string, string> = {
      super_admin: "#F59E0B",
      admin: "#3B82F6",
      faculty: "#8B5CF6",
      student: "#10B981",
      parent: "#EC4899",
      librarian: "#14B8A6",
      placement: "#6366F1",
      warden: "#F97316",
      transport: "#84CC16",
    };

    return Object.entries(counts).map(([role, count]) => ({
      name: role.replace("_", " ").toUpperCase(),
      value: count,
      color: colors[role] || "#6B7280",
    }));
  }, [users]);

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Account Governance"
        desc="Manage active logins, access permissions, status states, and global user distribution."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or ID..."
                className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary transition cursor-pointer"
              >
                <option value="All">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="faculty">Faculty</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
                <option value="librarian">Librarian</option>
                <option value="placement">Placement Officer</option>
                <option value="warden">Hostel Warden</option>
                <option value="transport">Transport Manager</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary transition cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="size-8 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">Retrieving campus accounts...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              No users found matching filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    {["User details", "Role", "Created At", "Account Status", "Actions"].map((col) => (
                      <th key={col} className="text-left py-3 px-4 font-semibold text-muted-foreground">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-accent/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-gradient-primary text-white grid place-items-center font-bold text-xs">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge tone="info">{formatRole(user.role)}</Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3 px-4">
                        <Badge tone={user.is_active ? "success" : "danger"}>
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleStatus({ id: user.id, isActive: !user.is_active })}
                          className={`p-1.5 rounded-lg border text-xs font-medium cursor-pointer transition flex items-center gap-1.5 ${
                            user.is_active
                              ? "text-rose-600 hover:bg-rose-50 border-rose-200"
                              : "text-emerald-600 hover:bg-emerald-50 border-emerald-200"
                          }`}
                          title={user.is_active ? "Deactivate User" : "Activate User"}
                          disabled={isMutating}
                        >
                          {user.is_active ? (
                            <>
                              <UserX className="size-3.5" /> Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="size-3.5" /> Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Users className="size-5 text-indigo-500" />
              <h3 className="font-semibold">Role Distribution</h3>
            </div>
            {roleDistribution.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No roles to display
              </div>
            ) : (
              <>
                <div className="h-44">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={roleDistribution}
                        dataKey="value"
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={3}
                      >
                        {roleDistribution.map((r, i) => (
                          <Cell key={i} fill={r.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                  {roleDistribution.map((r) => (
                    <div key={r.name} className="flex items-center justify-between text-xs p-1.5 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full shrink-0" style={{ background: r.color }} />
                        <span className="text-muted-foreground font-medium">{r.name}</span>
                      </div>
                      <span className="font-bold">{r.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="size-5 text-violet-500" />
              <h3 className="font-semibold">Governance Control</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              As a Super Admin, deactivating a user account revokes their authentication privileges
              immediately.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-2">
              Any corresponding child records (e.g. Student Profiles, Department Owner mappings) will
              reflect this state globally.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
