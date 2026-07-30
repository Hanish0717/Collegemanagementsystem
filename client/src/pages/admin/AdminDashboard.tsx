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
  Award,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Heart,
  MessageSquare,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { Badge, Card, PageHeader, StatCard } from "@/components/dashboard/ui";
import api from "@/lib/api";
import { toast } from "sonner";

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

  // Executive Approvals & NAAC Metrics State (merged from Principal module)
  const [approvals, setApprovals] = useState([
    { id: "PR-801", title: "Institutional Budget Approval Q3", amount: "₹42.5 Lakhs", dept: "Finance & Accounts", date: "Jul 21" },
    { id: "PR-802", title: "Campus Expansion Building Blueprint", amount: "₹1.2 Crores", dept: "Infrastructure Committee", date: "Jul 20" },
    { id: "PR-803", title: "International Academic MOU (MIT)", amount: "N/A", dept: "Research & Collaborations", date: "Jul 19" },
  ]);

  const naacMetrics = [
    { criterion: "Curricular Aspects", score: 3.85, max: 4.0 },
    { criterion: "Teaching-Learning", score: 3.90, max: 4.0 },
    { criterion: "Research & Innovation", score: 3.72, max: 4.0 },
    { criterion: "Infrastructure", score: 3.95, max: 4.0 },
    { criterion: "Student Support", score: 3.88, max: 4.0 },
  ];

  const handleApprove = (id: string, title: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    toast.success(`Executive Seal Applied: Approved "${title}"`);
  };

  useEffect(() => {
    if (path !== "/dashboard/admin") return;

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

  if (path !== "/dashboard/admin") {
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
      {/* Executive Principal Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                OFFICE OF THE PRINCIPAL & EXECUTIVE BOARD
              </span>
              <span className="text-xs text-slate-300 font-mono">NAAC A++ Certified Institution</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <Award className="size-7 text-amber-400" /> Executive Boardroom & Institutional Governance
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Centralized institutional control, academic rankings, policy sanctioning & executive digital seal approvals.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.success("Presidential Circular dispatch wizard opened.")}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Send className="size-4" /> Issue Presidential Circular
            </button>
          </div>
        </div>
      </div>

      {/* Primary Telemetry & KPI Cards */}
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

      {/* NAAC Quality Criteria & Executive Digital Seal Approvals */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="size-5 text-amber-500" /> Executive Digital Seal Approvals
                </h3>
                <p className="text-xs text-slate-500">High-value sanctions requiring executive signature</p>
              </div>
              <Badge tone="warn">{approvals.length} Pending</Badge>
            </div>

            {approvals.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No pending executive sanctions.</div>
            ) : (
              <div className="space-y-3">
                {approvals.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                          {a.id}
                        </span>
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">{a.title}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Dept: {a.dept} • Amount: <strong className="text-slate-800 dark:text-slate-200">{a.amount}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toast.error("Sanction declined.")}
                        className="px-3 py-1.5 rounded-xl border text-rose-600 text-xs font-bold hover:bg-rose-50 cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleApprove(a.id, a.title)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer"
                      >
                        Apply Seal & Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* NAAC Quality Ratings */}
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="size-4 text-amber-500" /> NAAC Quality Criteria Ratings
          </h3>
          <div className="space-y-3">
            {naacMetrics.map((m) => (
              <div key={m.criterion} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{m.criterion}</span>
                  <span className="font-mono text-blue-600">
                    {m.score} / {m.max}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(m.score / m.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Analytics Charts & Department Metrics */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Student Analytics</h3>
              <p className="text-xs text-muted-foreground">Enrollment, attendance and fee collection trends</p>
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
                <Pie data={deptDistribution} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
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

      {/* Attendance Monitoring & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Attendance Monitoring</h3>
              <p className="text-xs text-muted-foreground">Daily attendance across all departments</p>
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
              { label: "Issue Presidential Circular", tone: "info" as const },
              { label: "Add New Student", tone: "default" as const },
              { label: "Mark Attendance Control", tone: "success" as const },
              { label: "Send Fee Reminders", tone: "warn" as const },
              { label: "Approve Event Request", tone: "info" as const },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => toast.success(`Action "${item.label}" triggered.`)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-soft border hover:bg-accent/50 transition cursor-pointer text-left"
              >
                <span className="text-sm font-medium">{item.label}</span>
                <Badge tone={item.tone}>Action</Badge>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activities & Notifications Panel */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Activities</h3>
            <Badge tone="info">Live</Badge>
          </div>
          <div className="space-y-3 max-h-[380px] overflow-y-auto">
            {activities.map((activity, idx) => (
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
                className={`flex items-start gap-3 p-3 rounded-xl border transition ${
                  notification.unread
                    ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50"
                    : "hover:bg-accent/50"
                }`}
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
