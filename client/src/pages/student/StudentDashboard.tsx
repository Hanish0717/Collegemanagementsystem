import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import {
  Activity, Bell, BookOpen, Calendar, CheckCircle, Clock, DollarSign,
  GraduationCap, MapPin, TrendingUp
} from "lucide-react";
import { Badge, Card, PageHeader, StatCard } from "@/components/dashboard/ui";
import {
  attendanceHistory, gpaHistory, studentActivities, studentNotifications, studentStats
} from "@/mock/studentData";



const statIcons = [GraduationCap, TrendingUp, BookOpen, Calendar, DollarSign, CheckCircle, MapPin, Activity];
const statGradients = [
  "bg-gradient-primary", "bg-gradient-violet", "bg-gradient-cyan", "bg-gradient-primary",
  "bg-gradient-violet", "bg-gradient-cyan", "bg-gradient-primary", "bg-gradient-violet",
];

export function StudentDashboard() {
  const path = useRouterState({ select: r => r.location.pathname });

  if (path !== "/dashboard/student") {
    return <Outlet />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Dashboard"
        desc="Track attendance, view results, submit assignments, and manage academic activities."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {studentStats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <StatCard label={stat.label} value={stat.value} change={stat.change} icon={statIcons[i]} gradient={statGradients[i]} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Attendance History</h3>
              <p className="text-xs text-muted-foreground">Monthly attendance percentage</p>
            </div>
            <Badge tone="success">87.3%</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={attendanceHistory}>
                <defs>
                  <linearGradient id="student-attendance" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Area type="monotone" dataKey="percentage" stroke="#4F46E5" fill="url(#student-attendance)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Quick Actions</h3>
            <Activity className="size-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {[
              { label: "View Timetable", tone: "info" as const },
              { label: "Submit Assignment", tone: "success" as const },
              { label: "Pay Fees", tone: "warn" as const },
              { label: "Register Event", tone: "info" as const },
            ].map(item => (
              <button key={item.label} className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-soft border hover:bg-accent/50 transition">
                <span className="text-sm font-medium">{item.label}</span>
                <Badge tone={item.tone}>Action</Badge>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">GPA Progress</h3>
              <p className="text-xs text-muted-foreground">Semester-wise GPA tracking</p>
            </div>
            <Badge tone="success">3.7</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={gpaHistory}>
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
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="size-5 text-indigo" />
            <h3 className="font-semibold">Academic Summary</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Current Semester", value: "Sem 5" },
              { label: "Total Credits", value: "140" },
              { label: "CGPA", value: "3.6" },
              { label: "Rank", value: "12/45" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Activities</h3>
            <Badge tone="info">Live</Badge>
          </div>
          <div className="space-y-3">
            {studentActivities.map(activity => (
              <div key={activity.actor + activity.time} className="flex items-center gap-3 py-2 border-b last:border-0">
                <div className="size-9 rounded-full bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                  {activity.actor.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 text-sm">
                  <span className="font-medium">{activity.actor}</span>{" "}
                  <span className="text-muted-foreground">{activity.action}</span>{" "}
                  <span className="font-medium">{activity.target}</span>
                  <div className="text-xs text-muted-foreground mt-0.5">{activity.time}</div>
                </div>
                <Badge>{activity.type}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Notifications Panel</h3>
            <Bell className="size-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            {studentNotifications.map(notification => (
              <div key={notification.id} className={`flex items-start gap-3 p-3 rounded-xl border transition ${notification.unread ? "bg-blue-50 border-blue-200" : "hover:bg-accent/50"}`}>
                <div className="size-2 rounded-full bg-gradient-primary shrink-0 mt-1.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{notification.title}</div>
                  <div className="text-xs text-muted-foreground">{notification.time}</div>
                </div>
                <Badge tone={notification.type === "Alert" ? "danger" : notification.type === "Assignment" ? "warn" : "info"}>
                  {notification.type}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
