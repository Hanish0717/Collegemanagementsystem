import { useState } from 'react';
import { Users, GraduationCap, Award, Building2, CheckCircle, FileText, BookOpen, Sparkles, ClipboardList, Send } from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

export function DeanHome() {
  const [approvals, setApprovals] = useState([
    { id: 'DA-01', type: 'Scholarship Sanction', detail: '₹85,000 — Merit Award (CS2026041)', category: 'Student Welfare', status: 'Pending' },
    { id: 'DA-02', type: 'Faculty Transfer', detail: 'Dr. Raj Patel — ECE to CSE Department', category: 'Faculty Admin', status: 'Pending' },
    { id: 'DA-03', type: 'Event Proposal', detail: 'International Research Conference 2026', category: 'Academic', status: 'Pending' },
    { id: 'DA-04', type: 'Exam Exception', detail: 'Medical Exception — 12 students (Final Term)', category: 'Examination', status: 'Pending' },
  ]);

  const approvalFunnel = [
    { name: 'Approved', value: 84, color: '#1d4ed8' },
    { name: 'Pending', value: 12, color: '#f59e0b' },
    { name: 'Rejected', value: 4, color: '#ef4444' },
  ];

  const deptOverview = [
    { dept: 'CSE', students: 720, faculty: 48, attendance: 94 },
    { dept: 'ECE', students: 540, faculty: 36, attendance: 91 },
    { dept: 'ME', students: 410, faculty: 28, attendance: 87 },
    { dept: 'EEE', students: 380, faculty: 26, attendance: 92 },
    { dept: 'CE', students: 400, faculty: 30, attendance: 89 },
  ];

  const handleApprove = (id: string, detail: string) => {
    setApprovals(p => p.filter(a => a.id !== id));
    toast.success(`Dean Approved: ${detail}`);
  };
  const handleReject = (id: string, detail: string) => {
    setApprovals(p => p.filter(a => a.id !== id));
    toast.warning(`Dean Declined: ${detail}`);
  };

  const domainModules = [
    { label: 'Student Admin', icon: Users, to: '/dean/student', color: 'bg-blue-50 border-blue-100 text-blue-700' },
    { label: 'Examination', icon: BookOpen, to: '/dean/examination', color: 'bg-violet-50 border-violet-100 text-violet-700' },
    { label: 'Academic', icon: Award, to: '/dean/academic', color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
    { label: 'IMA', icon: Sparkles, to: '/dean/ima', color: 'bg-amber-50 border-amber-100 text-amber-700' },
    { label: 'IQAC', icon: Building2, to: '/dean/iqac', color: 'bg-rose-50 border-rose-100 text-rose-700' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dean's Administrative Console"
        desc="Executive administrative control — student oversight, faculty management, examinations, IQAC, IMA, approvals and reports."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Students" value="5,240" change="Across all departments" icon={Users} />
        <StatCard label="Total Faculty" value="342" change="All domains combined" icon={GraduationCap} />
        <StatCard label="Pending Approvals" value={String(approvals.length)} change="Requires Dean signature" icon={ClipboardList} />
        <StatCard label="Active Departments" value="12" change="4 academic faculties" icon={Building2} />
      </div>

      {/* Domain Module Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {domainModules.map(({ label, icon: Icon, to, color }) => (
          <a key={label} href={to} className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition hover:-translate-y-0.5 cursor-pointer ${color}`}>
            <Icon className="size-6 mb-2" />
            <span className="text-xs font-bold text-center">{label}</span>
          </a>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Department Overview</h3>
              <p className="text-xs text-muted-foreground">Students, faculty headcount & attendance %</p>
            </div>
            <Badge tone="info">All Departments</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Department</th>
                  <th className="text-center pb-2">Students</th>
                  <th className="text-center pb-2">Faculty</th>
                  <th className="text-center pb-2">Attendance</th>
                  <th className="text-right pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deptOverview.map(d => (
                  <tr key={d.dept} className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-slate-800">{d.dept}</td>
                    <td className="py-2.5 text-center font-semibold text-blue-700">{d.students}</td>
                    <td className="py-2.5 text-center">{d.faculty}</td>
                    <td className="py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-blue-600" style={{ width: `${d.attendance}%` }} />
                        </div>
                        <span className="font-mono text-[10px]">{d.attendance}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right">
                      <Badge tone={d.attendance >= 90 ? 'success' : 'warn'} className="text-[9px]">
                        {d.attendance >= 90 ? 'Good' : 'Watch'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Approval Funnel</h3>
            <Badge>This Month</Badge>
          </div>
          <div className="h-40">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={approvalFunnel} dataKey="value" innerRadius={40} outerRadius={65} paddingAngle={3}>
                  {approvalFunnel.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-1">
            {approvalFunnel.map(d => (
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
              <h3 className="font-semibold text-sm">Dean Approval Queue</h3>
              <p className="text-[10px] text-muted-foreground">Cross-domain requests requiring Dean's decision</p>
            </div>
            <Badge tone="warn">{approvals.length} Pending</Badge>
          </div>
          <div className="space-y-3">
            {approvals.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">All approval requests cleared!</p>
            ) : approvals.map(app => (
              <div key={app.id} className="p-3 border rounded-xl flex items-center justify-between gap-3 text-xs bg-slate-50/50 hover:bg-slate-50 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400">{app.id}</span>
                    <span className="font-semibold">{app.type}</span>
                    <Badge tone="info" className="text-[9px]">{app.category}</Badge>
                  </div>
                  <p className="text-slate-500 mt-1">{app.detail}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleReject(app.id, app.detail)} className="px-2.5 py-1 rounded-lg border text-rose-600 hover:bg-rose-50 font-bold text-[10px]">Decline</button>
                  <button onClick={() => handleApprove(app.id, app.detail)} className="px-2.5 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold text-[10px]">Approve</button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4 text-sm">Dean Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Approve All Pending', icon: CheckCircle, color: 'text-emerald-600' },
              { label: 'Generate Executive Report', icon: FileText, color: 'text-blue-600' },
              { label: 'Broadcast Dean Circular', icon: Send, color: 'text-violet-600' },
              { label: 'Schedule Department Meeting', icon: ClipboardList, color: 'text-amber-600' },
              { label: 'Escalate to Principal', icon: Award, color: 'text-rose-600' },
            ].map(({ label, icon: Icon, color }) => (
              <button key={label} onClick={() => toast.success(`${label} initiated!`)} className="w-full py-2.5 rounded-xl border flex items-center gap-2.5 justify-center text-xs font-bold hover:bg-slate-50 transition cursor-pointer">
                <Icon className={`size-4 ${color}`} /> {label}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
