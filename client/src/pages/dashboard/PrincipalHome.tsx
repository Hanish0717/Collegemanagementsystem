import { useState } from 'react';
import { Users, GraduationCap, Wallet, Award, TrendingUp, Send, CheckCircle, ShieldCheck, BarChart2 } from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

export function PrincipalHome() {
  const [approvals, setApprovals] = useState([
    { id: 'APP-01', type: 'Research Grant', detail: '₹4.5L for AIML Lab Supercomputer', dept: 'AIML', status: 'Pending' },
    { id: 'APP-02', type: 'Faculty Leave', detail: 'Dr. Anjali Mehra (HOD CSE) — 5 Days Medical', dept: 'CSE', status: 'Pending' },
    { id: 'APP-03', type: 'Event Budget', detail: "₹1.2L for National Hackathon 'CodeStorm'", dept: 'IT', status: 'Pending' },
  ]);

  const financialData = [
    { name: 'Q1', revenue: 120, expense: 85 },
    { name: 'Q2', revenue: 150, expense: 95 },
    { name: 'Q3', revenue: 180, expense: 110 },
    { name: 'Q4', revenue: 210, expense: 125 },
  ];

  const naacData = [
    { name: 'Curricular', value: 88, color: '#1d4ed8' },
    { name: 'Teaching', value: 92, color: '#10B981' },
    { name: 'Research', value: 78, color: '#F59E0B' },
    { name: 'Infrastructure', value: 95, color: '#8B5CF6' },
  ];

  const deptPerformance = [
    { dept: 'CSE', attendance: 94, results: 88 },
    { dept: 'ECE', attendance: 91, results: 85 },
    { dept: 'ME', attendance: 89, results: 82 },
    { dept: 'EEE', attendance: 92, results: 86 },
    { dept: 'CE', attendance: 90, results: 83 },
  ];

  const handleApprove = (id: string, detail: string) => {
    setApprovals(p => p.filter(a => a.id !== id));
    toast.success(`Approved: ${detail}`);
  };
  const handleReject = (id: string, detail: string) => {
    setApprovals(p => p.filter(a => a.id !== id));
    toast.warning(`Declined: ${detail}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Principal's Executive Console"
        desc="Institution-wide KPIs, financial ledger, NAAC metrics, department performance and pending approvals."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Students" value="5,240" change="+4.2% from last term" icon={Users} />
        <StatCard label="Active Faculty" value="342" change="98.5% daily attendance" icon={GraduationCap} />
        <StatCard label="Capital Reserves" value="₹4.82 Cr" change="68.2% budget utilized" icon={Wallet} />
        <StatCard label="NAAC Grade" value="A++" change="3.82 CGPA — Rank #1" icon={Award} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Financial Quarters Ledger</h3>
              <p className="text-xs text-muted-foreground">Revenue vs operational expenditure (₹ Lakhs)</p>
            </div>
            <Badge tone="success">FY 2026-27</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={financialData}>
                <defs>
                  <linearGradient id="p-revenue" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#1d4ed8" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="p-expense" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" name="Revenue (₹L)" stroke="#1d4ed8" fill="url(#p-revenue)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" name="Expenses (₹L)" stroke="#F43F5E" fill="url(#p-expense)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">NAAC Assessment Metrics</h3>
            <Badge tone="info">Scorecard</Badge>
          </div>
          <div className="h-44">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={naacData} dataKey="value" innerRadius={45} outerRadius={72} paddingAngle={3}>
                  {naacData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {naacData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-bold">{d.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Department Performance Comparison</h3>
              <p className="text-xs text-muted-foreground">Attendance % vs Exam Results %</p>
            </div>
            <Badge tone="info">Current Term</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={deptPerformance}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="dept" fontSize={11} stroke="#64748B" />
                <YAxis fontSize={11} stroke="#64748B" domain={[75, 100]} />
                <Tooltip />
                <Bar dataKey="attendance" name="Attendance %" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="results" name="Results %" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Principal Approvals</h3>
              <p className="text-[10px] text-muted-foreground">Requiring institutional seal</p>
            </div>
            <Badge tone="warn">{approvals.length} Pending</Badge>
          </div>
          <div className="space-y-3">
            {approvals.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">All cleared!</p>
            ) : approvals.map(app => (
              <div key={app.id} className="p-3 border rounded-xl text-xs bg-slate-50/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-bold text-[10px] font-mono text-slate-400">{app.id}</span>
                  <span className="font-semibold">{app.type}</span>
                  <Badge tone="info" className="text-[9px]">{app.dept}</Badge>
                </div>
                <p className="text-slate-500 mb-2">{app.detail}</p>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => handleReject(app.id, app.detail)} className="px-2 py-0.5 rounded border text-rose-600 hover:bg-rose-50 text-[10px] font-bold transition">Decline</button>
                  <button onClick={() => handleApprove(app.id, app.detail)} className="px-2 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-700 text-[10px] font-bold transition">Approve</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            <button onClick={() => toast.success('NBA Criteria Report PDF exported.')} className="w-full py-2 rounded-xl border flex items-center gap-2 justify-center text-xs font-bold hover:bg-slate-50 transition cursor-pointer">
              <Award className="size-3.5 text-violet-600" /> Generate NBA/NAAC Report
            </button>
            <button onClick={() => toast.success('Emergency Circular broadcasted to all Departments!')} className="w-full py-2 rounded-xl border flex items-center gap-2 justify-center text-xs font-bold hover:bg-slate-50 transition cursor-pointer">
              <Send className="size-3.5 text-emerald-600" /> Broadcast Circular
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
