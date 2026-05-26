import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, Filter, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { performanceData, studentPerformance } from "@/mock/facultyData";



export function FacultyPerformance() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Performance Tracking"
        desc="Monitor student performance, track attendance vs marks, and identify at-risk students."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Download className="size-4" /> Download Report
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Top Performers", value: "12", tone: "success" as const },
          { label: "At Risk", value: "5", tone: "danger" as const },
          { label: "Average Score", value: "83%", tone: "info" as const },
          { label: "Avg Attendance", value: "87%", tone: "success" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">Current</Badge>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          {["All Students", "Top Performers", "At Risk", "Improving"].map((filter, index) => (
            <button key={filter} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${index === 0 ? "bg-gradient-primary text-white" : "border hover:bg-accent"}`}>
              {filter}
            </button>
          ))}
          <button className="px-4 py-2 rounded-xl border text-sm font-medium hover:bg-accent transition flex items-center gap-2">
            <Filter className="size-4" /> More Filters
          </button>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">Attendance vs Marks Correlation</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={studentPerformance}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="student" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Line type="monotone" dataKey="attendance" stroke="#4F46E5" strokeWidth={2.5} />
                <Line type="monotone" dataKey="marks" stroke="#06B6D4" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Overall Performance Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="perf-attendance" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="perf-marks" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="student" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Area type="monotone" dataKey="attendance" stroke="#4F46E5" fill="url(#perf-attendance)" strokeWidth={2} />
                <Area type="monotone" dataKey="assignments" stroke="#06B6D4" fill="url(#perf-marks)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Student Performance Cards</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {performanceData.map(student => (
            <Card key={student.student} className="hover:-translate-y-1 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="size-11 rounded-xl bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                  {student.student.split(" ").map(n => n[0]).join("")}
                </div>
                <Badge tone={student.overall >= 85 ? "success" : student.overall >= 75 ? "info" : "warn"}>
                  {student.overall}%
                </Badge>
              </div>
              <h3 className="font-semibold text-sm">{student.student}</h3>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Attendance</span>
                  <span className="font-medium">{student.attendance}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Assignments</span>
                  <span className="font-medium">{student.assignments}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Quizzes</span>
                  <span className="font-medium">{student.quizzes}%</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="size-5 text-emerald-600" />
            <h3 className="font-semibold">Top Performers</h3>
          </div>
          <div className="space-y-2">
            {performanceData.filter(s => s.overall >= 85).map(student => (
              <div key={student.student} className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition">
                <span className="text-sm font-medium">{student.student}</span>
                <Badge tone="success">{student.overall}%</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-5 text-amber-600" />
            <h3 className="font-semibold">Low Performance Alerts</h3>
          </div>
          <div className="space-y-2">
            {performanceData.filter(s => s.overall < 80).map(student => (
              <div key={student.student} className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition">
                <span className="text-sm font-medium">{student.student}</span>
                <Badge tone="danger">{student.overall}%</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
