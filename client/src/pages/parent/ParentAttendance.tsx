import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, TrendingDown } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { attendanceHistory, subjectAttendance } from "@/mock/parentData";

export function ParentAttendance() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Child Attendance"
        desc="Monitor child's attendance across subjects with detailed analytics and history."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Download className="size-4" /> Download Report
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Overall Attendance", value: "87.3%", tone: "success" as const },
          { label: "Present Days", value: "108", tone: "info" as const },
          { label: "Absent Days", value: "12", tone: "danger" as const },
          { label: "This Month", value: "92%", tone: "success" as const },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Current
            </Badge>
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
        <h3 className="font-semibold mb-4">Subject-wise Attendance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {[
                  "Subject",
                  "Total Classes",
                  "Attended Classes",
                  "Attendance Percentage",
                  "Status",
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
              {subjectAttendance.map((subject, index) => (
                <tr key={index} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{subject.subject}</td>
                  <td className="py-3 px-4">{subject.total}</td>
                  <td className="py-3 px-4">{subject.attended}</td>
                  <td className="py-3 px-4 font-medium">{subject.percentage}%</td>
                  <td className="py-3 px-4">
                    <Badge
                      tone={
                        subject.status === "Excellent"
                          ? "success"
                          : subject.status === "Good"
                            ? "info"
                            : "warn"
                      }
                    >
                      {subject.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="size-5 text-amber-600" />
          <h3 className="font-semibold">Low Attendance Alerts</h3>
        </div>
        <div className="space-y-2">
          {subjectAttendance
            .filter((s) => s.percentage < 85)
            .map((subject, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition"
              >
                <span className="text-sm font-medium">{subject.subject}</span>
                <Badge tone="warn">{subject.percentage}%</Badge>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
