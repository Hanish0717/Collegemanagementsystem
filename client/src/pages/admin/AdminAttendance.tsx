import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, QrCode, Search, Users } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { attendanceAlerts, attendanceMonitoring, students } from "@/mock/adminData";

export function AdminAttendance() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Monitoring"
        desc="Track daily attendance, department-wise analytics, low attendance alerts and QR-based attendance."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Overall Attendance", value: "87.3%", tone: "success" as const },
          { label: "Present Today", value: "2,484", tone: "info" as const },
          { label: "Absent Today", value: "363", tone: "warn" as const },
          { label: "Low Attendance", value: "47", tone: "danger" as const },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Today
            </Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              placeholder="Search attendance by student ID, name..."
              className="w-full rounded-xl border bg-background/60 pl-10 pr-4 py-2.5 text-sm"
            />
          </div>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {[
              "All Departments",
              "Computer Science & Engineering",
              "Artificial Intelligence & Machine Learning",
              "Artificial Intelligence & Data Science",
              "Cybersecurity",
              "Information Technology",
              "Electronics & Communication Engineering",
              "Electrical & Electronics Engineering",
              "Mechanical Engineering",
              "Civil Engineering"
            ].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All Status", "Present", "Absent", "Late"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Daily Attendance Trends</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={attendanceMonitoring}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="present" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                <Bar dataKey="absent" fill="#06B6D4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-5 text-amber-600" />
            <h3 className="font-semibold">Low Attendance Alerts</h3>
          </div>
          <div className="space-y-2">
            {attendanceAlerts.map((alert) => (
              <div key={alert.department} className="p-3 rounded-xl border bg-gradient-soft">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{alert.department}</span>
                  <Badge tone="danger">{alert.studentsBelow75} below 75%</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {alert.totalStudents} total students
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Student Attendance Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {[
                  "Student ID",
                  "Name",
                  "Department",
                  "Year",
                  "Today's Status",
                  "Overall Attendance",
                  "Actions",
                ].map((column) => (
                  <th
                    key={column}
                    className="text-left py-3 px-4 font-semibold text-muted-foreground"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.slice(0, 5).map((student) => (
                <tr key={student.id} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium text-xs">{student.id}</td>
                  <td className="py-3 px-4 font-medium">{student.name}</td>
                  <td className="py-3 px-4">
                    <Badge tone="info">{student.department}</Badge>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{student.year}</td>
                  <td className="py-3 px-4">
                    <Badge tone="success">Present</Badge>
                  </td>
                  <td className="py-3 px-4 font-medium">{student.attendance}</td>
                  <td className="py-3 px-4">
                    <button className="px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition">
                      Details
                    </button>
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
            <QrCode className="size-5 text-indigo" />
            <h3 className="font-semibold">QR Attendance</h3>
          </div>
          <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <div className="grid sm:grid-cols-2 gap-4">
              <select className="rounded-lg border bg-background px-3 py-2 text-sm">
                {[
                  "Computer Science & Engineering",
                  "Artificial Intelligence & Machine Learning",
                  "Artificial Intelligence & Data Science",
                  "Cybersecurity",
                  "Information Technology",
                  "Electronics & Communication Engineering",
                  "Electrical & Electronics Engineering",
                  "Mechanical Engineering",
                  "Civil Engineering"
                ].map(
                  (d) => (
                    <option key={d}>{d}</option>
                  ),
                )}
              </select>
              <input
                placeholder="Enter class/section"
                className="rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2">
              <QrCode className="size-4" /> Generate QR Code
            </button>
            <div className="text-center text-xs text-muted-foreground">
              Students can scan QR code to mark attendance
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-5 text-amber-600" />
            <h3 className="font-semibold">Warning Notifications</h3>
          </div>
          <div className="space-y-2">
            {[
              { student: "Amit Kumar", attendance: "71%", days: "5 days" },
              { student: "Anjali Gupta", attendance: "69%", days: "7 days" },
              { student: "Vikram Singh", attendance: "74%", days: "3 days" },
            ].map((item) => (
              <div
                key={item.student}
                className="p-3 rounded-xl border hover:bg-accent/50 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{item.student}</div>
                    <div className="text-xs text-muted-foreground">
                      Attendance: {item.attendance}
                    </div>
                  </div>
                  <Badge tone="warn">{item.days} consecutive</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
