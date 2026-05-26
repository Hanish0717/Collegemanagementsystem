import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Filter, Plus, Search, UserPlus } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { departmentDistributionAdmin, students } from "@/mock/adminData";



export function AdminStudents() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState("All");

  const departments = ["All", ...Array.from(new Set(students.map(s => s.department)))];
  const statuses = ["All", "Active", "Warning"];

  const filtered = useMemo(() => students.filter(student =>
    (department === "All" || student.department === department) &&
    (status === "All" || student.status === status) &&
    [student.id, student.name, student.department, student.year].some(value => value.toLowerCase().includes(search.toLowerCase()))
  ), [department, status, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Management"
        desc="Manage student records, enrollment, attendance tracking and status monitoring."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Plus className="size-4" /> Add Student
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
              placeholder="Search students by name, ID, department..."
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
          { label: "Total Students", value: students.length.toString(), tone: "info" as const },
          { label: "Active Students", value: students.filter(s => s.status === "Active").length.toString(), tone: "success" as const },
          { label: "Warning Status", value: students.filter(s => s.status === "Warning").length.toString(), tone: "warn" as const },
          { label: "Avg Attendance", value: "87%", tone: "info" as const },
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
                {["Student ID", "Name", "Department", "Year/Semester", "Attendance", "Status", "Actions"].map(column => (
                  <th key={column} className="text-left py-3 px-4 font-semibold text-muted-foreground">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(student => (
                <tr key={student.id} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium text-xs">{student.id}</td>
                  <td className="py-3 px-4 font-medium">{student.name}</td>
                  <td className="py-3 px-4"><Badge tone="info">{student.department}</Badge></td>
                  <td className="py-3 px-4 text-muted-foreground">{student.year}</td>
                  <td className="py-3 px-4 font-medium">{student.attendance}</td>
                  <td className="py-3 px-4">
                    <Badge tone={student.status === "Active" ? "success" : "warn"}>{student.status}</Badge>
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
            <UserPlus className="size-5 text-indigo" />
            <h3 className="font-semibold">Enrollment Analytics</h3>
          </div>
          <div className="space-y-3">
            {departmentDistributionAdmin.map(dept => (
              <div key={dept.name} className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border">
                <span className="text-sm text-muted-foreground">{dept.name}</span>
                <span className="font-bold">{dept.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Add New Student</h3>
          <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <div className="grid sm:grid-cols-2 gap-4">
              <input placeholder="Student name" className="rounded-lg border bg-background px-3 py-2 text-sm" />
              <input placeholder="Student ID" className="rounded-lg border bg-background px-3 py-2 text-sm" />
              <select className="rounded-lg border bg-background px-3 py-2 text-sm">
                {departmentDistributionAdmin.map(dept => <option key={dept.name}>{dept.name}</option>)}
              </select>
              <select className="rounded-lg border bg-background px-3 py-2 text-sm">
                {["Year 1", "Year 2", "Year 3", "Year 4"].map(year => <option key={year}>{year}</option>)}
              </select>
            </div>
            <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium">
              Register Student
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
