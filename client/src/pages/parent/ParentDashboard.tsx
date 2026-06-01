import { useState, useEffect } from "react";
import { Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Bell,
  Calendar,
  DollarSign,
  GraduationCap,
  TrendingUp,
  User,
} from "lucide-react";
import { Badge, Card, PageHeader, StatCard } from "@/components/dashboard/ui";
import api from "@/lib/api";

const getIcon = (label: string) => {
  if (label.includes("Attendance")) return TrendingUp;
  if (label.includes("CGPA")) return GraduationCap;
  if (label.includes("Fees")) return DollarSign;
  if (label.includes("Leaves")) return Calendar;
  return GraduationCap;
};

const getGradient = (label: string) => {
  if (label.includes("Attendance")) return "bg-gradient-violet";
  if (label.includes("CGPA")) return "bg-gradient-primary";
  if (label.includes("Fees")) return "bg-gradient-cyan";
  if (label.includes("Leaves")) return "bg-gradient-violet";
  return "bg-gradient-primary";
};

export function ParentDashboard() {
  const path = useRouterState({ select: r => r.location.pathname });
  const navigate = useNavigate();

  const [stats, setStats] = useState<any[]>([]);
  const [childInfo, setChildInfo] = useState<any>(null);
  const [parentName, setParentName] = useState("Parent");
  const [activities, setActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [attendanceHistoryData, setAttendanceHistoryData] = useState<any[]>([]);
  const [marksPerformanceData, setMarksPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("cms_user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setParentName(u.fullName || u.name || "Parent");
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    if (path !== "/dashboard/parent" && path !== "/dashboard" && path !== "/dashboard/") return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/parent-module/student-data");
        if (res.data?.success && res.data?.data) {
          const dbData = res.data.data;
          // Store in localStorage for sub-pages to use
          localStorage.setItem("cms_parent_child_data", JSON.stringify(dbData));
          
          setChildInfo(dbData);
          setStats(dbData.stats || []);
          setActivities(dbData.activities || []);
          setNotifications(dbData.notifications || []);

          // Group results by semester
          if (dbData.results && dbData.results.length > 0) {
            const semGroup: Record<number, { total: number; count: number }> = {};
            dbData.results.forEach((r: any) => {
              const sem = r.semester || 1;
              if (!semGroup[sem]) {
                semGroup[sem] = { total: 0, count: 0 };
              }
              semGroup[sem].total += Number(r.marks || 0);
              semGroup[sem].count += 1;
            });
            const formattedMarks = Object.keys(semGroup).map(sem => {
              const sNum = Number(sem);
              return {
                semester: `Sem ${sNum}`,
                marks: Math.round(semGroup[sNum].total / semGroup[sNum].count)
              };
            }).sort((a, b) => a.semester.localeCompare(b.semester));
            setMarksPerformanceData(formattedMarks);
          }

          // Fetch attendance history for childId
          const childId = dbData.childId;
          if (childId) {
            const attRes = await api.get(`/api/attendance/student/${childId}`);
            if (attRes.data?.success && attRes.data?.data) {
              const { monthly } = attRes.data.data;
              if (monthly && monthly.length > 0) {
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const formatted = monthly.map((m: any) => {
                  const parts = m.month.split("-");
                  const year = Number(parts[0]);
                  const monthIdx = Number(parts[1]) - 1;
                  const date = new Date(year, monthIdx, 1);
                  return {
                    month: monthNames[date.getMonth()],
                    percentage: m.percentage
                  };
                }).reverse();
                setAttendanceHistoryData(formatted);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error loading parent dashboard child data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [path]);

  if (path !== "/dashboard/parent" && path !== "/dashboard" && path !== "/dashboard/") {
    return <Outlet />;
  }

  const attendancePctStr = stats.find(s => s.label.includes("Attendance"))?.value || "N/A";
  const cgpaValueStr = stats.find(s => s.label.includes("CGPA"))?.value || "N/A";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${parentName}`}
        desc={childInfo ? `Monitoring academic progress for your child: ${childInfo.childName} (${childInfo.rollNumber})` : "Monitoring academic progress for your child."}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [1, 2, 3, 4].map((n) => (
            <Card key={n} className="h-28 animate-pulse bg-muted/40">
              <div />
            </Card>
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
              <h3 className="font-semibold">Child Attendance</h3>
              <p className="text-xs text-muted-foreground">Monthly attendance percentage</p>
            </div>
            <Badge tone="success">{attendancePctStr}</Badge>
          </div>
          <div className="h-72">
            {loading ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-xl animate-pulse">
                Loading attendance history...
              </div>
            ) : attendanceHistoryData.length > 0 ? (
              <ResponsiveContainer>
                <AreaChart data={attendanceHistoryData}>
                  <defs>
                    <linearGradient id="parent-attendance" x1="0" x2="0" y1="0" y2="1">
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
                    dataKey="percentage"
                    stroke="#4F46E5"
                    fill="url(#parent-attendance)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-xl">
                No attendance history records found.
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
              { label: "View Attendance", tone: "info" as const, to: "/dashboard/parent/attendance" },
              { label: "Check Marks", tone: "success" as const, to: "/dashboard/parent/marks" },
              { label: "Pay Fees", tone: "warn" as const, to: "/dashboard/parent/fees" },
              { label: "Contact Teacher", tone: "info" as const, to: "/dashboard/parent/communication" },
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
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Marks Performance</h3>
              <p className="text-xs text-muted-foreground">Semester-wise marks average</p>
            </div>
            <Badge tone="success">
              {marksPerformanceData.length > 0
                ? `${Math.round(marksPerformanceData.reduce((acc, curr) => acc + curr.marks, 0) / marksPerformanceData.length)}%`
                : "N/A"}
            </Badge>
          </div>
          <div className="h-72">
            {loading ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-xl animate-pulse">
                Loading marks performance...
              </div>
            ) : marksPerformanceData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={marksPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="semester" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                  <Bar dataKey="marks" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground border border-dashed rounded-xl">
                No marks performance records found.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <User className="size-5 text-indigo" />
            <h3 className="font-semibold">Child Overview</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Name", value: childInfo?.childName || "Loading..." },
              { label: "Roll Number", value: childInfo?.rollNumber || "Loading..." },
              { label: "Current Semester", value: childInfo ? `Sem ${childInfo.semester}` : "Loading..." },
              { label: "Overall GPA", value: cgpaValueStr },
              { label: "Attendance", value: attendancePctStr },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="font-bold text-xs max-w-[150px] truncate text-right">{item.value}</span>
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
            {loading ? (
              <div className="text-center py-8 text-xs text-muted-foreground animate-pulse">
                Loading activities...
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity, idx) => (
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
                        : notification.type === "Exam"
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

