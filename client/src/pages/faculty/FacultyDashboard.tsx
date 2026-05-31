import { useState, useEffect } from "react";
import { Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
  FileText,
  GraduationCap,
  Users,
} from "lucide-react";
import { Badge, Card, PageHeader, StatCard } from "@/components/dashboard/ui";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

const getIcon = (label: string) => {
  switch (label) {
    case "Students Under Mentorship": return Users;
    case "Study Materials Shared": return BookOpen;
    case "Pending Leave Requests": return Calendar;
    default: return GraduationCap;
  }
};

const getGradient = (label: string) => {
  switch (label) {
    case "Students Under Mentorship": return "bg-gradient-primary";
    case "Study Materials Shared": return "bg-gradient-cyan";
    case "Pending Leave Requests": return "bg-gradient-violet";
    default: return "bg-gradient-primary";
  }
};

export function FacultyDashboard() {
  const path = useRouterState({ select: r => r.location.pathname });
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [weeklyAttendanceData, setWeeklyAttendanceData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (path !== "/dashboard/faculty") return;
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const dashboardRes = await api.get("/api/faculty-module/dashboard");
        if (dashboardRes.data?.success && dashboardRes.data?.data) {
          const { stats: dbStats, activities: dbActivities, notifications: dbNotifs, weeklyAttendance: dbAtt, profile } = dashboardRes.data.data;
          setStats(dbStats || []);
          setActivities(dbActivities || []);
          setNotifications(dbNotifs || []);
          setWeeklyAttendanceData(dbAtt || []);
          if (profile) {
            localStorage.setItem("cms_faculty_profile", JSON.stringify(profile));
          }
        }

        // Fetch student performance
        const performanceRes = await api.get("/api/faculty-module/performance");
        if (performanceRes.data?.success && performanceRes.data?.data) {
          // Map backend performance field names to frontend expected names
          const mappedPerformance = performanceRes.data.data.map((p: any) => ({
            student: p.student,
            attendance: p.attendance,
            marks: p.overall
          }));
          setPerformanceData(mappedPerformance);
        }
      } catch (err) {
        console.error("Error loading faculty dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [path]);

  if (path !== "/dashboard/faculty") {
    return <Outlet />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.fullName || "Faculty"}`}
        desc="Manage classes, attendance, marks and student performance."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [1, 2, 3, 4].map((n) => (
            <Card key={n} className="h-28 animate-pulse bg-muted/40"><div /></Card>
          ))
        ) : stats.length > 0 ? (
          stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <StatCard label={stat.label} value={stat.value} change={stat.change} icon={getIcon(stat.label)} gradient={getGradient(stat.label)} />
            </motion.div>
          ))
        ) : (
          <div className="col-span-4 text-center py-8 text-sm text-muted-foreground border border-dashed rounded-xl">
            No statistics available.
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Weekly Attendance</h3>
              <p className="text-xs text-muted-foreground">Daily attendance across all classes</p>
            </div>
            <Badge tone="success">
              {weeklyAttendanceData.length > 0
                ? `${Math.round(weeklyAttendanceData.reduce((acc, curr) => acc + curr.percentage, 0) / weeklyAttendanceData.length)}%`
                : "N/A"}
            </Badge>
          </div>
          <div className="h-72">
            {loading ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-xl animate-pulse">
                Loading weekly attendance trend...
              </div>
            ) : weeklyAttendanceData.length > 0 ? (
              <ResponsiveContainer>
                <AreaChart data={weeklyAttendanceData}>
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
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-xl">
                No attendance records recorded yet.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Quick Actions</h3>
            <Activity className="size-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {[
              { label: "Mark Attendance", tone: "default" as const, to: "/dashboard/faculty/attendance" },
              { label: "Enter Marks", tone: "warn" as const, to: "/dashboard/faculty/marks" },
              { label: "Start Online Class", tone: "info" as const, to: "/dashboard/faculty/classes" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => navigate({ to: item.to })}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-soft border hover:bg-accent/50 transition cursor-pointer text-left font-medium"
              >
                <span className="text-sm">{item.label}</span>
                <Badge tone={item.tone}>Action</Badge>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="size-5 text-indigo" />
            <h3 className="font-semibold">Student Performance</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              [1, 2, 3, 4].map((n) => (
                <div key={n} className="h-16 animate-pulse bg-muted/40 border rounded-xl" />
              ))
            ) : performanceData.length > 0 ? (
              performanceData.slice(0, 4).map((student) => (
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
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-xs text-muted-foreground border border-dashed rounded-xl">
                No student performance data.
              </div>
            )}
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
            {loading ? (
              <div className="text-center py-8 text-xs text-muted-foreground animate-pulse">
                Loading activities...
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity, idx) => (
                <div key={activity.actor + activity.time + idx} className="flex items-center gap-3 py-2 border-b last:border-0">
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
              ))
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-xl">
                No recent activities found.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Notifications Panel</h3>
            <Bell className="size-4 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8 text-xs text-muted-foreground animate-pulse">
                Loading notifications...
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition ${notification.unread ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50" : "hover:bg-accent/50"}`}
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
              ))
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-xl">
                You are all caught up! No notifications.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

