import { useState } from 'react';
import { Users, GraduationCap, CalendarCheck, AlertTriangle, ClipboardList, Send, FileText, Building2 } from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

export function VicePrincipalHome() {
  const [leaves, setLeaves] = useState([
    { id: 'L-901', name: 'Dr. Suresh Kumar', dept: 'ECE', days: 2, reason: 'Medical', dates: 'Jul 22-23' },
    { id: 'L-902', name: 'Mrs. Priya Sharma', dept: 'ME', days: 1, reason: 'Personal', dates: 'Jul 24' },
  ]);

  const [disciplineCases, setDisciplineCases] = useState([
    { id: 'DC-201', student: 'Rahul Verma', roll: 'EC2026042', issue: 'Ragging complaint filed', dept: 'ECE', severity: 'high' },
    { id: 'DC-202', student: 'Anita Rao', roll: 'CS2026088', issue: 'Attendance below 60%', dept: 'CSE', severity: 'medium' },
    { id: 'DC-203', student: 'Vikash Singh', roll: 'ME2026015', issue: 'Proxy attendance flagged', dept: 'ME', severity: 'medium' },
  ]);

  const deptAttendance = [
    { dept: 'CSE', today: 94 }, { dept: 'ECE', today: 91 },
    { dept: 'ME', today: 87 }, { dept: 'EEE', today: 92 },
    { dept: 'CE', today: 89 }, { dept: 'IT', today: 93 },
  ];

  const handleApproveLeave = (id: string, name: string) => {
    setLeaves(p => p.filter(l => l.id !== id));
    toast.success(`Leave approved for ${name}`);
  };
  const handleRejectLeave = (id: string, name: string) => {
    setLeaves(p => p.filter(l => l.id !== id));
    toast.warning(`Leave declined for ${name}`);
  };
  const handleResolveDiscipline = (id: string) => {
    setDisciplineCases(p => p.filter(d => d.id !== id));
    toast.success('Disciplinary case marked resolved.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vice Principal — Operations Console"
        desc="Daily academic operations, faculty attendance monitoring, student discipline, and approval queue."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Faculty on Leave Today" value="4" change="2 pending approval" icon={GraduationCap} />
        <StatCard label="Depts Below Target" value="1" change="ME — 87% avg attendance" icon={Building2} />
        <StatCard label="Pending Approvals" value="6" change="Leave + event requests" icon={ClipboardList} />
        <StatCard label="Discipline Cases" value="3" change="Open this month" icon={AlertTriangle} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Today's Department Attendance</h3>
              <p className="text-xs text-muted-foreground">Real-time attendance % by department</p>
            </div>
            <Badge tone="info">Live</Badge>
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={deptAttendance}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="dept" fontSize={11} stroke="#64748B" />
                <YAxis fontSize={11} stroke="#64748B" domain={[80, 100]} />
                <Tooltip />
                <Bar dataKey="today" name="Attendance %" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm">Faculty Leave Approvals</h3>
            </div>
            <Badge tone="warn">{leaves.length} Pending</Badge>
          </div>
          <div className="space-y-3">
            {leaves.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">All leave requests processed.</p>
            ) : leaves.map(l => (
              <div key={l.id} className="p-3 border rounded-xl text-xs bg-slate-50/50">
                <div className="flex justify-between mb-1">
                  <span className="font-bold">{l.name}</span>
                  <Badge tone="info" className="text-[9px]">{l.dept}</Badge>
                </div>
                <p className="text-slate-500">{l.reason} — {l.dates} ({l.days}d)</p>
                <div className="flex gap-2 justify-end mt-2">
                  <button onClick={() => handleRejectLeave(l.id, l.name)} className="px-2 py-0.5 rounded border text-rose-600 hover:bg-rose-50 text-[10px] font-bold">Decline</button>
                  <button onClick={() => handleApproveLeave(l.id, l.name)} className="px-2 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-700 text-[10px] font-bold">Approve</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-1.5">
                <AlertTriangle className="size-4 text-amber-500" /> Student Discipline Cases
              </h3>
              <p className="text-[10px] text-muted-foreground">Open disciplinary matters requiring VP attention</p>
            </div>
            <Badge tone="danger">{disciplineCases.length} Open</Badge>
          </div>
          <div className="space-y-3">
            {disciplineCases.map(dc => (
              <div key={dc.id} className="p-3 border rounded-xl flex items-center justify-between text-xs hover:bg-slate-50 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{dc.student}</span>
                    <span className="text-slate-400 font-mono text-[10px]">{dc.roll}</span>
                    <Badge tone={dc.severity === 'high' ? 'danger' : 'warn'} className="text-[9px]">{dc.severity}</Badge>
                  </div>
                  <p className="text-slate-500 mt-0.5">{dc.issue}</p>
                </div>
                <button onClick={() => handleResolveDiscipline(dc.id)} className="px-3 py-1 rounded-lg border text-emerald-600 hover:bg-emerald-50 font-bold text-[10px] shrink-0">Resolve</button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4 text-sm">VP Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Issue Faculty Memo', icon: FileText, color: 'text-slate-600' },
              { label: 'Send Dept Reminder', icon: Send, color: 'text-blue-600' },
              { label: 'Schedule Staff Meeting', icon: CalendarCheck, color: 'text-violet-600' },
              { label: 'Generate Operations Report', icon: ClipboardList, color: 'text-emerald-600' },
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
