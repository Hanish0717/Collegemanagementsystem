import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filter, Plus, Search, UserCheck } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { departmentDistributionAdmin, faculty } from "@/mock/adminData";



export function AdminFaculty() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("All");

  const departments = ["All", ...Array.from(new Set(faculty.map(f => f.department)))];
  const statuses = ["All", "Active", "On Leave"];

  const filtered = useMemo(() => faculty.filter(fac =>
    (department === "All" || fac.department === department) &&
    (status === "All" || fac.status === status) &&
    [fac.id, fac.name, fac.department, fac.subject].some(value => value.toLowerCase().includes(search.toLowerCase()))
  ), [department, status, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Management"
        desc="Manage faculty records, subject allocation, department mapping and status tracking."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Plus className="size-4" /> Add Faculty
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
              placeholder="Search faculty by name, ID, subject..."
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm"
            />
          </div>
          <select value={department} onChange={(event) => setDepartment(event.target.value)} className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {departments.map(dept => <option key={dept}>{dept}</option>)}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {statuses.map(s => <option key={s}>{s}</option>)}
          </select>
          <button className="px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-medium hover:bg-accent transition">
            <Filter className="size-4" /> Filters
          </button>
        </div>
      </Card>

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Faculty", value: faculty.length.toString(), tone: "info" as const },
          { label: "Active Faculty", value: faculty.filter(f => f.status === "Active").length.toString(), tone: "success" as const },
          { label: "On Leave", value: faculty.filter(f => f.status === "On Leave").length.toString(), tone: "warn" as const },
          { label: "Departments", value: departmentDistributionAdmin.length.toString(), tone: "info" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">Current</Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {["Faculty ID", "Name", "Department", "Subject", "Experience", "Status", "Actions"].map(column => (
                  <th key={column} className="text-left py-3 px-4 font-semibold text-muted-foreground">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(fac => (
                <tr key={fac.id} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium text-xs">{fac.id}</td>
                  <td className="py-3 px-4 font-medium">{fac.name}</td>
                  <td className="py-3 px-4"><Badge tone="info">{fac.department}</Badge></td>
                  <td className="py-3 px-4 text-muted-foreground">{fac.subject}</td>
                  <td className="py-3 px-4 font-medium">{fac.experience}</td>
                  <td className="py-3 px-4">
                    <Badge tone={fac.status === "Active" ? "success" : "warn"}>{fac.status}</Badge>
                  </td>
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
            <UserCheck className="size-5 text-indigo" />
            <h3 className="font-semibold">Faculty Analytics</h3>
          </div>
          <div className="space-y-3">
            {departmentDistributionAdmin.map(dept => (
              <div key={dept.name} className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border">
                <span className="text-sm text-muted-foreground">{dept.name}</span>
                <span className="font-bold">{Math.round(dept.value / 10)} faculty</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Add New Faculty</h3>
          <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <div className="grid sm:grid-cols-2 gap-4">
              <input placeholder="Faculty name" className="rounded-lg border bg-background px-3 py-2 text-sm" />
              <input placeholder="Faculty ID" className="rounded-lg border bg-background px-3 py-2 text-sm" />
              <select className="rounded-lg border bg-background px-3 py-2 text-sm">
                {departmentDistributionAdmin.map(dept => <option key={dept.name}>{dept.name}</option>)}
              </select>
              <input placeholder="Subject specialization" className="rounded-lg border bg-background px-3 py-2 text-sm" />
              <input placeholder="Years of experience" type="number" className="rounded-lg border bg-background px-3 py-2 text-sm" />
              <select className="rounded-lg border bg-background px-3 py-2 text-sm">
                {["Active", "On Leave"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium">
              Register Faculty
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
