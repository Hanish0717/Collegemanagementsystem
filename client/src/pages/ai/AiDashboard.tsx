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
import {
  Brain,
  AlertTriangle,
  TrendingUp,
  FileText,
  Activity,
  MessageSquare,
  Target,
  Zap,
} from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";

export function AiDashboard() {
  const predictionData = [
    { month: "Jan", predictions: 120, accuracy: 85 },
    { month: "Feb", predictions: 145, accuracy: 88 },
    { month: "Mar", predictions: 180, accuracy: 90 },
    { month: "Apr", predictions: 210, accuracy: 92 },
    { month: "May", predictions: 245, accuracy: 94 },
    { month: "Jun", predictions: 280, accuracy: 95 },
  ];

  const riskData = [
    { category: "Academic", high: 12, medium: 28, low: 45 },
    { category: "Attendance", high: 8, medium: 22, low: 55 },
    { category: "Behavioral", high: 5, medium: 15, low: 67 },
  ];

  const attendanceData = [
    { month: "Jan", current: 85, predicted: 87 },
    { month: "Feb", current: 82, predicted: 84 },
    { month: "Mar", current: 88, predicted: 90 },
    { month: "Apr", current: 86, predicted: 88 },
    { month: "May", current: 84, predicted: 86 },
    { month: "Jun", current: 87, predicted: 89 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Dashboard"
        desc="AI-powered predictions, risk analysis, and smart insights for college management."
      />

      <div className="grid md:grid-cols-4 gap-4">
        {[
          {
            label: "AI Predictions Generated",
            value: "1,245",
            icon: Brain,
            tone: "success" as const,
          },
          { label: "Student Risk Alerts", value: "25", icon: AlertTriangle, tone: "warn" as const },
          { label: "Attendance Warnings", value: "18", icon: Activity, tone: "warn" as const },
          { label: "Smart Recommendations", value: "89", icon: TrendingUp, tone: "info" as const },
          { label: "Automated Reports", value: "156", icon: FileText, tone: "success" as const },
          { label: "Active Insights", value: "67", icon: Target, tone: "info" as const },
          { label: "Chatbot Queries", value: "342", icon: MessageSquare, tone: "success" as const },
          { label: "System Accuracy", value: "94.5%", icon: Zap, tone: "success" as const },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              <stat.icon className="size-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Active
            </Badge>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Prediction Analytics</h3>
            <Badge tone="success">+15%</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={predictionData}>
                <defs>
                  <linearGradient id="pred-gradient" x1="0" x2="0" y1="0" y2="1">
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
                  dataKey="predictions"
                  stroke="#4F46E5"
                  fill="url(#pred-gradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Risk Analysis</h3>
            <Badge tone="warn">25 Alerts</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="category" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="high" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="medium" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="low" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Attendance Prediction</h3>
            <Badge tone="info">Forecast</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={attendanceData}>
                <defs>
                  <linearGradient id="att-current" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="att-predicted" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Line type="monotone" dataKey="current" stroke="#4F46E5" strokeWidth={2.5} />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#06B6D4"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">AI Activity Timeline</h3>
          <div className="space-y-3">
            {[
              {
                time: "10:30 AM",
                activity: "Generated 45 student risk predictions",
                type: "Prediction",
              },
              { time: "09:45 AM", activity: "Processed 12 attendance warnings", type: "Alert" },
              { time: "09:15 AM", activity: "Created 8 automated reports", type: "Report" },
              {
                time: "08:30 AM",
                activity: "Analyzed 23 student performance trends",
                type: "Analysis",
              },
              { time: "08:00 AM", activity: "System accuracy updated to 94.5%", type: "System" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition"
              >
                <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center">
                  <Activity className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.activity}</div>
                  <div className="text-xs text-muted-foreground">{item.type}</div>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">Notifications Panel</h3>
          <div className="space-y-2">
            {[
              {
                title: "High risk alert: John Smith",
                desc: "Attendance below 75% threshold",
                priority: "High",
              },
              {
                title: "Performance drop detected",
                desc: "3 students showing declining trends",
                priority: "Medium",
              },
              {
                title: "Report generated successfully",
                desc: "Monthly attendance report ready",
                priority: "Low",
              },
              {
                title: "New insight available",
                desc: "Department performance analysis",
                priority: "Low",
              },
            ].map((notification, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition ${notification.priority === "High" ? "bg-red-50 border-red-200" : ""}`}
              >
                <div
                  className={`size-10 rounded-lg ${notification.priority === "High" ? "bg-red-500" : notification.priority === "Medium" ? "bg-amber-500" : "bg-gradient-primary"} text-white grid place-items-center`}
                >
                  <AlertTriangle className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{notification.title}</div>
                  <div className="text-xs text-muted-foreground">{notification.desc}</div>
                </div>
                <Badge
                  tone={
                    notification.priority === "High"
                      ? "warn"
                      : notification.priority === "Medium"
                        ? "info"
                        : "success"
                  }
                >
                  {notification.priority}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Quick AI Actions</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: "Generate Risk Report", icon: FileText, color: "bg-gradient-primary" },
              { label: "Run Prediction Model", icon: Brain, color: "bg-gradient-violet" },
              { label: "Analyze Attendance", icon: Activity, color: "bg-gradient-cyan" },
              { label: "View Insights", icon: Target, color: "bg-gradient-primary" },
            ].map((action, index) => (
              <button
                key={index}
                className="p-4 rounded-xl border hover:bg-accent/50 transition flex items-center gap-3"
              >
                <div
                  className={`size-10 rounded-lg ${action.color} text-white grid place-items-center`}
                >
                  <action.icon className="size-4" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
