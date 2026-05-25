import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { students } from "@/lib/mock-data";
import { Search, Filter, Plus, Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/dashboard/students")({ component: StudentsPage });

function StudentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        desc="Manage student profiles, attendance and academic records."
        actions={
          <>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm bg-background/60"><Filter className="size-4" /> Filter</button>
            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-primary text-white text-sm glow-primary"><Plus className="size-4" /> Add Student</button>
          </>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {students.slice(0,4).map(s => (
          <Card key={s.id} className="text-center">
            <div className="mx-auto size-16 rounded-2xl bg-gradient-primary grid place-items-center text-white text-xl font-bold">
              {s.name.split(" ").map(x=>x[0]).join("")}
            </div>
            <div className="mt-3 font-semibold">{s.name}</div>
            <div className="text-xs text-muted-foreground">{s.dept} · Year {s.year}</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-muted/60 p-2"><div className="font-bold">{s.attendance}%</div><div className="text-muted-foreground">Attendance</div></div>
              <div className="rounded-lg bg-muted/60 p-2"><div className="font-bold">{s.cgpa}</div><div className="text-muted-foreground">CGPA</div></div>
            </div>
            <div className="mt-3 flex justify-center gap-1.5">
              <button className="size-8 rounded-lg border grid place-items-center hover:bg-accent"><Mail className="size-3.5" /></button>
              <button className="size-8 rounded-lg border grid place-items-center hover:bg-accent"><Phone className="size-3.5" /></button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b">
          <h3 className="font-semibold">All Students</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input placeholder="Search…" className="rounded-xl border bg-background/60 pl-9 pr-3 py-1.5 text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                {["ID","Name","Department","Year","Attendance","CGPA","Status",""].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} className="border-t hover:bg-muted/30">
                  <td className="px-5 py-3 font-mono text-xs">{s.id}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-gradient-violet text-white grid place-items-center text-xs font-bold">
                        {s.name.split(" ").map(x=>x[0]).join("")}
                      </div>
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{s.dept}</td>
                  <td className="px-5 py-3">{s.year}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-gradient-primary" style={{ width: `${s.attendance}%` }} />
                      </div>
                      <span className="text-xs">{s.attendance}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold">{s.cgpa}</td>
                  <td className="px-5 py-3"><Badge tone={s.status==="Active"?"success":"warn"}>{s.status}</Badge></td>
                  <td className="px-5 py-3 text-right"><button className="text-indigo text-xs font-medium hover:underline">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 flex items-center justify-between text-xs text-muted-foreground border-t">
          <span>Showing 1–{students.length} of {students.length}</span>
          <div className="flex gap-1">
            <button className="px-2.5 py-1 rounded-md border bg-background">Prev</button>
            <button className="px-2.5 py-1 rounded-md bg-gradient-primary text-white">1</button>
            <button className="px-2.5 py-1 rounded-md border bg-background">2</button>
            <button className="px-2.5 py-1 rounded-md border bg-background">Next</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
