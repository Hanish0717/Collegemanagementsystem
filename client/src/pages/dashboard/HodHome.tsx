import { useState } from 'react';
import { Users, GraduationCap, CalendarCheck, Activity, AlertTriangle, Mail, CheckCircle, FileText, FlaskConical } from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { getStoredUser } from '@/services/authService';

export function HodHome() {
  const user = getStoredUser();
  const deptName = 'CSE'; // In production: derive from user profile

  const [facultyRoster, setFacultyRoster] = useState([
    { name: 'Dr. Srinivas Rao', designation: 'Professor', workload: 16, subject: 'Machine Learning', attendance: 98 },
    { name: 'Mrs. Ananya Sen', designation: 'Asst. Professor', workload: 14, subject: 'Compiler Design', attendance: 95 },
    { name: 'Mr. Ramesh Yadav', designation: 'Senior Lecturer', workload: 18, subject: 'Database Systems', attendance: 92 },
    { name: 'Dr. K. Lakshmi', designation: 'Assoc. Professor', workload: 12, subject: 'Data Structures', attendance: 97 },
  ]);

  const [warnings, setWarnings] = useState([
    { id: 'STU-402', name: 'Hanish Senapati', roll: 'CS2026101', attendance: 68, section: 'A' },
    { id: 'STU-415', name: 'Varun Verma', roll: 'CS2026115', attendance: 72, section: 'B' },
    { id: 'STU-422', name: 'Nikita Reddy', roll: 'CS2026122', attendance: 65, section: 'C' },
  ]);

  const [leaves, setLeaves] = useState([
    { id: 'L-802', faculty: 'Mrs. Ananya Sen', days: 3, dates: 'Jul 20-22', reason: 'Family Event' },
    { id: 'L-810', faculty: 'Dr. Srinivas Rao', days: 1, dates: 'Jul 25', reason: 'Medical Checkup' },
  ]);

  const subjectResults = [
    { subject: 'ML', pass: 88, fail: 12 },
    { subject: 'Compiler', pass: 82, fail: 18 },
    { subject: 'DBMS', pass: 91, fail: 9 },
    { subject: 'DS', pass: 85, fail: 15 },
    { subject: 'OS', pass: 79, fail: 21 },
  ];

  const handleApproveLeave = (id: string, name: string) => {
    setLeaves(p => p.filter(l => l.id !== id));
    toast.success(`Leave approved for ${name}`);
  };
  const handleRejectLeave = (id: string, name: string) => {
    setLeaves(p => p.filter(l => l.id !== id));
    toast.warning(`Leave declined for ${name}`);
  };
  const handleSendWarningSMS = (name: string, roll: string) => {
    toast.success(`Warning SMS sent to parents of ${name} (${roll})`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`HOD — ${deptName} Department Console`}
        desc={`Manage ${deptName} faculty workloads, student attendance, results, leave approvals and department circulars.`}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label={`${deptName} Students`} value="2,140" change="3 sections per year" icon={Users} />
        <StatCard label={`${deptName} Faculty`} value="86" change="Avg 14.5 hrs/week" icon={GraduationCap} />
        <StatCard label="Today's Classes" value="24" change="100% faculty checked-in" icon={CalendarCheck} />
        <StatCard label="Avg Attendance" value="94.2%" change="+1.2% vs yesterday" icon={Activity} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">{deptName} Faculty Workload Allocation</h3>
            <Badge tone="info">{facultyRoster.length} Faculty</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Faculty</th>
                  <th className="text-left pb-2">Designation</th>
                  <th className="text-left pb-2">Subject</th>
                  <th className="text-center pb-2">Hrs/Week</th>
                  <th className="text-center pb-2">Attendance</th>
                  <th className="text-right pb-2">Load</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facultyRoster.map(f => (
                  <tr key={f.name} className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-slate-800">{f.name}</td>
                    <td className="py-2.5 text-slate-500 text-[10px]">{f.designation}</td>
                    <td className="py-2.5">{f.subject}</td>
                    <td className="py-2.5 text-center font-bold text-blue-700">{f.workload} hrs</td>
                    <td className="py-2.5 text-center">
                      <span className={`font-bold ${f.attendance >= 95 ? 'text-emerald-600' : 'text-amber-600'}`}>{f.attendance}%</span>
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className={`h-full rounded-full ${f.workload >= 18 ? 'bg-amber-500' : 'bg-blue-600'}`} style={{ width: `${(f.workload / 20) * 100}%` }} />
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">{Math.round((f.workload / 20) * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Faculty Leave Requests</h3>
            <Badge tone="warn">{leaves.length} Pending</Badge>
          </div>
          <div className="space-y-3">
            {leaves.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">All requests processed.</p>
            ) : leaves.map(l => (
              <div key={l.id} className="p-3 border rounded-xl text-xs bg-slate-50/50">
                <div className="flex justify-between mb-1">
                  <span className="font-bold">{l.faculty}</span>
                  <span className="text-slate-400 font-mono text-[10px]">{l.dates}</span>
                </div>
                <p className="text-slate-500">{l.reason} ({l.days} days)</p>
                <div className="flex gap-2 justify-end mt-2">
                  <button onClick={() => handleRejectLeave(l.id, l.faculty)} className="px-2 py-0.5 rounded border text-rose-600 hover:bg-rose-50 text-[10px] font-bold">Decline</button>
                  <button onClick={() => handleApproveLeave(l.id, l.faculty)} className="px-2 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-700 text-[10px] font-bold">Approve</button>
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
                <AlertTriangle className="size-4 text-amber-500" /> Attendance Warning Board
              </h3>
              <p className="text-[10px] text-muted-foreground">Students with {'<'}75% attendance</p>
            </div>
            <button onClick={() => toast.success(`Warning emails sent to ${warnings.length} students.`)} className="text-xs text-blue-600 font-bold flex items-center gap-1 cursor-pointer hover:text-blue-800">
              <Mail className="size-3.5" /> Email All
            </button>
          </div>
          <div className="space-y-3">
            {warnings.map(w => (
              <div key={w.id} className="p-3 border rounded-xl flex items-center justify-between text-xs hover:bg-slate-50/50 transition">
                <div>
                  <div className="font-bold text-slate-800">{w.name}</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">Roll: {w.roll} • Sec: {w.section}</div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="font-bold text-rose-600">{w.attendance}%</span>
                    <div className="text-[9px] text-muted-foreground">Attendance</div>
                  </div>
                  <button onClick={() => handleSendWarningSMS(w.name, w.roll)} className="px-2.5 py-1 rounded-lg border text-blue-600 hover:bg-blue-50 font-bold text-[10px]">
                    Parent SMS
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="font-semibold text-sm">Subject-wise Results</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Pass % across core subjects</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer>
              <BarChart data={subjectResults}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="subject" fontSize={10} stroke="#64748B" />
                <YAxis fontSize={10} stroke="#64748B" domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="pass" name="Pass %" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fail" name="Fail %" fill="#fca5a5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            <button onClick={() => toast.success(`${deptName} circular posted to student portals!`)} className="w-full py-2 rounded-xl border flex items-center gap-2 justify-center text-xs font-bold hover:bg-slate-50 transition cursor-pointer">
              <FileText className="size-3.5 text-slate-500" /> Post Dept Circular
            </button>
            <button onClick={() => toast.success('Faculty audit alerts triggered.')} className="w-full py-2 rounded-xl bg-blue-600 text-white flex items-center gap-2 justify-center text-xs font-bold hover:bg-blue-700 transition cursor-pointer">
              <CheckCircle className="size-3.5 text-white" /> Trigger Faculty Audit
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
