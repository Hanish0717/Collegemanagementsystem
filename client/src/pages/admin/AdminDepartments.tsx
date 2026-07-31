import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Building2, Search, Users, ShieldAlert, Award, FileSpreadsheet } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { useDepartments } from "@/hooks/useDepartments";

export function AdminDepartments() {
  const { data: departments = [], isLoading: loading } = useDepartments();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = useMemo(
    () =>
      departments.filter(
        (dept) =>
          (statusFilter === "All" || dept.status === statusFilter) &&
          [dept.name, dept.head, dept.id].some((value) =>
            value.toLowerCase().includes(search.toLowerCase())
          )
      ),
    [departments, search, statusFilter]
  );

  if (loading && departments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Monitoring & Governance"
        desc="Institutional oversight: monitor department heads, faculty ratios, student enrollment distribution, and budget allocation telemetry."
      />

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by department name, code or HOD..."
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-xs outline-none focus:border-primary transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border bg-background/60 px-4 py-2.5 text-xs outline-none focus:border-primary transition cursor-pointer"
          >
            {["All", "Active", "Review", "Inactive"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Department Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((dept) => (
          <Card key={dept.id} className="hover:-translate-y-1 transition relative group">
            <div className="flex items-start justify-between mb-4">
              <div className="size-12 rounded-2xl bg-blue-600 text-white grid place-items-center shadow-md">
                <Building2 className="size-6" />
              </div>
              <Badge
                tone={
                  dept.status === "Active"
                    ? "success"
                    : dept.status === "Review"
                      ? "warn"
                      : "danger"
                }
              >
                {dept.status}
              </Badge>
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="font-mono text-xs text-blue-600 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                {dept.id}
              </span>
              {dept.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Head of Dept: <strong className="text-slate-800 dark:text-slate-200">{dept.head}</strong></p>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border text-center">
                <div className="text-[11px] text-slate-500 font-medium">Faculty Roster</div>
                <div className="text-lg font-black text-slate-900 dark:text-white">{dept.faculty}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border text-center">
                <div className="text-[11px] text-slate-500 font-medium">Students Enrolled</div>
                <div className="text-lg font-black text-slate-900 dark:text-white">{dept.students}</div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 p-3 rounded-xl border bg-slate-50/50 dark:bg-slate-900/40">
              <span className="text-xs text-slate-500">Allocated Budget</span>
              <span className="text-xs font-black text-emerald-600">{dept.budget}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Analytics Visualizations */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Department Faculty & Student Telemetry</h3>
              <p className="text-xs text-muted-foreground">Comparative strength across all academic departments</p>
            </div>
            <Badge tone="info">Live Sync</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={departments}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="id" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="faculty" fill="#4F46E5" radius={[8, 8, 0, 0]} name="Faculty Strength" />
                <Bar dataKey="students" fill="#06B6D4" radius={[8, 8, 0, 0]} name="Student Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Users className="size-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Institutional Summary</h3>
          </div>
          <div className="space-y-3">
            {[
              {
                label: "Total Department Faculty",
                value: departments.reduce((sum, dept) => sum + dept.faculty, 0),
              },
              {
                label: "Total Enrolled Body",
                value: departments.reduce((sum, dept) => sum + dept.students, 0),
              },
              {
                label: "Active Departments",
                value: departments.filter((dept) => dept.status === "Active").length,
              },
              {
                label: "Departments Needing Review",
                value: departments.filter((dept) => dept.status === "Review").length,
              },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between p-3 rounded-xl border bg-slate-50/50 dark:bg-slate-900/40">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{stat.label}</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">{stat.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AdminDepartments;
