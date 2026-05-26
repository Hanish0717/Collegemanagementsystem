import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Save, Search } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { internalMarks, studentPerformance } from "@/mock/facultyData";



export function FacultyMarks() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Internal Marks Entry"
        desc="Enter and manage internal marks for students with grade calculation and performance tracking."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: internalMarks.length.toString(), tone: "info" as const },
          { label: "Submitted", value: internalMarks.filter(m => m.status === "Submitted").length.toString(), tone: "success" as const },
          { label: "Pending", value: internalMarks.filter(m => m.status === "Pending").length.toString(), tone: "warn" as const },
          { label: "Average Score", value: "83%", tone: "success" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">Current</Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input placeholder="Search students..." className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm" />
          </div>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["Data Structures", "Algorithms", "Database Systems", "Web Technologies"].map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["Mid-Term", "Final", "Assignment", "Quiz"].map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Marks Entry Table</h3>
          <Badge tone="info">Data Structures</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {["Student ID", "Student Name", "Subject", "Internal Marks", "Grade", "Status"].map(column => (
                  <th key={column} className="text-left py-3 px-4 font-semibold text-muted-foreground">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {internalMarks.map(mark => (
                <tr key={mark.id} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium text-xs">{mark.id}</td>
                  <td className="py-3 px-4 font-medium">{mark.name}</td>
                  <td className="py-3 px-4"><Badge tone="info">{mark.subject}</Badge></td>
                  <td className="py-3 px-4">
                    <input type="number" defaultValue={mark.marks} max={100} className="w-20 rounded-lg border bg-background px-3 py-1.5 text-sm" />
                  </td>
                  <td className="py-3 px-4">
                    <Badge tone={mark.grade.startsWith("A") ? "success" : mark.grade.startsWith("B") ? "info" : "warn"}>{mark.grade}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge tone={mark.status === "Submitted" ? "success" : "warn"}>{mark.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2.5 rounded-xl border text-sm font-medium hover:bg-accent transition">
            Save Draft
          </button>
          <button className="px-6 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-medium flex items-center gap-2 glow-primary">
            <Save className="size-4" /> Submit Marks
          </button>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">Performance Analytics</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={studentPerformance}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="student" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="attendance" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                <Bar dataKey="marks" fill="#06B6D4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Grade Distribution</h3>
          <div className="space-y-3">
            {[
              { grade: "A+ (90-100)", count: 8, percentage: "18%" },
              { grade: "A (80-89)", count: 15, percentage: "33%" },
              { grade: "B+ (70-79)", count: 12, percentage: "27%" },
              { grade: "B (60-69)", count: 7, percentage: "16%" },
              { grade: "C (Below 60)", count: 3, percentage: "6%" },
            ].map(item => (
              <div key={item.grade} className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border">
                <span className="text-sm font-medium">{item.grade}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm">{item.count} students</span>
                  <Badge tone="info">{item.percentage}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
