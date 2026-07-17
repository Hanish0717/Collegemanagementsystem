import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Activity,
  AlertTriangle,
  Mail,
  CheckCircle,
  XCircle,
  FileText,
} from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { toast } from 'sonner';

export function HodDashboard() {
  const [facultyRoster, setFacultyRoster] = useState([
    {
      name: 'Dr. Srinivas Rao',
      designation: 'Professor',
      workload: 16,
      subject: 'Machine Learning',
    },
    {
      name: 'Mrs. Ananya Sen',
      designation: 'Assistant Professor',
      workload: 14,
      subject: 'Compiler Design',
    },
    {
      name: 'Mr. Ramesh Yadav',
      designation: 'Senior Lecturer',
      workload: 18,
      subject: 'Database Management',
    },
    {
      name: 'Dr. K. Lakshmi',
      designation: 'Associate Professor',
      workload: 12,
      subject: 'Data Structures',
    },
  ]);

  const [warnings, setWarnings] = useState([
    { id: 'STU-402', name: 'Hanish Senapati', roll: 'CS2026101', attendance: 68, section: 'A' },
    { id: 'STU-415', name: 'Varun Verma', roll: 'CS2026115', attendance: 72, section: 'B' },
    { id: 'STU-422', name: 'Nikita Reddy', roll: 'CS2026122', attendance: 65, section: 'C' },
  ]);

  const [leaves, setLeaves] = useState([
    {
      id: 'L-802',
      faculty: 'Mrs. Ananya Sen',
      days: 3,
      dates: 'July 20-22',
      reason: 'Family Event',
    },
    {
      id: 'L-810',
      faculty: 'Dr. Srinivas Rao',
      days: 1,
      dates: 'July 25',
      reason: 'Medical Checkup',
    },
  ]);

  const handleApproveLeave = (id: string, name: string) => {
    setLeaves((prev) => prev.filter((l) => l.id !== id));
    toast.success(`Leave request approved for ${name}`);
  };

  const handleRejectLeave = (id: string, name: string) => {
    setLeaves((prev) => prev.filter((l) => l.id !== id));
    toast.warning(`Leave request declined for ${name}`);
  };

  const handleSendWarningSMS = (name: string, roll: string) => {
    toast.success(`Warning SMS broadcasted to parents of ${name} (${roll})`);
  };

  const handleEmailAllDefaulters = () => {
    toast.success(
      `Automated attendance warning emails dispatched to ${warnings.length} student portals.`,
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="HOD Departmental Console (CSE)"
        desc="Oversee Computer Science department roster, track faculty teaching workloads, and audit student attendance warnings."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="CSE Students"
          value="2,140"
          change="3 Sections per Year"
          icon={Users}
          gradient="bg-gradient-primary"
        />
        <StatCard
          label="CSE Faculty"
          value="86"
          change="Average workload: 14.5 hrs"
          icon={GraduationCap}
          gradient="bg-gradient-violet"
        />
        <StatCard
          label="Scheduled Classes Today"
          value="24 periods"
          change="100% faculty checked-in"
          icon={CalendarCheck}
          gradient="bg-gradient-cyan"
        />
        <StatCard
          label="Daily Attendance Average"
          value="94.2%"
          change="1.2% higher than yesterday"
          icon={Activity}
          gradient="bg-gradient-primary"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Faculty Workload Table */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-3">CSE Faculty Workload Allocation</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Faculty Member</th>
                  <th className="text-left pb-2">Designation</th>
                  <th className="text-left pb-2">Core Subject</th>
                  <th className="text-center pb-2">Teaching Hours/Week</th>
                  <th className="text-right pb-2">Load Bar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facultyRoster.map((f) => (
                  <tr key={f.name} className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-slate-800">{f.name}</td>
                    <td className="py-2.5 text-slate-500 font-medium">{f.designation}</td>
                    <td className="py-2.5 font-medium">{f.subject}</td>
                    <td className="py-2.5 text-center font-bold text-indigo-700">
                      {f.workload} hrs
                    </td>
                    <td className="py-2.5 text-right w-32">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="font-mono text-[10px] text-slate-400">
                          {Math.round((f.workload / 20) * 100)}%
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${f.workload >= 18 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                            style={{ width: `${(f.workload / 20) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Staff Leaves approval */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 text-sm">Faculty Leave Requests</h3>
            <Badge tone="warn">{leaves.length} Pending</Badge>
          </div>
          <div className="space-y-3">
            {leaves.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-6">
                All department leave requests processed.
              </div>
            ) : (
              leaves.map((l) => (
                <div
                  key={l.id}
                  className="p-3 border rounded-xl space-y-2 text-xs bg-slate-50/50 hover:bg-slate-50 transition"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{l.faculty}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{l.dates}</span>
                  </div>
                  <p className="text-slate-500 font-medium">
                    Reason: {l.reason} ({l.days} Days)
                  </p>
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      onClick={() => handleRejectLeave(l.id, l.faculty)}
                      className="px-2 py-0.5 rounded border text-rose-600 hover:bg-rose-50 text-[10px] font-bold transition"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleApproveLeave(l.id, l.faculty)}
                      className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Attendance Defaulters Warnings */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                <AlertTriangle className="size-4 text-amber-500" /> Attendance Warning Board
                (&lt;75% Attendance)
              </h3>
              <p className="text-[10px] text-slate-500">
                Auto-calculated from biometric attendance databases.
              </p>
            </div>
            <button
              onClick={handleEmailAllDefaulters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Mail className="size-3.5" /> Email All
            </button>
          </div>
          <div className="space-y-3">
            {warnings.map((w) => (
              <div
                key={w.id}
                className="p-3 border rounded-xl flex items-center justify-between text-xs hover:bg-slate-50/50 transition"
              >
                <div>
                  <div className="font-bold text-slate-800">{w.name}</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">
                    Roll No: {w.roll} • Sec: {w.section}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="font-bold text-rose-600">{w.attendance}%</span>
                    <div className="text-[9px] text-muted-foreground">Attendance</div>
                  </div>
                  <button
                    onClick={() => handleSendWarningSMS(w.name, w.roll)}
                    className="px-2.5 py-1 rounded-lg border text-indigo-600 hover:bg-indigo-50 font-bold transition text-[10px]"
                  >
                    Parent SMS
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Dept Circular board */}
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="font-semibold mb-2">Department Circulars</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Post instructions to CSE student portals, schedule faculty staff meetings, or modify
              course syllabi notifications.
            </p>
          </div>
          <div className="space-y-2 mt-4">
            <button
              onClick={() => {
                toast.success('CSE Student Portal Circular successfully posted!');
              }}
              className="w-full py-2.5 rounded-xl border flex items-center gap-2.5 justify-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <FileText className="size-4 text-slate-500" />
              <span>Post Student Portal Circular</span>
            </button>
            <button
              onClick={() => {
                toast.success(
                  'Automated notifications generated for NBA Criteria 2 Course Files audits.',
                );
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white flex items-center gap-2.5 justify-center text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              <CheckCircle className="size-4 text-emerald-400" />
              <span>Trigger Faculty Audit Alert</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
