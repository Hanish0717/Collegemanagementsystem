import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import { Users, GraduationCap, CalendarCheck, Wallet, TrendingUp, Calendar } from "lucide-react";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import {
  attendanceData, performanceData, departmentData, activities, events, stats
} from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

const statIcons = [Users, GraduationCap, CalendarCheck, Wallet];
const statGradients = ["bg-gradient-primary","bg-gradient-violet","bg-gradient-cyan","bg-gradient-primary"];

function DashboardHome() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome back, Dr. Mehra 👋"
        desc="Here's what's happening across your campus today."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.06 }}>
            <StatCard label={s.label} value={s.value} change={s.change} icon={statIcons[i]} gradient={statGradients[i]} />
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Weekly Attendance</h3>
              <p className="text-xs text-muted-foreground">Present vs absent across campus</p>
            </div>
            <Badge tone="info">This week</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="grad-p" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad-a" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Area type="monotone" dataKey="present" stroke="#4F46E5" fill="url(#grad-p)" strokeWidth={2} />
                <Area type="monotone" dataKey="absent" stroke="#06B6D4" fill="url(#grad-a)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Departments</h3>
            <Badge>Live</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={departmentData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {departmentData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {departmentData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="size-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="ml-auto font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Academic Performance</h3>
              <p className="text-xs text-muted-foreground">Average score over 6 months</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium"><TrendingUp className="size-4" /> +12.4%</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="score" fill="#4F46E5" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Upcoming Events</h3>
            <Calendar className="size-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {events.map(e => (
              <div key={e.title} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-soft border">
                <div className={`size-11 rounded-xl bg-gradient-to-br ${e.color} text-white grid place-items-center text-xs font-semibold`}>
                  {e.date.split(" ")[1]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{e.title}</div>
                  <div className="text-[11px] text-muted-foreground">{e.category} · {e.attendees} attending</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Activity */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Activity</h3>
          <Badge tone="success">Live</Badge>
        </div>
        <div className="space-y-3">
          {activities.map((a, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
              <div className="size-9 rounded-full bg-gradient-primary text-white grid place-items-center text-xs font-semibold">
                {a.user.split(" ").map(x => x[0]).slice(0,2).join("")}
              </div>
              <div className="flex-1 text-sm">
                <span className="font-medium">{a.user}</span>{" "}
                <span className="text-muted-foreground">{a.action}</span>{" "}
                <span className="font-medium">{a.target}</span>
              </div>
              <span className="text-xs text-muted-foreground">{a.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
