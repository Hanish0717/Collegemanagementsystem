import { useState } from 'react';
import { Users, GraduationCap, Wallet, Building2, ClipboardList, UserPlus, Send, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { getStoredUser } from '@/services/authService';

export function AdminHome() {
  const user = getStoredUser();
  const [approvals, setApprovals] = useState([
    { id: 'REQ-101', type: 'Leave Request', detail: 'Dr. Srinivas Rao — 3 Days Medical Leave', dept: 'CSE', status: 'Pending' },
    { id: 'REQ-102', type: 'Fee Waiver', detail: 'Hanish Senapati (CS2026101) — Merit Scholarship', dept: 'CSE', status: 'Pending' },
    { id: 'REQ-103', type: 'Event Approval', detail: 'Tech Fest 2026 — Budget ₹2.4L', dept: 'IT Club', status: 'Pending' },
  ]);

  const enrollmentData = [
    { dept: 'CSE', students: 720 }, { dept: 'ECE', students: 540 },
    { dept: 'ME', students: 410 }, { dept: 'EEE', students: 380 },
    { dept: 'CE', students: 400 }, { dept: 'MBA', students: 290 },
  ];

  const feeData = [
    { name: 'Collected', value: 72, color: '#1d4ed8' },
    { name: 'Pending', value: 18, color: '#f59e0b' },
    { name: 'Waived', value: 10, color: '#10b981' },
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
        title={`Administration Console`}
        desc="Manage admissions, student records, faculty, fees, timetable and approve institutional requests."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Students" value="5,240" change="+128 this month" icon={Users} />
        <StatCard label="Total Faculty" value="342" change="98.5% attendance today" icon={GraduationCap} />
        <StatCard label="Fee Collection" value="₹1.84 Cr" change="72% of target" icon={Wallet} />
        <StatCard label="Active Departments" value="12" change="4 faculties" icon={Building2} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Department Enrollment</h3>
              <p className="text-xs text-muted-foreground">Student count per department</p>
            </div>
            <Badge tone="info">AY 2026-27</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="dept" fontSize={11} stroke="#64748B" />
                <YAxis fontSize={11} stroke="#64748B" />
                <Tooltip />
                <Bar dataKey="students" name="Students" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Fee Collection Status</h3>
            <Badge>This Term</Badge>
          </div>
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={feeData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {feeData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {feeData.map(d => (
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
              <h3 className="font-semibold text-sm">Pending Approval Queue</h3>
              <p className="text-xs text-muted-foreground">Requests requiring admin action</p>
            </div>
            <Badge tone="warn">{approvals.length} Pending</Badge>
          </div>
          <div className="space-y-3">
            {approvals.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">All requests cleared!</p>
            ) : approvals.map(app => (
              <div key={app.id} className="p-3 border rounded-xl flex items-center justify-between gap-3 text-xs bg-slate-50/50 hover:bg-slate-50 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400">{app.id}</span>
                    <span className="font-semibold">{app.type}</span>
                    <Badge tone="info" className="text-[9px]">{app.dept}</Badge>
                  </div>
                  <p className="text-slate-500 mt-1">{app.detail}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleReject(app.id, app.detail)} className="px-2.5 py-1 rounded-lg border text-rose-600 hover:bg-rose-50 font-bold transition text-[10px]">Decline</button>
                  <button onClick={() => handleApprove(app.id, app.detail)} className="px-2.5 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold transition text-[10px]">Approve</button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4 text-sm">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { icon: UserPlus, label: 'Add New Student', color: 'text-blue-600' },
              { icon: GraduationCap, label: 'Add Faculty Member', color: 'text-violet-600' },
              { icon: Wallet, label: 'Generate Fee Challan', color: 'text-emerald-600' },
              { icon: Send, label: 'Post Circular', color: 'text-amber-600' },
              { icon: FileText, label: 'Generate Report', color: 'text-slate-600' },
            ].map(({ icon: Icon, label, color }) => (
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
