import { createFileRoute } from "@tanstack/react-router";
import { Bell, AlertTriangle, CheckCircle, Info, TrendingUp, Calendar, Filter, Check, X } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";



export function AiNotifications() {
  const notifications = [
    { id: 1, title: "High Risk Alert: James Wilson", desc: "Student attendance dropped to 65%, GPA declined to 2.1", type: "Risk", priority: "High", time: "10 min ago", read: false },
    { id: 2, title: "Performance Prediction Updated", desc: "New predictions generated for Computer Science department", type: "Prediction", priority: "Medium", time: "25 min ago", read: false },
    { id: 3, title: "Attendance Warning: John Smith", desc: "Student attendance below 75% threshold for 3 consecutive weeks", type: "Attendance", priority: "High", time: "1 hour ago", read: false },
    { id: 4, title: "Insight Generated", desc: "Academic excellence detected in Mathematics department", type: "Insight", priority: "Low", time: "2 hours ago", read: true },
    { id: 5, title: "Report Ready", desc: "Monthly attendance report has been generated successfully", type: "Report", priority: "Low", time: "3 hours ago", read: true },
    { id: 6, title: "Recommendation Available", desc: "New tutoring recommendations for at-risk students", type: "Recommendation", priority: "Medium", time: "4 hours ago", read: true },
    { id: 7, title: "Risk Analysis Complete", desc: "Weekly risk assessment completed for 245 students", type: "Analysis", priority: "Low", time: "5 hours ago", read: true },
    { id: 8, title: "Smart Reminder", desc: "Parent-teacher meeting scheduled for tomorrow", type: "Reminder", priority: "Medium", time: "6 hours ago", read: true },
  ];

  const summaryStats = [
    { label: "Total Notifications", value: "8", tone: "info" as const },
    { label: "Unread", value: "3", tone: "warn" as const },
    { label: "High Priority", value: "2", tone: "warn" as const },
    { label: "Today", value: "8", tone: "success" as const },
  ];

  const notificationTypes = [
    { type: "Risk", count: 2, icon: AlertTriangle, color: "bg-red-500" },
    { type: "Prediction", count: 1, icon: TrendingUp, color: "bg-gradient-primary" },
    { type: "Attendance", count: 1, icon: Calendar, color: "bg-amber-500" },
    { type: "Insight", count: 1, icon: Info, color: "bg-gradient-cyan" },
    { type: "Report", count: 1, icon: CheckCircle, color: "bg-green-500" },
    { type: "Recommendation", count: 1, icon: TrendingUp, color: "bg-gradient-violet" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Notifications"
        desc="Prediction alerts, risk notifications, and smart reminders from AI system."
        actions={
          <button className="px-4 py-2.5 rounded-xl bg-gradient-primary text-white text-sm glow-primary flex items-center gap-2">
            <Check className="size-4" /> Mark All as Read
          </button>
        }
      />

      <div className="grid md:grid-cols-4 gap-4">
        {summaryStats.map(stat => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">Current</Badge>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Notification Types</h3>
            <Badge tone="info">6 Types</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {notificationTypes.map((type, index) => (
              <div key={index} className="p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`size-8 rounded-lg ${type.color} text-white grid place-items-center`}>
                    <type.icon className="size-4" />
                  </div>
                  <span className="text-sm font-medium">{type.type}</span>
                </div>
                <div className="text-xs text-muted-foreground">{type.count} notifications</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="size-5 text-indigo" />
            <h3 className="font-semibold">Filter Notifications</h3>
          </div>
          <div className="space-y-4 p-4 border rounded-xl bg-gradient-soft">
            <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
              {["All Types", "Risk", "Prediction", "Attendance", "Insight", "Report", "Recommendation"].map(filter => <option key={filter}>{filter}</option>)}
            </select>
            <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
              {["All Priorities", "High", "Medium", "Low"].map(priority => <option key={priority}>{priority}</option>)}
            </select>
            <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
              {["All Status", "Unread", "Read"].map(status => <option key={status}>{status}</option>)}
            </select>
            <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-primary text-white text-sm font-medium">
              Apply Filters
            </button>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Notifications</h3>
          <Badge tone="info">8 Notifications</Badge>
        </div>
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-3 p-4 rounded-xl border hover:bg-accent/50 transition ${!notification.read ? "bg-blue-50 border-blue-200" : ""}`}
            >
              <div className={`size-10 rounded-lg ${
                notification.priority === "High" ? "bg-red-500" :
                notification.priority === "Medium" ? "bg-amber-500" :
                "bg-gradient-primary"
              } text-white grid place-items-center flex-shrink-0`}>
                {notification.type === "Risk" && <AlertTriangle className="size-4" />}
                {notification.type === "Prediction" && <TrendingUp className="size-4" />}
                {notification.type === "Attendance" && <Calendar className="size-4" />}
                {notification.type === "Insight" && <Info className="size-4" />}
                {notification.type === "Report" && <CheckCircle className="size-4" />}
                {notification.type === "Recommendation" && <TrendingUp className="size-4" />}
                {notification.type === "Analysis" && <Bell className="size-4" />}
                {notification.type === "Reminder" && <Bell className="size-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{notification.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge tone={notification.priority === "High" ? "warn" : notification.priority === "Medium" ? "info" : "success"}>{notification.priority}</Badge>
                    {!notification.read && <div className="size-2 rounded-full bg-primary" />}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-2">{notification.desc}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{notification.type}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{notification.time}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg hover:bg-accent transition" title="Mark as read">
                  <Check className="size-4 text-muted-foreground" />
                </button>
                <button className="p-2 rounded-lg hover:bg-accent transition" title="Dismiss">
                  <X className="size-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Notification Preferences</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Risk Alerts", desc: "Get notified for high-risk students", enabled: true },
            { label: "Prediction Updates", desc: "Receive new prediction notifications", enabled: true },
            { label: "Attendance Warnings", desc: "Alerts for attendance below threshold", enabled: true },
            { label: "Insight Notifications", desc: "New insights and recommendations", enabled: false },
            { label: "Report Ready", desc: "When reports are generated", enabled: true },
            { label: "Smart Reminders", desc: "AI-generated reminders and alerts", enabled: false },
          ].map((pref, index) => (
            <div key={index} className="p-4 rounded-xl border hover:bg-accent/50 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{pref.label}</span>
                <div className={`w-10 h-6 rounded-full ${pref.enabled ? "bg-primary" : "bg-muted"} relative cursor-pointer`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${pref.enabled ? "left-5" : "left-1"}`} />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{pref.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
