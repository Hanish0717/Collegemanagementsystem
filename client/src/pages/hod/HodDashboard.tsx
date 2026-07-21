import { useState } from 'react';
import {
  Users, GraduationCap, CalendarCheck, Activity, AlertTriangle, Mail,
  CheckCircle, FileText, Send, BookOpen, Clock
} from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

export function HodDashboard() {
  const deptName = 'Computer Science & Engineering (CSE)';

  const [facultyRoster] = useState([
    { name: 'Dr. Srinivas Rao', designation: 'Professor', workload: 16, subject: 'Machine Learning', attendance: 98 },
    { name: 'Mrs. Ananya Sen', designation: 'Asst. Professor', workload: 14, subject: 'Compiler Design', attendance: 95 },
    { name: 'Mr. Ramesh Yadav', designation: 'Senior Lecturer', workload: 18, subject: 'Database Systems', attendance: 92 },
    { name: 'Dr. K. Lakshmi', designation: 'Assoc. Professor', workload: 12, subject: 'Data Structures', attendance: 97 },
  ]);

  const [warnings] = useState([
    { id: 'STU-402', name: 'Hanish Senapati', roll: 'CS2026101', attendance: 68, section: 'CSE-A' },
    { id: 'STU-415', name: 'Varun Verma', roll: 'CS2026115', attendance: 72, section: 'CSE-B' },
    { id: 'STU-422', name: 'Nikita Reddy', roll: 'CS2026122', attendance: 65, section: 'CSE-C' },
  ]);

  const subjectResults = [
    { subject: 'Machine Learning', pass: 88, fail: 12 },
    { subject: 'Compiler Design', pass: 82, fail: 18 },
    { subject: 'Database Systems', pass: 91, fail: 9 },
    { subject: 'Data Structures', pass: 85, fail: 15 },
  ];

  const handleSendParentSMS = (name: string, roll: string) => {
    toast.success(`Defaulter warning SMS dispatched to parent of ${name} (${roll})`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`HOD Command Center — ${deptName}`}
        desc="Departmental management: Faculty workload allocations, attendance warnings, subject performance, and timetable coordination."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="CSE Students" value="720" change="Across 4 academic years" icon={Users} />
        <StatCard label="CSE Faculty" value="48" change="Avg 14.5 teaching hrs/week" icon={GraduationCap} />
        <StatCard label="Lectures Today" value="24" change="100% faculty checked-in" icon={CalendarCheck} />
        <StatCard label="Dept Attendance" value="94.2%" change="Highest in Faculty of Eng" icon={Activity} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Faculty Workload Allocations */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Department Faculty Workload Roster</h3>
              <Badge tone="info">{facultyRoster.length} Active Staff</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-400 text-left">
                    <th className="pb-2">Faculty</th>
                    <th className="pb-2">Subject Assigned</th>
                    <th className="pb-2 text-center">Hours / Week</th>
                    <th className="pb-2 text-center">Attendance</th>
                    <th className="pb-2 text-right">Load %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {facultyRoster.map(f => (
                    <tr key={f.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 font-extrabold text-slate-900 dark:text-white">
                        {f.name}
                        <div className="text-[10px] text-slate-400 font-normal">{f.designation}</div>
                      </td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-300">{f.subject}</td>
                      <td className="py-2.5 text-center font-bold text-blue-600">{f.workload} hrs</td>
                      <td className="py-2.5 text-center font-bold text-emerald-600">{f.attendance}%</td>
                      <td className="py-2.5 text-right font-mono font-bold">
                        <div className="flex items-center gap-1.5 justify-end">
                          <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(f.workload / 20) * 100}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-400">{Math.round((f.workload / 20) * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Attendance Warning Ticker */}
          <Card className="p-5 border-amber-200 dark:border-amber-950 bg-amber-50/20 dark:bg-amber-950/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="size-4 text-amber-500" /> Attendance Defaulters ({'<'}75%)
                </h3>
                <p className="text-xs text-slate-500">Students flagged for debarment warning</p>
              </div>
              <button onClick={() => toast.success('Warning emails dispatched to all defaulter parents.')} className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer">
                <Mail className="size-3.5" /> Broadcast All Parent Warnings
              </button>
            </div>

            <div className="space-y-3">
              {warnings.map(w => (
                <div key={w.id} className="p-3.5 rounded-2xl border border-amber-200 dark:border-amber-900 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white">{w.name}</div>
                    <div className="text-[10px] text-slate-400">Roll: {w.roll} • Section: {w.section}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-extrabold text-rose-600 text-xs">{w.attendance}%</span>
                      <div className="text-[9px] text-slate-400">Attendance</div>
                    </div>
                    <button onClick={() => handleSendParentSMS(w.name, w.roll)} className="px-3 py-1 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold cursor-pointer">
                      Send Parent SMS
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Subject-Wise Performance Chart */}
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-2">Subject-wise Result Pass Rate</h3>
          <p className="text-xs text-slate-500 mb-4">Pass % in recent mid-semester examination</p>
          
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={subjectResults}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="subject" fontSize={10} stroke="#64748B" />
                <YAxis fontSize={10} stroke="#64748B" domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="pass" name="Pass %" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            <button onClick={() => toast.success('CSE Circular posted!')} className="w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer">
              <Send className="size-4 text-blue-600" /> Issue Department Circular
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
