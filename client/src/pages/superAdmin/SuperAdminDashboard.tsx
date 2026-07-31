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
  Building2,
  CheckCircle,
  Clock,
  Database,
  GraduationCap,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { Badge, Card, PageHeader, StatCard } from "@/components/dashboard/ui";
import { useSuperAdminStats } from "@/hooks/useSuperAdminStats";
import { Skeleton } from "@/components/ui/skeleton";

const statsConfig = [
  {
    label: "Total Colleges/Departments",
    fallback: "18",
    change: "+2.4%",
    icon: Building2,
    gradient: "bg-gradient-primary",
  },
  {
    label: "Total Students",
    fallback: "0",
    icon: Users,
    gradient: "bg-gradient-violet",
  },
  {
    label: "Total Faculty",
    fallback: "0",
    icon: GraduationCap,
    gradient: "bg-gradient-cyan",
  },
  {
    label: "Total Admins",
    fallback: "0",
    icon: ShieldCheck,
    gradient: "bg-gradient-primary",
  },
  {
    label: "Active Users",
    fallback: "0",
    icon: Activity,
    gradient: "bg-gradient-violet",
  },
  {
    label: "Service Uptime",
    fallback: "99.9%",
    change: "+0.01%",
    icon: CheckCircle,
    gradient: "bg-gradient-cyan",
  },
  {
    label: "Database Latency",
    fallback: "12 ms",
    icon: Database,
    gradient: "bg-gradient-primary",
  },
  {
    label: "Pending Approvals",
    fallback: "0",
    icon: Clock,
    gradient: "bg-gradient-violet",
  },
];

export function SuperAdminDashboard() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { data: liveStats, isLoading } = useSuperAdminStats();

  const analyticsData = liveStats?.systemAnalytics || [];
  const deptDistData = liveStats?.departmentDistribution || [];
  const userActData = liveStats?.userActivityData || [];
  const actLogs = liveStats?.superAdminActivities || [];
  const notifyLogs = liveStats?.superAdminNotifications || [];

  if (path !== "/super-admin") {
    return <Outlet />;
  }

  const getStatValue = (label: string, fallback: string) => {
    const isLiveKey = [
      "Total Colleges/Departments",
      "Total Students",
      "Total Faculty",
      "Total Admins",
      "Active Users",
      "Pending Approvals",
      "Service Uptime",
      "Database Latency",
    ].includes(label);

    if (isLiveKey && isLoading) {
      return <Skeleton className="h-7 w-20 animate-pulse bg-muted-foreground/10" />;
    }
    if (!liveStats) return fallback;

    switch (label) {
      case "Total Colleges/Departments":
        return liveStats.totalDepartments.toLocaleString("en-IN");
      case "Total Students":
        return liveStats.totalStudents.toLocaleString("en-IN");
      case "Total Faculty":
        return liveStats.totalFaculty.toLocaleString("en-IN");
      case "Total Admins":
        return liveStats.totalAdmins.toLocaleString("en-IN");
      case "Active Users":
        return liveStats.activeUsers.toLocaleString("en-IN");
      case "Pending Approvals":
        return liveStats.pendingApprovals.toLocaleString("en-IN");
      case "Service Uptime":
        return liveStats.serviceUptime || fallback;
      case "Database Latency":
        return liveStats.dbLatency || fallback;
      default:
        return fallback;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Dashboard"
        desc="Centralized institutional administration, analytics, system status and governance controls."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <StatCard
              label={stat.label}
              value={getStatValue(stat.label, stat.fallback)}
              change={stat.change}
              icon={stat.icon}
              gradient={stat.gradient}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">System Analytics</h3>
              <p className="text-xs text-muted-foreground">
                Active users and support tickets across the institution
              </p>
            </div>
            <Badge tone="info">System Load</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="super-users" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="super-tickets" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#4F46E5"
                  fill="url(#super-users)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="tickets"
                  stroke="#EF4444"
                  fill="url(#super-tickets)"
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
                  data={deptDistData}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {deptDistData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {deptDistData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="size-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
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
              <h3 className="font-semibold">User Activity</h3>
              <p className="text-xs text-muted-foreground">Daily logins and campus ERP actions</p>
            </div>
            <Badge tone="success">+11.3%</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={userActData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="logins" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                <Bar dataKey="actions" fill="#06B6D4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">System Status</h3>
            <Database className="size-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {(liveStats?.systemStatus || [
              { label: "Application Server", value: "Operational", tone: "success" as const },
              { label: "Database Cluster", value: "Operational", tone: "success" as const },
              { label: "Email Gateway", value: "Monitoring", tone: "warn" as const },
              { label: "Backup Service", value: "Synced", tone: "info" as const },
            ]).map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border"
              >
                <div className="text-sm font-medium">{item.label}</div>
                <Badge tone={item.tone as any}>{item.value}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Activity Logs</h3>
            <Badge tone="info">Live</Badge>
          </div>
          <div className="space-y-3">
            {actLogs.map((activity) => (
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
            {notifyLogs.map((notification) => (
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
                    notification.type === "Security"
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
