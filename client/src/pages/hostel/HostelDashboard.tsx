import { useEffect } from "react";
import { Outlet, useRouterState, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  Bed,
  DollarSign,
  Users,
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Home,
  Utensils,
  UserCheck,
  Loader2
} from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/dashboard/ui";
import { supabase } from "@/lib/supabaseClient";
import { fetchStats, fetchDashboardCharts, fetchSystemNotifications } from "@/services/hostelService";

export function HostelDashboard() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const queryClient = useQueryClient();

  if (path !== "/dashboard/hostel") {
    return <Outlet />;
  }

  // Live Queries
  const { data: statsList = [], isLoading: isStatsLoading } = useQuery({
    queryKey: ["hostel-stats"],
    queryFn: fetchStats,
    staleTime: 0,
  });

  const { data: chartData, isLoading: isChartsLoading } = useQuery({
    queryKey: ["hostel-dashboard-charts"],
    queryFn: fetchDashboardCharts,
    staleTime: 0,
  });

  const { data: notifications = [], isLoading: isNotificationsLoading } = useQuery({
    queryKey: ["system-notifications"],
    queryFn: fetchSystemNotifications,
    staleTime: 0,
  });

  useEffect(() => {
    const invalidateHostelDashboard = () => {
      queryClient.invalidateQueries({ queryKey: ["hostel-stats"] });
      queryClient.invalidateQueries({ queryKey: ["hostel-dashboard-charts"] });
      queryClient.invalidateQueries({ queryKey: ["system-notifications"] });
    };

    const roomChannel = supabase
      .channel("hostel-room-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "hostel_rooms" }, invalidateHostelDashboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "hostel_allocations" }, invalidateHostelDashboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "hostel_fees" }, invalidateHostelDashboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "hostel_complaints" }, invalidateHostelDashboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_logs" }, invalidateHostelDashboard)
      .on("postgres_changes", { event: "*", schema: "public", table: "system_notifications" }, invalidateHostelDashboard)
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [queryClient]);

  const COLORS = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B"];

  const roomOccupancyData = chartData?.roomOccupancyData || [];
  const complaintStatusData = chartData?.complaintStatusData || [];
  const feeCollectionData = chartData?.feeCollectionData || [];
  const hostelActivities = chartData?.hostelActivities || [];

  if (isStatsLoading || isChartsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="size-8 text-primary animate-spin" />
        <span className="text-sm text-muted-foreground">Loading Warden Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel Management"
        desc="Manage hostel rooms, occupancy, fees, complaints, mess, and visitors."
      />

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {statsList.map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
            <div className="text-2xl font-bold mt-2">{stat.value}</div>
            <Badge tone={stat.tone} className="mt-3">
              Current
            </Badge>
          </Card>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4 text-sm">Room Occupancy Analytics</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={roomOccupancyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="occupied" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                <Bar dataKey="available" fill="#06B6D4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="size-5 text-amber-600" />
            <h3 className="font-semibold text-sm">Complaint Status</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={complaintStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {complaintStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {complaintStatusData.map((item, index) => (
              <div key={item.status} className="flex items-center gap-2 text-xs">
                <div
                  className="size-2 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-muted-foreground">{item.status}: {item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Fee Trends */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="size-5 text-indigo" />
            <h3 className="font-semibold text-sm">Fee Collection Trend</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={feeCollectionData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="collected" fill="#10B981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pending" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="size-5 text-indigo" />
            <h3 className="font-semibold text-sm">Recent Activities</h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {hostelActivities.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition animate-in fade-in duration-200"
              >
                <div className="size-10 rounded-lg bg-gradient-primary text-white grid place-items-center text-xs font-semibold shrink-0">
                  {activity.type ? activity.type[0] : "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">
                    <span className="font-semibold">{activity.actor}</span> {activity.action}{" "}
                    <span className="font-semibold text-indigo-600">{activity.target}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              </div>
            ))}
            {hostelActivities.length === 0 && (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No recent activity logs
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Notifications Tray */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="size-5 text-indigo" />
            <h3 className="font-semibold text-sm">Notifications</h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.slice(0, 4).map((notification) => (
              <div
                key={notification.id}
                className={`flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/50 transition cursor-pointer ${notification.unread ? "bg-indigo-50/50 border-indigo-200 dark:bg-indigo-950/20" : ""}`}
              >
                <div className="size-10 rounded-lg bg-gradient-cyan text-white grid place-items-center shrink-0">
                  <Bell className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{notification.title}</span>
                    {notification.unread && <div className="size-2 rounded-full bg-primary" />}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {notification.type} • {notification.time || "Just now"}
                  </div>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No new notifications
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions Router Links */}
        <Card>
          <h3 className="font-semibold mb-4 text-sm">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Bed, label: "Room Allocation", color: "bg-gradient-primary", to: "/dashboard/hostel/rooms" },
              { icon: Users, label: "Student List", color: "bg-gradient-violet", to: "/dashboard/hostel/students" },
              { icon: DollarSign, label: "Fee Collection", color: "bg-gradient-cyan", to: "/dashboard/hostel/fees" },
              { icon: Utensils, label: "Mess Menu", color: "bg-gradient-primary", to: "/dashboard/hostel/mess" },
              { icon: UserCheck, label: "Visitor Log", color: "bg-gradient-violet", to: "/dashboard/hostel/visitors" },
              { icon: AlertTriangle, label: "Complaints", color: "bg-gradient-cyan", to: "/dashboard/hostel/complaints" },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="p-4 rounded-xl bg-gradient-soft border hover:bg-accent/50 transition flex flex-col items-center gap-2 text-center"
              >
                <div
                  className={`size-10 rounded-lg ${action.color} text-white grid place-items-center`}
                >
                  <action.icon className="size-5" />
                </div>
                <span className="text-xs font-semibold">{action.label}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
