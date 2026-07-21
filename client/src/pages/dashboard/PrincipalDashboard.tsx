import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  GraduationCap,
  Wallet,
  Award,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  Building,
  BarChart2
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
  YAxis
} from "recharts";
import { Card, PageHeader, StatCard, Badge } from "@/components/dashboard/ui";
import { toast } from "sonner";

export function PrincipalDashboard() {
  const [loading, setLoading] = useState(false);
  const [approvals, setApprovals] = useState([
    { id: "APP-01", type: "Research Grant", detail: "₹4.5L for AIML Lab Supercomputer", dept: "AIML", status: "Pending" },
    { id: "APP-02", type: "Faculty Leave", detail: "Dr. Anjali Mehra (HOD CSE) - 5 Days Medical", dept: "CSE", status: "Pending" },
    { id: "APP-03", type: "Event Budget", detail: "₹1.2L for National Hackathon 'CodeStorm'", dept: "IT", status: "Pending" },
  ]);

  const handleApprove = (id: string, detail: string) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
    toast.success(`Request Approved: ${detail}`);
  };

  const handleReject = (id: string, detail: string) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
    toast.warning(`Request Declined: ${detail}`);
  };

  // Mock charts
  const financialData = [
    { name: "Q1", revenue: 120, expense: 85 },
    { name: "Q2", revenue: 150, expense: 95 },
    { name: "Q3", revenue: 180, expense: 110 },
    { name: "Q4", revenue: 210, expense: 125 }
  ];

  const complianceData = [
    { name: "Criteria 1 (Curricular)", value: 88, color: "#6366F1" },
    { name: "Criteria 2 (Teaching)", value: 92, color: "#10B981" },
    { name: "Criteria 3 (Research)", value: 78, color: "#F59E0B" },
    { name: "Criteria 4 (Infrastructure)", value: 95, color: "#EC4899" }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Principal's Console"
        desc="Institution-wide operational status, financial ledger balances, and NAAC/NBA metrics."
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Student Roster"
          value="5,240"
          change="+4.2% from last term"
          icon={Users}
          gradient="bg-gradient-primary"
        />
        <StatCard
          label="Active Staff/Faculty"
          value="342"
          change="98.5% daily attendance"
          icon={GraduationCap}
          gradient="bg-gradient-violet"
        />
        <StatCard
          label="Capital Reserves"
          value="₹4.82 Cr"
          change="68.2% budget utilized"
          icon={Wallet}
          gradient="bg-gradient-cyan"
        />
        <StatCard
          label="NAAC Accreditation Grade"
          value="A++"
          change="3.82 CGPA (Score Rank #1)"
          icon={Award}
          gradient="bg-gradient-primary"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Budget vs Expenses Area Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Financial Quarters Ledger</h3>
              <p className="text-xs text-muted-foreground">Revenue collection vs operations expenditure in Lakhs</p>
            </div>
            <Badge tone="success">FY 2026-27</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={financialData}>
                <defs>
                  <linearGradient id="revenue" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expense" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" name="Revenue Collection (₹)" stroke="#6366F1" fill="url(#revenue)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" name="Operational Cost (₹)" stroke="#F43F5E" fill="url(#expense)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* NAAC compliance breakdown */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">NAAC Assessment Metrics</h3>
            <Badge tone="info">Scorecard</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={complianceData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {complianceData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {complianceData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground truncate max-w-[150px]">{d.name}</span>
                </div>
                <span className="font-bold">{d.value}% compliance</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Pending approvals */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Principal Approvals Panel</h3>
              <p className="text-[10px] text-slate-500">Decisions requiring institutional seal & signature.</p>
            </div>
            <Badge tone="warn">{approvals.length} Pending</Badge>
          </div>
          <div className="space-y-3">
            {approvals.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-6">All approval requests cleared!</div>
            ) : (
              approvals.map(app => (
                <div key={app.id} className="p-3 border rounded-xl flex items-center justify-between gap-3 text-xs bg-slate-50/50 hover:bg-slate-50 transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-700 font-mono text-[10px]">{app.id}</span>
                      <span className="font-semibold text-slate-800">{app.type}</span>
                      <Badge tone="info" className="text-[9px] px-1 py-0">{app.dept}</Badge>
                    </div>
                    <p className="text-slate-500 mt-1 font-medium">{app.detail}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleReject(app.id, app.detail)}
                      className="px-2.5 py-1 rounded-lg border text-rose-600 hover:bg-rose-50 font-bold transition text-[10px]"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleApprove(app.id, app.detail)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition text-[10px]"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Global Action Board */}
        <Card>
          <h3 className="font-semibold mb-4">Executive Quick Tools</h3>
          <div className="space-y-2">
            <button
              onClick={() => {
                toast.loading("Generating NBA Self-Assessment report...", { duration: 1500 });
                setTimeout(() => toast.success("NBA Criteria Report PDF successfully generated & exported."), 1600);
              }}
              className="w-full py-2.5 rounded-xl border flex items-center gap-3 justify-center text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              <Award className="size-4 text-violet-600" />
              <span>Generate NBA/NAAC Report</span>
            </button>
            <button
              onClick={() => {
                toast.success("Emergency Circular broadcasted to all Departments successfully!");
              }}
              className="w-full py-2.5 rounded-xl border flex items-center gap-3 justify-center text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              <Send className="size-4 text-emerald-600" />
              <span>Broadcast Circular Advisory</span>
            </button>
            <button
              onClick={() => {
                toast.success("Biometric Attendance logs and RFID entries synced globally.");
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white flex items-center gap-3 justify-center text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
            >
              <CheckCircle className="size-4 text-emerald-400" />
              <span>Synchronize Biometric Nodes</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
