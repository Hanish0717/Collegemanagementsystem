import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
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
  Activity,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  GraduationCap,
  Users,
  Video,
} from "lucide-react";
import { Badge, Card, PageHeader, StatCard } from "@/components/dashboard/ui";
import {
  assignmentSubmissions,
  facultyActivities,
  facultyNotifications,
  facultyStats,
  studentPerformance,
  weeklyAttendance,
} from "@/mock/facultyData";

const statIcons = [BookOpen, Users, FileText, Calendar, GraduationCap, Bell, CheckCircle, Video];
const statGradients = [
  "bg-gradient-primary",
  "bg-gradient-violet",
  "bg-gradient-cyan",
  "bg-gradient-primary",
  "bg-gradient-violet",
  "bg-gradient-cyan",
  "bg-gradient-primary",
  "bg-gradient-violet",
];

export function FacultyDashboard() {
  const path = useRouterState({ select: (r) => r.location.pathname });

  if (path !== "/dashboard/faculty") {
    return <Outlet />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Dashboard"
        desc="Manage classes, attendance, assignments, marks and student performance."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {facultyStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <StatCard
              label={stat.label}
              value={stat.value}
              change={stat.change}
              icon={statIcons[i]}
              gradient={statGradients[i]}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Weekly Attendance</h3>
              <p className="text-xs text-muted-foreground">Daily attendance across all classes</p>
            </div>
            <Badge tone="success">89.2%</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={weeklyAttendance}>
                <defs>
                  <linearGradient id="faculty-present" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  stroke="#4F46E5"
                  fill="url(#faculty-present)"
                  strokeWidth={2}
                />
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
              { label: "Mark Attendance", tone: "default" as const },
              { label: "Upload Assignment", tone: "success" as const },
              { label: "Enter Marks", tone: "warn" as const },
              { label: "Start Online Class", tone: "info" as const },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-soft border hover:bg-accent/50 transition"
              >
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
              <h3 className="font-semibold">Assignment Submissions</h3>
              <p className="text-xs text-muted-foreground">Weekly submission analytics</p>
            </div>
            <Badge tone="info">This Month</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={assignmentSubmissions}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="week" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="submitted" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pending" fill="#06B6D4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="size-5 text-indigo" />
            <h3 className="font-semibold">Student Performance</h3>
          </div>
          <div className="space-y-3">
            {studentPerformance.slice(0, 4).map((student) => (
              <div key={student.student} className="p-3 rounded-xl bg-gradient-soft border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{student.student}</span>
                  <Badge
                    tone={student.marks >= 85 ? "success" : student.marks >= 75 ? "info" : "warn"}
                  >
                    {student.marks}%
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>Attendance: {student.attendance}%</span>
                </div>
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
            {facultyActivities.map((activity) => (
              <div
                key={activity.actor + activity.time}
                className="flex items-center gap-3 py-2 border-b last:border-0"
              >
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
            {facultyNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-3 rounded-xl border transition ${notification.unread ? "bg-blue-50 border-blue-200" : "hover:bg-accent/50"}`}
              >
                <div className="size-2 rounded-full bg-gradient-primary shrink-0 mt-1.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{notification.title}</div>
                  <div className="text-xs text-muted-foreground">{notification.time}</div>
                </div>
                <Badge
                  tone={
                    notification.type === "Alert"
                      ? "danger"
                      : notification.type === "Request"
                        ? "warn"
                        : "info"
                  }
                >
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
