import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import { BookOpen, BookMarked, Clock, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import {
  librarianStats, bookCirculationData, bookCategoriesData, issuedBooksHistory, libraryNotifications
} from "@/mock/mockData";



const statIcons = [BookOpen, BookMarked, Clock, DollarSign];
const statGradients = ["bg-gradient-primary", "bg-gradient-violet", "bg-gradient-cyan", "bg-gradient-primary"];

export function LibrarianDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Library Overview 📚"
        desc="Overview of book circulation, inventory and member activities."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {librarianStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <StatCard label={s.label} value={s.value} change={s.change} icon={statIcons[i]} gradient={statGradients[i]} />
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Weekly Book Circulation</h3>
              <p className="text-xs text-muted-foreground">Issued, returned and fines tracked</p>
            </div>
            <Badge tone="info">This week</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={bookCirculationData}>
                <defs>
                  <linearGradient id="grad-issued" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad-returned" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad-fines" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#EC4899" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#EC4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="week" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Area type="monotone" dataKey="issued" stroke="#4F46E5" fill="url(#grad-issued)" strokeWidth={2} />
                <Area type="monotone" dataKey="returned" stroke="#06B6D4" fill="url(#grad-returned)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Books by Category</h3>
            <Badge>Live</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={bookCategoriesData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {bookCategoriesData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {bookCategoriesData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="size-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-muted-foreground truncate">{d.name.split(" ")[0]}</span>
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
              <h3 className="font-semibold">Recently Issued Books</h3>
              <p className="text-xs text-muted-foreground">Last 6 issues with status</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium"><TrendingUp className="size-4" /> +8.2%</div>
          </div>
          <div className="space-y-3">
            {issuedBooksHistory.slice(0, 5).map(issue => (
              <div key={issue.id} className="flex items-center justify-between p-3 rounded-xl bg-gradient-soft border">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{issue.bookTitle}</div>
                  <div className="text-[11px] text-muted-foreground">{issue.studentName} • {issue.issueDate}</div>
                </div>
                <Badge tone={issue.status === "Active" ? "success" : "danger"}>{issue.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Notifications</h3>
            <AlertCircle className="size-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {libraryNotifications.slice(0, 4).map(n => (
              <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-soft border">
                <div className={`size-2 rounded-full mt-1.5 ${n.urgency === "high" ? "bg-rose-500" : n.urgency === "medium" ? "bg-amber-500" : "bg-emerald-500"}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-[11px] text-muted-foreground">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
