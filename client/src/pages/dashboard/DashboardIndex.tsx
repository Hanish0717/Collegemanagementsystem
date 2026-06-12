import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Wallet,
  Bus,
  Compass,
  Activity,
  BookOpen,
  Clock,
  AlertTriangle,
  Home,
  Bed,
} from "lucide-react";
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
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { supabase } from "@/lib/supabaseClient";
import { fetchDashboardData, type DashboardStats } from "@/services/dashboardService";
import { getActiveRole } from "@/lib/roles";
import { getStoredUser } from "@/services/authService";
import { fetchStats as fetchWardenStats, fetchDashboardCharts as fetchWardenCharts } from "@/services/hostelService";
import { fetchTransportData } from "@/services/transportService";
import { ParentDashboard } from "@/pages/parent/ParentDashboard";
import { StudentDashboard } from "@/pages/student/StudentDashboard";
import { FacultyDashboard } from "@/pages/faculty/FacultyDashboard";

const statIcons: Record<string, any> = {
  "Total Students": Users,
  "Total Faculty": GraduationCap,
  "Active Departments": BookOpen,
  "Attendance Percentage": Activity,
  "Fee Collection": Wallet,
  "Pending Approvals": CalendarCheck,
  "Upcoming Events": Clock,
  "Low Attendance Warning": AlertTriangle,
};

const statGradients: Record<string, string> = {
  "Total Students": "bg-gradient-primary",
  "Total Faculty": "bg-gradient-violet",
  "Active Departments": "bg-gradient-cyan",
  "Attendance Percentage": "bg-gradient-primary",
  "Fee Collection": "bg-gradient-violet",
  "Pending Approvals": "bg-gradient-cyan",
  "Upcoming Events": "bg-gradient-primary",
  "Low Attendance Warning": "bg-gradient-violet",
};

const wardenStatIcons: Record<string, any> = {
  "Hostel Students": Users,
  "Total Rooms": Home,
  "Occupied Rooms": Bed,
  "Available Rooms": Bed,
  "Pending Complaints": AlertTriangle,
  "Fee Collection": Wallet,
  "Pending Fees": Wallet,
  "Visitors Today": Users,
};

const wardenStatGradients: Record<string, string> = {
  "Hostel Students": "bg-gradient-primary",
  "Total Rooms": "bg-gradient-violet",
  "Occupied Rooms": "bg-gradient-cyan",
  "Available Rooms": "bg-gradient-primary",
  "Pending Complaints": "bg-gradient-violet",
  "Fee Collection": "bg-gradient-cyan",
  "Pending Fees": "bg-gradient-primary",
  "Visitors Today": "bg-gradient-violet",
};

export function DashboardIndex() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Warden specific live states
  const [wardenStats, setWardenStats] = useState<any[]>([]);
  const [wardenCharts, setWardenCharts] = useState<any>(null);

  // Transport live states
  const [buses, setBuses] = useState<any[]>([]);

  const activeRole = getActiveRole();
  const isWarden = activeRole.id === "warden";
  const user = getStoredUser();
  const userName = user?.fullName || "Dr. Mehra";

  const loadDashboardData = async () => {
    try {
      const currentRole = getActiveRole();
      if (currentRole.id === "warden") {
        const [statsRes, chartsRes] = await Promise.all([
          fetchWardenStats(),
          fetchWardenCharts(),
        ]);
        setWardenStats(statsRes);
        setWardenCharts(chartsRes);
      } else {
        const [res, transportRes] = await Promise.all([
          fetchDashboardData(),
          fetchTransportData().catch(() => ({ buses: [] })),
        ]);
        setData(res);
        setBuses(transportRes?.buses || []);
      }
    } catch (err) {
      console.warn("Failed to load live dashboard stats, using fallback mock data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const currentRole = getActiveRole();
    const isCurrentWarden = currentRole.id === "warden";

    const channel = supabase.channel("dashboard-realtime-changes");

    if (isCurrentWarden) {
      channel
        .on("postgres_changes", { event: "*", schema: "public", table: "hostel_rooms" }, () => loadDashboardData())
        .on("postgres_changes", { event: "*", schema: "public", table: "hostel_allocations" }, () => loadDashboardData())
        .on("postgres_changes", { event: "*", schema: "public", table: "hostel_fees" }, () => loadDashboardData())
        .on("postgres_changes", { event: "*", schema: "public", table: "hostel_complaints" }, () => loadDashboardData())
        .on("postgres_changes", { event: "*", schema: "public", table: "activity_logs" }, () => loadDashboardData());
    } else {
      channel.on("postgres_changes", { event: "*", schema: "public", table: "fees" }, () => loadDashboardData());
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (activeRole.id === "parent") {
    return <ParentDashboard />;
  }
  if (activeRole.id === "student") {
    return <StudentDashboard />;
  }
  if (activeRole.id === "faculty") {
    return <FacultyDashboard />;
  }

  // Extraction of real-time data or fallback mocks
  const stats = data?.stats || [];
  const departmentData = data?.departmentData || [];
  const attendanceData = (data as any)?.attendanceMonitoring || [];
  const studentAnalytics = (data as any)?.studentAnalytics || [];
  const activities = (data as any)?.activities || [];

  // Determine stats list to render
  const statsToRender = isWarden
    ? wardenStats.filter(s =>
        ["Hostel Students", "Total Rooms", "Occupied Rooms", "Available Rooms", "Pending Complaints", "Fee Collection", "Pending Fees", "Visitors Today"].includes(s.label)
      )
    : stats;

  const getIcon = (label: string, index: number) => {
    if (isWarden) {
      return wardenStatIcons[label] || Users;
    }
    return statIcons[label] || (index === 0 ? Users : index === 1 ? GraduationCap : index === 2 ? CalendarCheck : Wallet);
  };

  const getGradient = (label: string, index: number) => {
    if (isWarden) {
      return wardenStatGradients[label] || "bg-gradient-primary";
    }
    return statGradients[label] || (index === 0 ? "bg-gradient-primary" : index === 1 ? "bg-gradient-violet" : index === 2 ? "bg-gradient-cyan" : "bg-gradient-primary");
  };

  // Map live transport data
  const busList = buses.length > 0 ? buses.map(b => ({
    bus: b.bus?.number || b.id || "TS-09-UB-1004",
    route: b.route || b.coverage || "Custom Route",
    driver: b.driver || "To Be Assigned",
    capacity: b.bus?.capacity || 50,
    passengers: b.students || 0,
    status: b.status === "On Route" || b.status === "Active" ? "Active" : "Standby"
  })) : [
    { bus: "TS-09-UB-1001", route: "Rajam → Vizianagaram", driver: "Satish Kumar", capacity: 50, passengers: 18, status: "Active" },
    { bus: "TS-09-UB-1002", route: "Rajam → Palakonda", driver: "Mohammad Rafiq", capacity: 60, passengers: 14, status: "Active" },
    { bus: "TS-09-UB-1003", route: "Rajam → Srikakulam", driver: "Ramesh Yadav", capacity: 40, passengers: 16, status: "Active" },
    { bus: "TS-09-UB-1004", route: "Custom Route", driver: "To Be Assigned", capacity: 50, passengers: 0, status: "Standby" },
  ];

  const colors = ["indigo", "cyan", "violet"];
  const routeFares = buses.length > 0 ? buses.map((b, idx) => {
    let fare = 1500;
    let dist = "22 km";
    const routeText = (b.route || b.coverage || "").toLowerCase();
    if (routeText.includes("vizianagaram")) {
      fare = 2200;
      dist = "52 km";
    } else if (routeText.includes("srikakulam")) {
      fare = 1800;
      dist = "55 km";
    } else if (routeText.includes("palakonda")) {
      fare = 1500;
      dist = "22 km";
    } else if (routeText.includes("kphb") || routeText.includes("kukatpally")) {
      fare = 1500;
      dist = "18 km";
    } else if (routeText.includes("gachibowli")) {
      fare = 1800;
      dist = "22 km";
    } else if (routeText.includes("secunderabad")) {
      fare = 2000;
      dist = "28 km";
    } else {
      fare = 1800;
      dist = "30 km";
    }
    return {
      route: `Route ${idx + 1}`,
      coverage: b.route || b.coverage,
      dist,
      fare,
      passengers: b.students || 0,
      color: colors[idx % colors.length]
    };
  }) : [
    { route: "Route 1", coverage: "Rajam → Vizianagaram", dist: "52 km", fare: 2200, passengers: 18, color: "indigo" },
    { route: "Route 2", coverage: "Rajam → Palakonda", dist: "22 km", fare: 1500, passengers: 14, color: "cyan" },
    { route: "Route 3", coverage: "Rajam → Srikakulam", dist: "55 km", fare: 1800, passengers: 16, color: "violet" },
  ];

  const totalFaresCollection = routeFares.reduce((sum, r) => sum + r.fare * r.passengers, 0);
  const totalPassengers = routeFares.reduce((sum, r) => sum + r.passengers, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${userName} 👋`}
        desc={
          loading
            ? "Synchronizing live campus database..."
            : isWarden
              ? "Here's what's happening across your hostels today (Live Database Connected)."
              : "Here's what's happening across your campus today (Live Database Connected)."
        }
      />

      {/* Grid for Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsToRender.map((s, i) => {
          const Icon = getIcon(s.label, i);
          const gradient = getGradient(s.label, i);
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <StatCard
                label={s.label}
                value={s.value}
                change={s.change || "+0%"}
                icon={Icon}
                gradient={gradient}
              />
            </motion.div>
          );
        })}
      </div>

      {/* College Analytics Charts */}
      {(!loading || departmentData.length > 0 || isWarden) && (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Student Analytics Area Chart / Room Occupancy Chart */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">
                  {isWarden ? "Room Occupancy Trends" : "Student Analytics"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isWarden ? "Occupied and available beds overview" : "Enrollment and fee collection trends"}
                </p>
              </div>
              <Badge tone="info">{isWarden ? "Live Beds" : "This Semester"}</Badge>
            </div>
            <div className="h-72">
              <ResponsiveContainer>
                {isWarden ? (
                  <AreaChart data={wardenCharts?.roomOccupancyData || []}>
                    <defs>
                      <linearGradient id="warden-occupied" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.55} />
                        <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="warden-available" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                    <Area
                      type="monotone"
                      dataKey="occupied"
                      name="Occupied Beds"
                      stroke="#4F46E5"
                      fill="url(#warden-occupied)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="available"
                      name="Available Beds"
                      stroke="#10B981"
                      fill="url(#warden-available)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                ) : (
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
                )}
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Department Distribution Pie Chart / Complaint Distribution */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                {isWarden ? "Complaint Distribution" : "Department Distribution"}
              </h3>
              <Badge>{isWarden ? "Tickets" : "Live"}</Badge>
            </div>
            <div className="h-56">
              <ResponsiveContainer>
                {isWarden ? (
                  <PieChart>
                    <Pie
                      data={wardenCharts?.complaintStatusData || []}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {(wardenCharts?.complaintStatusData || []).map((d: any, i: number) => {
                        const colors = ["#10B981", "#F59E0B", "#EF4444", "#6366F1"];
                        return <Cell key={i} fill={colors[i % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={departmentData}
                      dataKey="value"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {departmentData.map((d: any, i: number) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 max-h-[120px] overflow-y-auto">
              {isWarden
                ? (wardenCharts?.complaintStatusData || []).map((d: any, i: number) => {
                    const colors = ["#10B981", "#F59E0B", "#EF4444", "#6366F1"];
                    return (
                      <div key={d.status} className="flex items-center gap-2 text-xs">
                        <span className="size-2.5 rounded-full" style={{ background: colors[i % colors.length] }} />
                        <span className="text-muted-foreground truncate max-w-[80px]">{d.status}</span>
                        <span className="ml-auto font-medium">{d.count}</span>
                      </div>
                    );
                  })
                : departmentData.map((d: any) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <span className="size-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-muted-foreground truncate max-w-[80px]">{d.name}</span>
                      <span className="ml-auto font-medium">{d.value}</span>
                    </div>
                  ))}
            </div>
          </Card>
        </div>
      )}

      {/* Attendance Trends & Recent Campus Activities / Fee Collection Trends & Recent Hostel Activities */}
      {(!loading || attendanceData.length > 0 || isWarden) && (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Attendance Trends / Fee Collection Trends Bar Chart */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">
                  {isWarden ? "Hostel Fee Collection Trends" : "Attendance Trends"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isWarden ? "Monthly fee collected vs pending status" : "Daily attendance status across departments"}
                </p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer>
                {isWarden ? (
                  <BarChart data={wardenCharts?.feeCollectionData || []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                    <Bar dataKey="collected" name="Collected (₹)" fill="#10B981" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="pending" name="Pending (₹)" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                  </BarChart>
                ) : (
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                    <Bar dataKey="present" name="Present" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="absent" name="Absent" fill="#06B6D4" radius={[8, 8, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Recent Campus Activities / Recent Hostel Activities */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                {isWarden ? "Recent Hostel Activities" : "Recent Campus Activities"}
              </h3>
              <Badge tone="info">Live</Badge>
            </div>
            <div className="space-y-3 max-h-[260px] overflow-y-auto">
              {(isWarden ? (wardenCharts?.hostelActivities || []) : activities).length > 0 ? (
                (isWarden ? (wardenCharts?.hostelActivities || []) : activities).map((activity: any, idx: number) => (
                  <div
                    key={(activity.actor || activity.user || "Actor") + activity.time + idx}
                    className="flex items-start gap-2.5 py-1.5 border-b last:border-0 text-xs"
                  >
                    <div className="size-6 rounded-full bg-indigo-50 text-indigo-600 grid place-items-center text-[10px] font-bold shrink-0">
                      {(activity.actor || activity.user || "AC").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-slate-800">{activity.actor || activity.user}</span>{" "}
                      <span className="text-slate-500">{activity.action}</span>{" "}
                      <span className="font-semibold text-slate-700">{activity.target}</span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{activity.time}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground py-4 text-center">
                  No recent activities logged.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* SMART FLEET & CAMPUS TRANSIT — TRANSIT SECTION HIDDEN FOR WARDEN */}
      {!isWarden && (
        <div className="space-y-4 pt-2">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-indigo-50 border border-indigo-100 grid place-items-center text-indigo-600 shrink-0">
                <Bus className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Smart Fleet & Campus Transit Details</h3>
                <p className="text-[10px] text-slate-500">Bus roster, student allocation, passenger counts &amp; route-wise fee breakdown.</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
              <span className="size-1.5 bg-emerald-500 rounded-full animate-ping inline-block" />
              Live Data
            </span>
          </div>

          {/* Main Detail Grid: Bus Table + Route Fees */}
          <div className="grid lg:grid-cols-5 gap-4">
            {/* LEFT: Bus Details Table (col-span-3) */}
            <Card className="lg:col-span-3 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Bus Fleet Details</h4>
                  <p className="text-[10px] text-slate-500">Vehicle, driver, route coverage &amp; passenger load</p>
                </div>
                <Badge tone="info">{busList.length} Active</Badge>
              </div>
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-[10px] text-slate-400 font-bold uppercase tracking-wider pb-2 pl-1">Bus No.</th>
                      <th className="text-left text-[10px] text-slate-400 font-bold uppercase tracking-wider pb-2">Route</th>
                      <th className="text-left text-[10px] text-slate-400 font-bold uppercase tracking-wider pb-2">Driver</th>
                      <th className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider pb-2">Capacity</th>
                      <th className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider pb-2">Passengers</th>
                      <th className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {busList.map((row) => (
                      <tr key={row.bus} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 pl-1">
                          <span className="font-mono font-bold text-indigo-700 text-[11px]">{row.bus.split("-").pop()}</span>
                        </td>
                        <td className="py-2.5 pr-2">
                          <span className="text-slate-700 font-medium text-[11px] block leading-tight max-w-[120px] truncate">{row.route}</span>
                        </td>
                        <td className="py-2.5 pr-2">
                          <span className="text-slate-600 text-[11px]">{row.driver}</span>
                        </td>
                        <td className="py-2.5 text-center">
                          <span className="text-slate-600 font-semibold">{row.capacity}</span>
                        </td>
                        <td className="py-2.5 text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="font-bold text-slate-800">{row.passengers}</span>
                            <div className="w-12 h-1 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-indigo-500"
                                style={{ width: `${Math.round((row.passengers / Math.max(1, row.capacity)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            row.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}>
                            <span className={`size-1.5 rounded-full ${row.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* RIGHT: Route-wise Fee Breakdown (col-span-2) */}
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Route Section Fees</h4>
                  <p className="text-[10px] text-slate-500">Monthly fee per student, per route</p>
                </div>
                <Compass className="size-4 text-amber-500" />
              </div>
              <div className="space-y-3">
                {routeFares.map((r) => (
                  <div key={r.route} className={`p-3 rounded-xl bg-${r.color}-50 border border-${r.color}-100`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`size-2 rounded-full bg-${r.color}-500`} />
                        <span className={`text-[10px] font-bold text-${r.color}-700 uppercase tracking-wider`}>{r.route}</span>
                      </div>
                      <span className={`font-bold text-${r.color}-700 text-sm`}>₹{r.fare.toLocaleString()}<span className="text-[9px] font-normal opacity-70"> /mo</span></span>
                    </div>
                    <p className="text-[10px] text-slate-600 font-medium mb-2">{r.coverage}</p>
                    <div className="flex items-center justify-between text-[9px] text-slate-500">
                      <span>📍 {r.dist} road distance</span>
                      <span>👤 {r.passengers} passengers</span>
                      <span>💰 Total: ₹{(r.fare * r.passengers).toLocaleString()}/mo</span>
                    </div>
                  </div>
                ))}
                <div className="mt-2 p-3 rounded-xl bg-slate-800 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Total Monthly Collection</span>
                    <span className="font-bold text-white text-base">₹{totalFaresCollection.toLocaleString()}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-0.5">From {totalPassengers} active bus pass holders across {routeFares.length} routes</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

