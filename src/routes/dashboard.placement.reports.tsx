import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import { Download, TrendingUp, Users, Briefcase } from "lucide-react";
import { Card, PageHeader, Badge } from "@/components/dashboard/ui";
import { placementReports, departmentPlacementData, packageAnalyticsData } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/placement/reports")({
  component: ReportsAnalytics,
});

function ReportsAnalytics() {
  const latestMonth = placementReports[placementReports.length - 1];

  const stats = [
    { label: "Total Placed", value: latestMonth.placed, change: "+8.2%", icon: "👥" },
    { label: "Placement %", value: `${latestMonth.percentage}%`, change: "+3.5%", icon: "📊" },
    { label: "Avg Package", value: `${latestMonth.avgPackage} LPA`, change: "+2.1%", icon: "💰" },
    { label: "Active Companies", value: latestMonth.companyCount, change: "+2", icon: "🏢" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        desc="Comprehensive placement analytics and performance reports."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Download className="size-4" /> Export Report
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Card key={stat.label} className="text-center">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            <Badge tone="success" className="mt-2">{stat.change}</Badge>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Monthly Placement Trend</h3>
              <p className="text-xs text-muted-foreground">Year-to-date performance</p>
            </div>
            <Badge tone="info">6 months</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={placementReports}>
                <defs>
                  <linearGradient id="grad-trend" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#9333EA" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#9333EA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Legend />
                <Line type="monotone" dataKey="placed" stroke="#9333EA" strokeWidth={2.5} name="Placed Students" />
                <Line type="monotone" dataKey="percentage" stroke="#06B6D4" strokeWidth={2} name="Placement %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Department-wise Placement</h3>
              <p className="text-xs text-muted-foreground">Placement by department</p>
            </div>
            <Badge tone="success">+12%</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={departmentPlacementData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentPlacementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Package Analytics */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Package Distribution</h3>
            <p className="text-xs text-muted-foreground">Students by salary range</p>
          </div>
          <Badge tone="success">↑ 15%</Badge>
        </div>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={packageAnalyticsData}>
              <defs>
                <linearGradient id="grad-pkg-chart" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#9333EA" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="range" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
              <Bar dataKey="count" fill="url(#grad-pkg-chart)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Monthly Report Table */}
      <Card>
        <h3 className="font-semibold mb-4">Monthly Reports</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Month</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Placed</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Placement %</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Avg Package</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Highest</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Companies</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {placementReports.map(report => (
                <tr key={report.month} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{report.month}</td>
                  <td className="py-3 px-4 text-center font-bold">{report.placed}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-bold ${report.percentage >= 50 ? "text-emerald-600" : report.percentage >= 40 ? "text-amber-600" : "text-rose-600"}`}>
                      {report.percentage}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-blue-600">{report.avgPackage} LPA</td>
                  <td className="py-3 px-4 text-center font-semibold text-purple-600">{report.highestPackage} LPA</td>
                  <td className="py-3 px-4 text-center">{report.companyCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Cumulative Placed</div>
              <div className="text-2xl font-bold mt-1">
                {placementReports.reduce((sum, r) => sum + r.placed, 0)}
              </div>
            </div>
            <Users className="size-8 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Overall Avg Package</div>
              <div className="text-2xl font-bold mt-1">
                {(placementReports.reduce((sum, r) => sum + r.avgPackage, 0) / placementReports.length).toFixed(1)} LPA
              </div>
            </div>
            <TrendingUp className="size-8 text-emerald-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Highest Package</div>
              <div className="text-2xl font-bold mt-1">
                {Math.max(...placementReports.map(r => r.highestPackage))} LPA
              </div>
            </div>
            <TrendingUp className="size-8 text-purple-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Total Companies</div>
              <div className="text-2xl font-bold mt-1">
                {Math.max(...placementReports.map(r => r.companyCount))}
              </div>
            </div>
            <Briefcase className="size-8 text-amber-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Download Reports */}
      <Card>
        <h3 className="font-semibold mb-4">Download Reports</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { name: "Monthly Report", format: "PDF", size: "2.4 MB" },
            { name: "Placement Stats", format: "Excel", size: "1.8 MB" },
            { name: "Student Data", format: "CSV", size: "892 KB" },
            { name: "Company Analytics", format: "PDF", size: "3.1 MB" },
          ].map(report => (
            <button
              key={report.name}
              className="p-4 rounded-lg border hover:border-primary hover:bg-accent/50 transition text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{report.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{report.format} • {report.size}</div>
                </div>
                <Download className="size-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Top Recruiters */}
      <Card>
        <h3 className="font-semibold mb-4">Top Recruiting Companies</h3>
        <div className="space-y-2">
          {[
            { company: "Google India", placements: 12, avgPackage: 22.5 },
            { company: "Microsoft India", placements: 10, avgPackage: 20.0 },
            { company: "Amazon India", placements: 15, avgPackage: 18.5 },
            { company: "Goldman Sachs", placements: 8, avgPackage: 24.0 },
            { company: "Infosys", placements: 18, avgPackage: 10.5 },
          ].map((rec, idx) => (
            <div key={rec.company} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-gradient-primary text-white grid place-items-center font-bold text-xs shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <div className="font-medium text-sm">{rec.company}</div>
                  <div className="text-xs text-muted-foreground">{rec.placements} placements</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-blue-600">{rec.avgPackage} LPA</div>
                <div className="text-xs text-muted-foreground">Avg package</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Performance Indicators */}
      <Card>
        <h3 className="font-semibold mb-4">Performance Indicators</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { metric: "Placement Success Rate", value: "52%", target: "60%", status: "warning" },
            { metric: "Average Package Growth", value: "+8.2%", target: "+10%", status: "success" },
            { metric: "Company Partnership Growth", value: "+16.7%", target: "+15%", status: "success" },
            { metric: "Student Readiness Score", value: "78%", target: "85%", status: "warning" },
          ].map(indicator => (
            <div key={indicator.metric} className="p-3 rounded-lg border">
              <div className="text-xs text-muted-foreground mb-2">{indicator.metric}</div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xl font-bold">{indicator.value}</div>
                  <div className="text-xs text-muted-foreground">Target: {indicator.target}</div>
                </div>
                <Badge tone={indicator.status as any}>
                  {indicator.status === "success" ? "✓" : "⚠"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
