import { useState, useEffect } from "react";
import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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
  DollarSign,
  GraduationCap,
  Users,
  Zap,
} from "lucide-react";
import { Badge, Card, PageHeader, StatCard } from "@/components/dashboard/ui";
import api from "@/lib/api";

const statIcons = [Users, GraduationCap, BookOpen, CheckCircle, DollarSign, Clock, Calendar, Bell];
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

export function AdminDashboard() {
  const path = useRouterState({ select: (r) => r.location.pathname });

  const [stats, setStats] = useState<any[]>([]);
  const [studentAnalytics, setStudentAnalytics] = useState<any[]>([]);
  const [deptDistribution, setDeptDistribution] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (path !== "/admin") return;

    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/api/dashboard/stats");
        if (res.data?.success && res.data?.data) {
          const {
            stats: dbStats,
            departmentData,
            attendanceMonitoring: dbAttendance,
            studentAnalytics: dbAnalytics,
            activities: dbActivities,
            notifications: dbNotifications,
          } = res.data.data;

          setStats(dbStats || []);
          setStudentAnalytics(dbAnalytics || []);
          setDeptDistribution(departmentData || []);
          setAttendanceData(dbAttendance || []);
          setActivities(dbActivities || []);
          setNotifications(dbNotifications || []);
        }
      } catch (err) {
        console.error("Error loading admin dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [path]);

  if (path !== "/admin") {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        desc="Manage students, faculty, attendance, fees, events and institutional operations."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
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
              icon={statIcons[i % statIcons.length]}
              gradient={statGradients[i % statGradients.length]}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Student Analytics</h3>
              <p className="text-xs text-muted-foreground">
                Enrollment, attendance and fee collection trends
              </p>
            </div>
            <Badge tone="info">This Semester</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={studentAnalytics}>
                <defs>
                  <linearGradient id="admin-enrolled" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="admin-fees" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Area
                  type="monotone"
                  dataKey="enrolled"
                  name="Enrolled Students"
                  stroke="#4F46E5"
                  fill="url(#admin-enrolled)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="fees"
                  name="Fee Collection (₹)"
                  stroke="#06B6D4"
                  fill="url(#admin-fees)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Department Distribution</h3>
            <Badge>Live</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={deptDistribution}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {deptDistribution.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 max-h-[120px] overflow-y-auto">
            {deptDistribution.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="size-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-muted-foreground truncate max-w-[80px]">{d.name}</span>
                <span className="ml-auto font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Attendance Monitoring</h3>
              <p className="text-xs text-muted-foreground">
                Daily attendance across all departments
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="present" name="Present" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#06B6D4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Quick Actions</h3>
            <Zap className="size-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {[
              { label: "Add New Student", tone: "default" as const },
              { label: "Mark Attendance", tone: "success" as const },
              { label: "Send Fee Reminder", tone: "warn" as const },
              { label: "Approve Event", tone: "info" as const },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-soft border hover:bg-accent/50 transition cursor-pointer text-left"
              >
                <span className="text-sm font-medium">{item.label}</span>
                <Badge tone={item.tone}>Action</Badge>
              </button>
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
          <div className="space-y-3 max-h-[380px] overflow-y-auto">
            {activities.map((activity, idx) => (
              <div
                key={activity.actor + activity.time + idx}
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
          <div className="space-y-2 max-h-[380px] overflow-y-auto">
            {notifications.map((notification, idx) => (
              <div
                key={notification.id + idx}
                className={`flex items-start gap-3 p-3 rounded-xl border transition ${notification.unread ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50" : "hover:bg-accent/50"}`}
              >
                <div className="size-2 rounded-full bg-gradient-primary shrink-0 mt-1.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{notification.title}</div>
                  <div className="text-xs text-muted-foreground">{notification.time}</div>
                </div>
                <Badge
                  tone={
                    notification.type === "Warning"
                      ? "danger"
                      : notification.type === "Approval"
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
