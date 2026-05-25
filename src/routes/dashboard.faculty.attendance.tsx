import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, QrCode, Save, Search } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { attendanceStudents, weeklyAttendance } from "@/lib/faculty-data";

export const Route = createFileRoute("/dashboard/faculty/attendance")({
  component: MarkAttendance,
});

function MarkAttendance() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSubject, setSelectedSubject] = useState("Data Structures");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mark Attendance"
        desc="Record daily attendance for students with QR scanning and status tracking."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: "45", tone: "info" as const },
          { label: "Present", value: "42", tone: "success" as const },
          { label: "Absent", value: "3", tone: "danger" as const },
          { label: "Late", value: "0", tone: "warn" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">Today</Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input placeholder="Search students..." className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm" />
          </div>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["Data Structures", "Algorithms", "Database Systems", "Web Technologies"].map(s => <option key={s}>{s}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm" />
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Attendance List</h3>
            <Badge tone="info">{selectedSubject}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  {["Student ID", "Student Name", "Department", "Attendance Status", "Remarks"].map(column => (
                    <th key={column} className="text-left py-3 px-4 font-semibold text-muted-foreground">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {attendanceStudents.map(student => (
                  <tr key={student.id} className="hover:bg-accent/50 transition">
                    <td className="py-3 px-4 font-medium text-xs">{student.id}</td>
                    <td className="py-3 px-4 font-medium">{student.name}</td>
                    <td className="py-3 px-4"><Badge tone="info">{student.department}</Badge></td>
                    <td className="py-3 px-4">
                      <select defaultValue={student.status} className="rounded-lg border bg-background px-3 py-1.5 text-xs">
                        {["Present", "Absent", "Late"].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <input defaultValue={student.remarks} placeholder="Add remarks" className="w-full rounded-lg border bg-background px-3 py-1.5 text-xs" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="px-6 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-medium flex items-center gap-2 glow-primary">
              <Save className="size-4" /> Save Attendance
            </button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="size-5 text-indigo" />
            <h3 className="font-semibold">QR Attendance</h3>
          </div>
          <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto bg-white rounded-xl border-2 border-dashed border-primary flex items-center justify-center">
                <QrCode className="size-16 text-muted-foreground" />
              </div>
              <div className="text-xs text-muted-foreground mt-2">Scan to mark attendance</div>
            </div>
            <div className="text-center text-sm">
              <div className="font-medium">Class: {selectedSubject}</div>
              <div className="text-muted-foreground">Date: {selectedDate}</div>
            </div>
            <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium">
              Generate New QR
            </button>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Attendance Analytics</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {weeklyAttendance.map(day => (
            <div key={day.day} className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-xs text-muted-foreground">{day.day}</div>
              <div className="text-2xl font-bold mt-2">{day.percentage}%</div>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-emerald-600">{day.present} present</span>
                <span className="text-rose-600">{day.absent} absent</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
