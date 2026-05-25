import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, Filter } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { departmentDistribution, reportFilters, systemAnalytics, userActivityData } from "@/lib/super-admin-data";

export const Route = createFileRoute("/dashboard/super-admin/reports")({
  component: GlobalReports,
});

function GlobalReports() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Global Reports"
        desc="Institution-wide revenue, student, faculty, placement and attendance analytics."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Download className="size-4" /> Export Reports
          </button>
        }
      />

      <Card>
        <div className="flex flex-wrap gap-2">
          {reportFilters.map((filter, index) => (
            <button key={filter} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${index === 0 ? "bg-gradient-primary text-white" : "border hover:bg-accent"}`}>
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
          { label: "Revenue Analytics", value: "$1.24M", tone: "success" as const },
          { label: "Student Analytics", value: "12,480", tone: "info" as const },
          { label: "Faculty Analytics", value: "684", tone: "info" as const },
          { label: "Placement Statistics", value: "287 placed", tone: "success" as const },
        ].map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">Available</Badge>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">Revenue Analytics</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={systemAnalytics}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.18} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Attendance Reports</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Line type="monotone" dataKey="logins" stroke="#06B6D4" strokeWidth={2.5} />
                <Line type="monotone" dataKey="actions" stroke="#9333EA" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Department and Faculty Analytics</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={departmentDistribution}>
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
          {["Revenue Report", "Student Report", "Faculty Report", "Placement Report", "Attendance Report", "Security Report", "Backup Report", "Department Report"].map(report => (
            <button key={report} className="p-4 rounded-xl border text-left hover:border-primary hover:bg-accent/50 transition">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{report}</div>
                  <div className="text-xs text-muted-foreground mt-1">PDF • Excel</div>
                </div>
                <Download className="size-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
