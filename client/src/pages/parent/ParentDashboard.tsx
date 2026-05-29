import { useState, useEffect } from "react";
import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import {
  Activity, Bell, BookOpen, Calendar, CheckCircle, Clock, DollarSign,
  GraduationCap, TrendingUp, User
} from "lucide-react";
import { Badge, Card, PageHeader, StatCard } from "@/components/dashboard/ui";
import {
  attendanceHistory, marksPerformance, parentActivities, parentNotifications, parentStats as mockStats
} from "@/mock/parentData";
import api from "@/lib/api";

const statIcons = [GraduationCap, TrendingUp, DollarSign, Calendar, Bell, CheckCircle, User, Activity];
const statGradients = [
  "bg-gradient-primary", "bg-gradient-violet", "bg-gradient-cyan", "bg-gradient-primary",
  "bg-gradient-violet", "bg-gradient-cyan", "bg-gradient-primary", "bg-gradient-violet",
];

export function ParentDashboard() {
  const path = useRouterState({ select: r => r.location.pathname });
  const [stats, setStats] = useState<any[]>(mockStats);
  const [childInfo, setChildInfo] = useState<any>(null);
  const [parentName, setParentName] = useState("Parent");

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
    const fetchStudentData = async () => {
      try {
        const res = await api.get("/api/parent-module/student-data");
        if (res.data?.success && res.data?.data) {
          const dbData = res.data.data;
          // Store in localStorage for sub-pages to use
          localStorage.setItem("cms_parent_child_data", JSON.stringify(dbData));
          
          setChildInfo(dbData);

          // Map backend stats to the UI stats grid
          const attendanceVal = dbData.stats.find((s: any) => s.label.includes("Attendance"))?.value || "87.3%";
          const cgpaVal = dbData.stats.find((s: any) => s.label.includes("CGPA"))?.value || "3.6";
          const feesVal = dbData.stats.find((s: any) => s.label.includes("Fees"))?.value || "$1,250";

          setStats([
            { label: "Child Attendance", value: attendanceVal, change: "Current" },
            { label: "Child CGPA", value: cgpaVal, change: "Latest" },
            { label: "Pending Fees", value: feesVal, change: "Due" },
            { label: "Upcoming Exams", value: "2", change: "This Week" },
            { label: "Notifications", value: "5", change: "Unread" },
            { label: "Leave Status", value: "Approved", change: "1 Request" }
          ]);
        }
      } catch (err) {
        console.error("Error loading parent dashboard child data:", err);
      }
    };
    fetchStudentData();
  }, []);

  if (path !== "/dashboard/parent") {
    return <Outlet />;
  }

  const attendancePctStr = stats[0]?.value || "87.3%";
  const cgpaValueStr = stats[1]?.value || "3.6";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${parentName}`}
        desc={`Monitoring academic progress for your child: ${childInfo?.childName || "Loading..."} (${childInfo?.rollNumber || ""})`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.slice(0, 4).map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <StatCard label={stat.label} value={stat.value} change={stat.change} icon={statIcons[i]} gradient={statGradients[i]} />
          </motion.div>
        ))}
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
            <ResponsiveContainer>
              <AreaChart data={attendanceHistory}>
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
                <Area type="monotone" dataKey="percentage" stroke="#4F46E5" fill="url(#parent-attendance)" strokeWidth={2} />
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
              { label: "View Attendance", tone: "info" as const },
              { label: "Check Marks", tone: "success" as const },
              { label: "Pay Fees", tone: "warn" as const },
              { label: "Contact Teacher", tone: "info" as const },
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
              <h3 className="font-semibold">Marks Performance</h3>
              <p className="text-xs text-muted-foreground">Monthly marks percentage</p>
            </div>
            <Badge tone="success">85.4%</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={marksPerformance}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="marks" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <User className="size-5 text-indigo" />
            <h3 className="font-semibold">Child Overview</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Name", value: childInfo?.childName || "Student User" },
              { label: "Roll Number", value: childInfo?.rollNumber || "CS2026101" },
              { label: "Current Semester", value: childInfo ? `Sem ${childInfo.semester}` : "Sem 5" },
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
            {parentActivities.map(activity => (
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
            {parentNotifications.map(notification => (
              <div key={notification.id} className={`flex items-start gap-3 p-3 rounded-xl border transition ${notification.unread ? "bg-blue-50 border-blue-200" : "hover:bg-accent/50"}`}>
                <div className="size-2 rounded-full bg-gradient-primary shrink-0 mt-1.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{notification.title}</div>
                  <div className="text-xs text-muted-foreground">{notification.time}</div>
                </div>
                <Badge tone={notification.type === "Alert" ? "danger" : notification.type === "Exam" ? "warn" : "info"}>
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
