import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Calendar, QrCode } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { attendanceHistory, attendanceRecords } from "@/lib/student-data";

export const Route = createFileRoute("/dashboard/student/attendance")({
  component: AttendanceTracking,
});

function AttendanceTracking() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Tracking"
        desc="View your attendance history, monthly statistics, and QR-based attendance records."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Overall Attendance", value: "87.3%", tone: "success" as const },
          { label: "Present Days", value: "108", tone: "info" as const },
          { label: "Absent Days", value: "12", tone: "danger" as const },
          { label: "This Month", value: "92%", tone: "success" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">Current</Badge>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Monthly Attendance</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={attendanceHistory}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
              <Bar dataKey="present" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              <Bar dataKey="absent" fill="#06B6D4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Attendance Records</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {["Date", "Subject", "Time", "Status"].map(column => (
                  <th key={column} className="text-left py-3 px-4 font-semibold text-muted-foreground">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {attendanceRecords.map((record, index) => (
                <tr key={index} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{record.date}</td>
                  <td className="py-3 px-4"><Badge tone="info">{record.subject}</Badge></td>
                  <td className="py-3 px-4 text-muted-foreground">{record.time}</td>
                  <td className="py-3 px-4">
                    <Badge tone={record.status === "Present" ? "success" : "danger"}>{record.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <div className="font-medium">Today's Classes</div>
            <div className="text-muted-foreground">Scan QR code in each class</div>
          </div>
          <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium">
            View Today's QR Codes
          </button>
        </div>
      </Card>
    </div>
  );
}
