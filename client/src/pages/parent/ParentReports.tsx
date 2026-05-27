import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, TrendingUp } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { performanceData } from "@/mock/parentData";

export function ParentReports() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Reports"
        desc="View academic performance analytics, attendance vs marks comparison, and semester reports."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Download className="size-4" /> Download Report
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Current GPA", value: "3.6", tone: "success" as const },
          { label: "Overall Attendance", value: "87.3%", tone: "success" as const },
          { label: "Class Rank", value: "8/45", tone: "info" as const },
          { label: "Improvement", value: "+0.2", tone: "success" as const },
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

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">GPA Progress</h3>
            <Badge tone="success">3.6</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="semester" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Line type="monotone" dataKey="gpa" stroke="#4F46E5" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Attendance vs GPA</h3>
            <Badge tone="info">Correlation</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="perf-gpa" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="perf-attendance" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="semester" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Area
                  type="monotone"
                  dataKey="gpa"
                  stroke="#4F46E5"
                  fill="url(#perf-gpa)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="#06B6D4"
                  fill="url(#perf-attendance)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Semester-wise Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {["Semester", "GPA", "Attendance", "Class Rank", "Status"].map((column) => (
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
              {performanceData.map((data, index) => (
                <tr key={index} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{data.semester}</td>
                  <td className="py-3 px-4 font-medium">{data.gpa}</td>
                  <td className="py-3 px-4">{data.attendance}%</td>
                  <td className="py-3 px-4">{data.rank}</td>
                  <td className="py-3 px-4">
                    <Badge tone={data.gpa >= 3.5 ? "success" : "info"}>
                      {data.gpa >= 3.5 ? "Excellent" : "Good"}
                    </Badge>
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
            <TrendingUp className="size-5 text-indigo" />
            <h3 className="font-semibold">Student Growth</h3>
          </div>
          <div className="space-y-3">
            {[
              { metric: "GPA Improvement", value: "+0.4 from Sem 1", tone: "success" as const },
              { metric: "Attendance Stability", value: "87% average", tone: "info" as const },
              { metric: "Rank Progress", value: "Improved 7 positions", tone: "success" as const },
              {
                metric: "Subject Mastery",
                value: "5 subjects above 85%",
                tone: "success" as const,
              },
            ].map((item) => (
              <div
                key={item.metric}
                className="flex items-center justify-between p-3 rounded-xl border"
              >
                <span className="text-sm">{item.metric}</span>
                <Badge tone={item.tone}>{item.value}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Report Filters</h3>
          <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
              {[
                "All Semesters",
                "Semester 5",
                "Semester 4",
                "Semester 3",
                "Semester 2",
                "Semester 1",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
              {["This Year", "Last 6 Months", "Last 3 Months", "This Month"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium">
              Generate Report
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
