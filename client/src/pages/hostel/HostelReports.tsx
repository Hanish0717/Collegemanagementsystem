import { createFileRoute } from "@tanstack/react-router";
import {
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
import {
  FileText,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Utensils,
  AlertTriangle,
} from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";

export function HostelReports() {
  const occupancyReport = [
    { month: "Jan", occupancy: 72, newAdmissions: 25, departures: 5 },
    { month: "Feb", occupancy: 74, newAdmissions: 18, departures: 8 },
    { month: "Mar", occupancy: 76, newAdmissions: 22, departures: 6 },
    { month: "Apr", occupancy: 78, newAdmissions: 20, departures: 7 },
    { month: "May", occupancy: 79, newAdmissions: 15, departures: 4 },
  ];

  const feeCollectionReport = [
    { month: "Jan", collected: 75000, target: 80000, percentage: 94 },
    { month: "Feb", collected: 78000, target: 80000, percentage: 98 },
    { month: "Mar", collected: 82000, target: 80000, percentage: 102 },
    { month: "Apr", collected: 85000, target: 80000, percentage: 106 },
    { month: "May", collected: 89500, target: 80000, percentage: 112 },
  ];

  const complaintAnalytics = [
    { month: "Jan", resolved: 28, pending: 12, escalated: 2 },
    { month: "Feb", resolved: 32, pending: 10, escalated: 1 },
    { month: "Mar", resolved: 35, pending: 8, escalated: 2 },
    { month: "Apr", resolved: 30, pending: 15, escalated: 3 },
    { month: "May", resolved: 31, pending: 14, escalated: 2 },
  ];

  const visitorAnalytics = [
    { month: "Jan", visitors: 180, avgDuration: "1.5h" },
    { month: "Feb", visitors: 195, avgDuration: "1.4h" },
    { month: "Mar", visitors: 210, avgDuration: "1.6h" },
    { month: "Apr", visitors: 225, avgDuration: "1.5h" },
    { month: "May", visitors: 240, avgDuration: "1.5h" },
  ];

  const messAttendanceReport = [
    { month: "Jan", breakfast: 92, lunch: 94, dinner: 91 },
    { month: "Feb", breakfast: 93, lunch: 95, dinner: 92 },
    { month: "Mar", breakfast: 94, lunch: 96, dinner: 93 },
    { month: "Apr", breakfast: 93, lunch: 95, dinner: 92 },
    { month: "May", breakfast: 94, lunch: 95, dinner: 93 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Reports"
        desc="View comprehensive reports on occupancy, fees, complaints, visitors, and mess attendance."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Reports", value: "12", tone: "info" as const },
          { label: "This Month", value: "5", tone: "success" as const },
          { label: "Pending", value: "2", tone: "warn" as const },
          { label: "Downloaded", value: "8", tone: "info" as const },
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
        <div className="flex flex-col lg:flex-row gap-3">
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["This Month", "Last Month", "This Quarter", "This Year", "Custom Range"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <select className="rounded-xl border bg-background/60 px-4 py-2.5 text-sm">
            {["All Reports", "Occupancy", "Fees", "Complaints", "Visitors", "Mess"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Download className="size-4" /> Download All
          </button>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-indigo" />
              <h3 className="font-semibold">Occupancy Report</h3>
            </div>
            <button className="text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1">
              <Download className="size-3" /> Download
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={occupancyReport}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Line
                  type="monotone"
                  dataKey="occupancy"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={{ fill: "#4F46E5" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">79%</div>
              <div className="text-xs text-muted-foreground">Current Occupancy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">100</div>
              <div className="text-xs text-muted-foreground">New Admissions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">30</div>
              <div className="text-xs text-muted-foreground">Departures</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="size-5 text-indigo" />
              <h3 className="font-semibold">Fee Collection Report</h3>
            </div>
            <button className="text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1">
              <Download className="size-3" /> Download
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={feeCollectionReport}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="collected" fill="#10B981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="target" fill="#E5E7EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">₹40.95L</div>
              <div className="text-xs text-muted-foreground">Total Collected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">102%</div>
              <div className="text-xs text-muted-foreground">Collection Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">₹45,000</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-indigo" />
              <h3 className="font-semibold">Complaint Analytics</h3>
            </div>
            <button className="text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1">
              <Download className="size-3" /> Download
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={complaintAnalytics}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="resolved" fill="#10B981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pending" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                <Bar dataKey="escalated" fill="#EF4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">156</div>
              <div className="text-xs text-muted-foreground">Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">67%</div>
              <div className="text-xs text-muted-foreground">Resolution Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">10</div>
              <div className="text-xs text-muted-foreground">Escalated</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-indigo" />
              <h3 className="font-semibold">Visitor Analytics</h3>
            </div>
            <button className="text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1">
              <Download className="size-3" /> Download
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={visitorAnalytics}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Line
                  type="monotone"
                  dataKey="visitors"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={{ fill: "#4F46E5" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">1,050</div>
              <div className="text-xs text-muted-foreground">Total Visitors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">210</div>
              <div className="text-xs text-muted-foreground">Avg/Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">1.5h</div>
              <div className="text-xs text-muted-foreground">Avg Duration</div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Utensils className="size-5 text-indigo" />
            <h3 className="font-semibold">Mess Attendance Report</h3>
          </div>
          <button className="text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1">
            <Download className="size-3" /> Download
          </button>
        </div>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={messAttendanceReport}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
              <Bar dataKey="breakfast" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              <Bar dataKey="lunch" fill="#06B6D4" radius={[8, 8, 0, 0]} />
              <Bar dataKey="dinner" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold">94%</div>
            <div className="text-xs text-muted-foreground">Breakfast Avg</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">95%</div>
            <div className="text-xs text-muted-foreground">Lunch Avg</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">92%</div>
            <div className="text-xs text-muted-foreground">Dinner Avg</div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="size-5 text-indigo" />
          <h3 className="font-semibold">Performance Analytics</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Occupancy Growth", value: "+7%", trend: "up" },
            { label: "Fee Collection", value: "+12%", trend: "up" },
            { label: "Complaint Resolution", value: "+15%", trend: "up" },
            { label: "Mess Attendance", value: "+3%", trend: "up" },
          ].map((metric) => (
            <div key={metric.label} className="p-4 rounded-xl bg-gradient-soft border">
              <div className="text-xs text-muted-foreground">{metric.label}</div>
              <div className="text-2xl font-bold mt-2 text-emerald-600">{metric.value}</div>
              <div className="text-xs text-muted-foreground mt-1">vs last month</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
