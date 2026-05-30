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
import { useState } from "react";
import { toast } from "sonner";
import { downloadReportCSV } from "@/services/superAdminService";
import { useSuperAdminAnalytics } from "@/hooks/useSuperAdminAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

const reportFilters = ["AY 2026-27", "AY 2025-26", "All Cycles"];

export function SuperAdminReports() {
  const [activeFilter, setActiveFilter] = useState(reportFilters[0]);

  const { data, isLoading } = useSuperAdminAnalytics();

  const revenueStats = data?.revenueStats || [];
  const attendanceStats = data?.attendanceStats || [];
  const departmentStats = data?.departmentStats || [];
  const summaryCards = data?.summaryCards || {
    revenue: "₹0",
    studentCount: "0",
    facultyCount: "0",
    placementCount: "0 placed",
  };

  const handleExportAll = async () => {
    toast.info("Preparing comprehensive report pack...");
    try {
      const blob = await downloadReportCSV("comprehensive");
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "cms_comprehensive_report_pack.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Comprehensive report pack downloaded.");
    } catch (err: any) {
      toast.error("Failed to download comprehensive report pack");
    }
  };

  const handleDownloadReport = async (reportName: string) => {
    toast.info(`Generating ${reportName}...`);
    try {
      const blob = await downloadReportCSV(reportName);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeFilename = reportName.toLowerCase().replace(/\s+/g, "_") + ".csv";
      link.setAttribute("download", safeFilename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${reportName} download complete.`);
    } catch (err: any) {
      toast.error(`Failed to download ${reportName}`);
    }
  };

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    toast.success(`Filter applied: ${filter}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Global Reports"
        desc="Institution-wide revenue, student, faculty, placement and attendance analytics."
        actions={
          <button
            onClick={handleExportAll}
            className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2 cursor-pointer transition hover:opacity-95"
          >
            <Download className="size-4" /> Export Reports
          </button>
        }
      />

      <Card>
        <div className="flex flex-wrap gap-2">
          {reportFilters.map((filter) => {
            const isActive = filter === activeFilter;
            return (
              <button
                key={filter}
                onClick={() => handleFilterClick(filter)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer ${isActive ? "bg-gradient-primary text-white" : "border hover:bg-accent"}`}
              >
                {filter}
              </button>
            );
          })}
          <button
            onClick={() => toast.info("Opening advanced report filters...")}
            className="px-4 py-2 rounded-xl border text-sm font-medium hover:bg-accent transition flex items-center gap-2 cursor-pointer"
          >
            <Filter className="size-4" /> More Filters
          </button>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Revenue Analytics", value: summaryCards.revenue, tone: "success" as const },
          { label: "Student Analytics", value: summaryCards.studentCount, tone: "info" as const },
          { label: "Faculty Analytics", value: summaryCards.facultyCount, tone: "info" as const },
          { label: "Placement Statistics", value: summaryCards.placementCount, tone: "success" as const },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            {isLoading ? (
              <Skeleton className="h-7 w-20 mt-2 animate-pulse bg-muted-foreground/10" />
            ) : (
              <div className="text-2xl font-bold mt-2">{stat.value}</div>
            )}
            <Badge tone={stat.tone} className="mt-3">
              Available
            </Badge>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">Revenue Analytics (INR)</h3>
          <div className="h-72">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer>
                <AreaChart data={revenueStats}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4F46E5"
                    fill="#4F46E5"
                    fillOpacity={0.18}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Attendance Reports</h3>
          <div className="h-72">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer>
                <LineChart data={attendanceStats}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                  <Line type="monotone" dataKey="logins" stroke="#06B6D4" strokeWidth={2.5} name="Logins" />
                  <Line type="monotone" dataKey="actions" stroke="#9333EA" strokeWidth={2} name="Actions" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Department and Faculty Analytics</h3>
        <div className="h-72">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer>
              <BarChart data={departmentStats}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="value" fill="#4F46E5" radius={[8, 8, 0, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Download Report Packs</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            "Revenue Report",
            "Student Report",
            "Faculty Report",
            "Placement Report",
            "Attendance Report",
            "Security Report",
            "Backup Report",
            "Department Report",
          ].map((report) => (
            <button
              key={report}
              onClick={() => handleDownloadReport(report)}
              className="p-4 rounded-xl border text-left hover:border-primary hover:bg-accent/50 transition cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{report}</div>
                  <div className="text-xs text-muted-foreground mt-1">CSV Format</div>
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
