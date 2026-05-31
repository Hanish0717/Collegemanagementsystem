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
import { Download, Filter } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import {
  attendanceMonitoring,
  departmentDistributionAdmin,
  studentAnalytics,
} from "@/mock/adminData";

export function AdminReports() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        desc="View comprehensive analytics for students, faculty, revenue, attendance and department performance."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Download className="size-4" /> Export All
          </button>
        }
      />

      <Card>
        <div className="flex flex-wrap gap-2">
          {["This Month", "This Semester", "This Year", "Custom Range"].map((filter, index) => (
            <button
              key={filter}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${index === 0 ? "bg-gradient-primary text-white" : "border hover:bg-accent"}`}
            >
              {filter}
            </button>
          ))}
          <button className="px-4 py-2 rounded-xl border text-sm font-medium hover:bg-accent transition flex items-center gap-2">
            <Filter className="size-4" /> More Filters
          </button>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Student Analytics", value: "2,847", tone: "info" as const },
          { label: "Faculty Analytics", value: "156", tone: "info" as const },
          { label: "Revenue Reports", value: "₹84.7L", tone: "success" as const },
          { label: "Attendance Reports", value: "87.3%", tone: "success" as const },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Available
            </Badge>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">Student Enrollment Trends</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={studentAnalytics}>
                <defs>
                  <linearGradient id="report-enrolled" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Area
                  type="monotone"
                  dataKey="enrolled"
                  stroke="#4F46E5"
                  fill="url(#report-enrolled)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Attendance Reports</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={attendanceMonitoring}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Line type="monotone" dataKey="present" stroke="#4F46E5" strokeWidth={2.5} />
                <Line type="monotone" dataKey="absent" stroke="#06B6D4" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Department Performance Analytics</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={departmentDistributionAdmin}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
              <Bar dataKey="value" fill="#4F46E5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Download Report Packs</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { name: "Student Report", formats: "PDF • Excel" },
            { name: "Faculty Report", formats: "PDF • Excel" },
            { name: "Revenue Report", formats: "PDF • Excel" },
            { name: "Attendance Report", formats: "PDF • Excel" },
            { name: "Department Report", formats: "PDF • Excel" },
            { name: "Fee Collection Report", formats: "PDF • Excel" },
            { name: "Event Report", formats: "PDF • Excel" },
            { name: "Performance Report", formats: "PDF • Excel" },
          ].map((report) => (
            <button
              key={report.name}
              className="p-4 rounded-xl border text-left hover:border-primary hover:bg-accent/50 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{report.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{report.formats}</div>
                </div>
                <Download className="size-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">Faculty Performance</h3>
          <div className="space-y-3">
            {[
              {
                name: "Dr. Rajesh Kumar",
                department: "Computer Science",
                rating: "4.8",
                classes: "124",
              },
              { name: "Prof. Sarah Lin", department: "Business", rating: "4.7", classes: "98" },
              { name: "Dr. Vikram Rao", department: "Mechanical", rating: "4.6", classes: "112" },
            ].map((faculty) => (
              <div
                key={faculty.name}
                className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition"
              >
                <div>
                  <div className="text-sm font-medium">{faculty.name}</div>
                  <div className="text-xs text-muted-foreground">{faculty.department}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{faculty.rating} ⭐</div>
                  <div className="text-xs text-muted-foreground">{faculty.classes} classes</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Department-wise Revenue</h3>
          <div className="space-y-3">
            {[
              { name: "Computer Science", revenue: "₹32L", growth: "+12%" },
              { name: "Electronics", revenue: "₹24L", growth: "+8%" },
              { name: "Mechanical", revenue: "₹18L", growth: "+5%" },
              { name: "Business", revenue: "₹10.7L", growth: "+15%" },
            ].map((dept) => (
              <div
                key={dept.name}
                className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/50 transition"
              >
                <span className="text-sm font-medium">{dept.name}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold">{dept.revenue}</div>
                  <div className="text-xs text-emerald-600">{dept.growth}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
