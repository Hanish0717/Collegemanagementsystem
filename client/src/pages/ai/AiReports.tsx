import { createFileRoute } from '@tanstack/react-router';
import {
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Badge, Card, PageHeader } from '@/components/dashboard/ui';

export function AiReports() {
  const reportTypes = [
    { type: 'Attendance Reports', count: 45, icon: Calendar, color: 'bg-gradient-primary' },
    { type: 'Academic Reports', count: 38, icon: FileText, color: 'bg-gradient-violet' },
    { type: 'Placement Analytics', count: 22, icon: TrendingUp, color: 'bg-gradient-cyan' },
    { type: 'Department Performance', count: 15, icon: BarChart3, color: 'bg-gradient-primary' },
  ];

  const recentReports = [
    {
      name: 'Monthly Attendance Report - May 2026',
      type: 'Attendance',
      date: 'May 25, 2026',
      size: '2.4 MB',
      status: 'Ready',
    },
    {
      name: 'Academic Performance - Semester 5',
      type: 'Academic',
      date: 'May 24, 2026',
      size: '3.1 MB',
      status: 'Ready',
    },
    {
      name: 'Department Analysis - Computer Science',
      type: 'Department',
      date: 'May 23, 2026',
      size: '1.8 MB',
      status: 'Ready',
    },
    {
      name: 'Placement Statistics - 2026',
      type: 'Placement',
      date: 'May 22, 2026',
      size: '4.2 MB',
      status: 'Processing',
    },
    {
      name: 'Student Risk Summary - May',
      type: 'Risk',
      date: 'May 21, 2026',
      size: '2.9 MB',
      status: 'Ready',
    },
  ];

  const summaryCards = [
    { label: 'Total Reports Generated', value: '156', tone: 'success' as const },
    { label: 'Reports This Month', value: '28', tone: 'info' as const },
    { label: 'Pending Generation', value: '5', tone: 'warn' as const },
    { label: 'Downloads Today', value: '42', tone: 'success' as const },
  ];

  const insights = [
    {
      title: 'Attendance Improvement',
      desc: 'Overall college attendance improved by 3.2% this month',
      icon: TrendingUp,
    },
    {
      title: 'Academic Excellence',
      desc: 'Computer Science department shows highest GPA improvement',
      icon: CheckCircle,
    },
    {
      title: 'Risk Reduction',
      desc: 'High-risk student count decreased by 8% after interventions',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Smart Reports"
        desc="AI-generated reports with automated insights and analytics summaries."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Download className="size-4" /> Generate New Report
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {summaryCards.map((stat) => (
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
          <div className="flex items-center gap-2 mb-4">
            <FileText className="size-5 text-indigo" />
            <h3 className="font-semibold">Report Types</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {reportTypes.map((report, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border hover:bg-accent/50 transition cursor-pointer"
              >
                <div
                  className={`size-12 rounded-lg ${report.color} text-white grid place-items-center mb-3`}
                >
                  <report.icon className="size-6" />
                </div>
                <div className="text-sm font-medium">{report.type}</div>
                <div className="text-xs text-muted-foreground mt-1">{report.count} reports</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="size-5 text-indigo" />
            <h3 className="font-semibold">AI Insights Summary</h3>
          </div>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 rounded-xl border hover:bg-accent/50 transition">
                <div className="flex items-center gap-2 mb-2">
                  <insight.icon className="size-4 text-indigo" />
                  <span className="text-sm font-medium">{insight.title}</span>
                </div>
                <div className="text-xs text-muted-foreground">{insight.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Reports</h3>
          <Badge tone="info">5 Reports</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {['Report Name', 'Type', 'Date', 'Size', 'Status', 'Action'].map((column) => (
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
              {recentReports.map((report, index) => (
                <tr key={index} className="hover:bg-accent/50 transition">
                  <td className="py-3 px-4 font-medium">{report.name}</td>
                  <td className="py-3 px-4">{report.type}</td>
                  <td className="py-3 px-4 text-muted-foreground">{report.date}</td>
                  <td className="py-3 px-4">{report.size}</td>
                  <td className="py-3 px-4">
                    <Badge tone={report.status === 'Ready' ? 'success' : 'warn'}>
                      {report.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <button className="px-3 py-1.5 rounded-lg bg-gradient-primary text-white text-xs flex items-center gap-1">
                      <Download className="size-3" /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Report Generation History</h3>
        <div className="space-y-3">
          {[
            {
              date: 'May 25, 2026',
              time: '10:30 AM',
              report: 'Monthly Attendance Report',
              status: 'Completed',
            },
            {
              date: 'May 24, 2026',
              time: '03:45 PM',
              report: 'Academic Performance Report',
              status: 'Completed',
            },
            {
              date: 'May 23, 2026',
              time: '11:20 AM',
              report: 'Department Analysis Report',
              status: 'Completed',
            },
            {
              date: 'May 22, 2026',
              time: '02:15 PM',
              report: 'Placement Statistics Report',
              status: 'Processing',
            },
            {
              date: 'May 21, 2026',
              time: '09:00 AM',
              report: 'Student Risk Summary',
              status: 'Completed',
            },
          ].map((history, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition"
            >
              <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center">
                <Clock className="size-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{history.report}</div>
                <div className="text-xs text-muted-foreground">
                  {history.date} • {history.time}
                </div>
              </div>
              <Badge tone={history.status === 'Completed' ? 'success' : 'warn'}>
                {history.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Generate Custom Report</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-xl bg-gradient-soft">
          <select className="rounded-lg border bg-background px-3 py-2 text-sm">
            {[
              'Select Report Type',
              'Attendance',
              'Academic',
              'Placement',
              'Department',
              'Risk Analysis',
            ].map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
          <select className="rounded-lg border bg-background px-3 py-2 text-sm">
            {[
              'Select Time Period',
              'This Month',
              'Last Month',
              'This Semester',
              'This Year',
              'Custom Range',
            ].map((period) => (
              <option key={period}>{period}</option>
            ))}
          </select>
          <select className="rounded-lg border bg-background px-3 py-2 text-sm">
            {[
              'Select Department',
              'All Departments',
              'Computer Science',
              'Electrical Engineering',
              'Mechanical Engineering',
              'Business Administration',
            ].map((dept) => (
              <option key={dept}>{dept}</option>
            ))}
          </select>
          <button className="px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium flex items-center justify-center gap-2">
            <FileText className="size-4" /> Generate Report
          </button>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Download Analytics</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Downloads',
              value: '1,245',
              icon: Download,
              color: 'bg-gradient-primary',
            },
            { label: 'This Week', value: '89', icon: Download, color: 'bg-gradient-violet' },
            {
              label: 'Most Downloaded',
              value: 'Attendance',
              icon: FileText,
              color: 'bg-gradient-cyan',
            },
            {
              label: 'Avg Download Time',
              value: '2.3s',
              icon: Clock,
              color: 'bg-gradient-primary',
            },
          ].map((stat, index) => (
            <div key={index} className="p-4 rounded-xl border hover:bg-accent/50 transition">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`size-8 rounded-lg ${stat.color} text-white grid place-items-center`}
                >
                  <stat.icon className="size-4" />
                </div>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <div className="text-xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
