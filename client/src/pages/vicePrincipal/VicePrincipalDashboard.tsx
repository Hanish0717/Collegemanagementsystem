import { useState } from 'react';
import {
  Users, GraduationCap, AlertTriangle, CalendarCheck, Clock,
  CheckCircle, FileText, Send, Building2, ShieldAlert
} from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { toast } from 'sonner';

export function VicePrincipalDashboard() {
  const [disciplineCases, setDisciplineCases] = useState([
    { id: 'DC-301', student: 'Rahul Verma', roll: 'EC2026042', dept: 'ECE', issue: 'Ragging Complaint Flagged', severity: 'critical' },
    { id: 'DC-302', student: 'Anita Rao', roll: 'CS2026088', dept: 'CSE', issue: 'Attendance Defaulter (Below 55%)', severity: 'high' },
    { id: 'DC-303', student: 'Vikash Singh', roll: 'ME2026015', dept: 'ME', issue: 'Proxy Attendance Tampering', severity: 'medium' },
  ]);

  const activePeriods = [
    { period: 'Period 1 (09:00 - 10:00)', subject: 'Compiler Design (CS-401)', faculty: 'Mrs. Ananya Sen', room: 'LH-101', status: 'Ongoing' },
    { period: 'Period 2 (10:00 - 11:00)', subject: 'Digital Signal Proc (EC-302)', faculty: 'Dr. Suresh Kumar', room: 'LH-204', status: 'Ongoing' },
    { period: 'Period 3 (11:15 - 12:15)', subject: 'Fluid Mechanics (ME-201)', faculty: 'Mr. Ramesh Yadav', room: 'LH-302', status: 'Upcoming' },
  ];

  const handleResolveDiscipline = (id: string, student: string) => {
    setDisciplineCases(p => p.filter(d => d.id !== id));
    toast.success(`Discipline case resolved for ${student}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vice Principal — Operations Cockpit"
        desc="Daily academic operations, live lecture schedules, faculty attendance tracking, and student discipline monitoring."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Faculty Check-in Today" value="338 / 342" change="98.8% On-time" icon={GraduationCap} />
        <StatCard label="Active Classes Right Now" value="24" change="Across 6 Academic Blocks" icon={Clock} />
        <StatCard label="Pending Leave Requests" value="4" change="Requires VP Approval" icon={CalendarCheck} />
        <StatCard label="Open Discipline Matters" value={String(disciplineCases.length)} change="Under VP Review" icon={AlertTriangle} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Active Class Schedule Period Tracker */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="size-4 text-blue-600" /> Today's Live Class Period Tracker
                </h3>
                <p className="text-xs text-slate-500">Real-time period schedule across lecture halls</p>
              </div>
              <Badge tone="info">Live Stream</Badge>
            </div>

            <div className="space-y-3">
              {activePeriods.map(p => (
                <div key={p.period} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">{p.period}</span>
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">{p.subject}</span>
                    </div>
                    <p className="text-xs text-slate-500">Faculty: {p.faculty} • Room: <strong className="text-slate-800 dark:text-slate-200">{p.room}</strong></p>
                  </div>
                  <Badge tone={p.status === 'Ongoing' ? 'success' : 'default'} className="text-[9px]">
                    {p.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Student Discipline Tracker */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="size-4 text-rose-500" /> Student Discipline Console
                </h3>
                <p className="text-xs text-slate-500">Active disciplinary complaints requiring VP decision</p>
              </div>
              <Badge tone="danger">{disciplineCases.length} Cases</Badge>
            </div>

            <div className="space-y-3">
              {disciplineCases.map(dc => (
                <div key={dc.id} className="p-3.5 rounded-2xl border border-rose-200 dark:border-rose-950 bg-rose-50/20 dark:bg-rose-950/20 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">{dc.student}</span>
                      <span className="font-mono text-[10px] text-slate-400">{dc.roll} ({dc.dept})</span>
                      <Badge tone={dc.severity === 'critical' ? 'danger' : 'warn'} className="text-[9px] uppercase">
                        {dc.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{dc.issue}</p>
                  </div>
                  <button onClick={() => handleResolveDiscipline(dc.id, dc.student)} className="px-3 py-1.5 rounded-xl border border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50 text-xs font-bold transition cursor-pointer">
                    Resolve Case
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* VP Quick Actions */}
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">VP Operations Control</h3>
          <div className="space-y-2.5">
            <button onClick={() => toast.success('Faculty Memo issued.')} className="w-full p-3 rounded-xl border flex items-center gap-2 text-xs font-bold hover:bg-slate-50 transition cursor-pointer">
              <FileText className="size-4 text-blue-600" /> Issue Faculty Memo
            </button>
            <button onClick={() => toast.success('HOD Operations meeting scheduled.')} className="w-full p-3 rounded-xl border flex items-center gap-2 text-xs font-bold hover:bg-slate-50 transition cursor-pointer">
              <CalendarCheck className="size-4 text-violet-600" /> Schedule HOD Meeting
            </button>
            <button onClick={() => toast.success('Daily Campus Operations Summary exported.')} className="w-full p-3 rounded-xl border flex items-center gap-2 text-xs font-bold hover:bg-slate-50 transition cursor-pointer">
              <Building2 className="size-4 text-emerald-600" /> Daily Campus Audit Report
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
