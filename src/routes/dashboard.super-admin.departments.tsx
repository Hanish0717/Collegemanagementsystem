import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Building2, Plus, Search, Users } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { departmentsManaged } from "@/lib/super-admin-data";

export const Route = createFileRoute("/dashboard/super-admin/departments")({
  component: DepartmentManagement,
});

function DepartmentManagement() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filtered = useMemo(() => departmentsManaged.filter(dept =>
    (status === "All" || dept.status === status) &&
    [dept.name, dept.head, dept.id].some(value => value.toLowerCase().includes(search.toLowerCase()))
  ), [search, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Management"
        desc="Monitor departments, heads, faculty strength, student distribution and operational status."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Plus className="size-4" /> Add Department
          </button>
        }
      />

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search departments..." className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm" />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All", "Active", "Review", "Inactive"].map(item => <option key={item}>{item}</option>)}
          </select>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(dept => (
          <Card key={dept.id} className="hover:-translate-y-1 transition">
            <div className="flex items-start justify-between mb-4">
              <div className="size-12 rounded-xl bg-gradient-primary text-white grid place-items-center">
                <Building2 className="size-6" />
              </div>
              <Badge tone={dept.status === "Active" ? "success" : dept.status === "Review" ? "warn" : "danger"}>{dept.status}</Badge>
            </div>
            <h3 className="font-semibold">{dept.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{dept.head}</p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="p-3 rounded-xl bg-gradient-soft border text-center">
                <div className="text-xs text-muted-foreground">Faculty</div>
                <div className="text-xl font-bold">{dept.faculty}</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-soft border text-center">
                <div className="text-xs text-muted-foreground">Students</div>
                <div className="text-xl font-bold">{dept.students}</div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 p-3 rounded-xl border">
              <span className="text-xs text-muted-foreground">Budget</span>
              <span className="text-sm font-semibold text-emerald-600">{dept.budget}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Department Analytics</h3>
              <p className="text-xs text-muted-foreground">Faculty and student count by department</p>
            </div>
            <Badge tone="info">Live</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={departmentsManaged}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="faculty" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                <Bar dataKey="students" fill="#06B6D4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Users className="size-5 text-indigo" />
            <h3 className="font-semibold">Department Statistics</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Total Faculty", value: departmentsManaged.reduce((sum, dept) => sum + dept.faculty, 0) },
              { label: "Total Students", value: departmentsManaged.reduce((sum, dept) => sum + dept.students, 0) },
              { label: "Active Departments", value: departmentsManaged.filter(dept => dept.status === "Active").length },
              { label: "Review Required", value: departmentsManaged.filter(dept => dept.status === "Review").length },
            ].map(stat => (
              <div key={stat.label} className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="font-bold">{stat.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
