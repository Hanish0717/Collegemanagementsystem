import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filter, Plus, Search, ShieldCheck, UserCog } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { adminUsers } from "@/mock/superAdminData";



export function SuperAdminAdmins() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const roles = ["All", ...Array.from(new Set(adminUsers.map(admin => admin.role)))];
  const filteredAdmins = useMemo(() => adminUsers.filter(admin =>
    (roleFilter === "All" || admin.role === roleFilter) &&
    [admin.id, admin.name, admin.role, admin.department].some(value => value.toLowerCase().includes(search.toLowerCase()))
  ), [roleFilter, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Management"
        desc="Manage administrator accounts, department ownership and access permissions."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Plus className="size-4" /> Add Admin
          </button>
        }
      />

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search admins by name, role or department..."
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm"
            />
          </div>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {roles.map(role => <option key={role}>{role}</option>)}
          </select>
          <button className="px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-medium hover:bg-accent transition">
            <Filter className="size-4" /> Filters
          </button>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {["Admin ID", "Name", "Role", "Department", "Status", "Last Login", "Actions"].map(column => (
                  <th key={column} className="text-left py-3 px-4 font-semibold text-muted-foreground">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAdmins.map(admin => (
                <tr key={admin.id} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium text-xs">{admin.id}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{admin.name}</div>
                    <div className="text-xs text-muted-foreground">{admin.permissions.length} permissions</div>
                  </td>
                  <td className="py-3 px-4"><Badge tone="info">{admin.role}</Badge></td>
                  <td className="py-3 px-4 text-muted-foreground">{admin.department}</td>
                  <td className="py-3 px-4">
                    <Badge tone={admin.status === "Active" ? "success" : admin.status === "Review" ? "warn" : "danger"}>{admin.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{admin.lastLogin}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition">View</button>
                      <button className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition">Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="size-5 text-indigo" />
            <h3 className="font-semibold">Permission Badges</h3>
          </div>
          <div className="space-y-3">
            {adminUsers.slice(0, 4).map(admin => (
              <div key={admin.id} className="p-3 rounded-xl border hover:bg-accent/50 transition">
                <div className="font-medium text-sm">{admin.name}</div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {admin.permissions.map(permission => <Badge key={permission}>{permission}</Badge>)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <UserCog className="size-5 text-indigo" />
            <h3 className="font-semibold">Role Assignment</h3>
          </div>
          <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <div className="grid sm:grid-cols-2 gap-4">
              <input placeholder="Select admin" className="rounded-lg border bg-background px-3 py-2 text-sm" />
              <select className="rounded-lg border bg-background px-3 py-2 text-sm">
                {roles.filter(role => role !== "All").map(role => <option key={role}>{role}</option>)}
              </select>
            </div>
            <div className="grid sm:grid-cols-3 gap-2">
              {["Students", "Faculty", "Fees", "Reports", "Settings", "Security"].map(permission => (
                <label key={permission} className="flex items-center gap-2 p-2 rounded-lg border bg-background text-sm">
                  <input type="checkbox" defaultChecked={permission !== "Security"} />
                  {permission}
                </label>
              ))}
            </div>
            <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium">
              Save Assignment
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
