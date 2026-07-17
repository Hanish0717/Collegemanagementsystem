import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Calendar,
  Grid,
  TrendingUp,
  Download,
  Search,
  CheckCircle,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { toast } from 'sonner';

export function ExamCellDashboard() {
  const [searchRoll, setSearchRoll] = useState('');
  const [studentDetails, setStudentDetails] = useState<any>(null);

  const [examSchedule, setExamSchedule] = useState([
    {
      id: 'EX-101',
      date: 'July 27',
      subject: 'Machine Learning (ML-502)',
      time: '10:00 AM - 1:00 PM',
      depts: 'CSE, AIML',
      status: 'Scheduled',
    },
    {
      id: 'EX-102',
      date: 'July 28',
      subject: 'Compiler Design (CD-504)',
      time: '10:00 AM - 1:00 PM',
      depts: 'CSE',
      status: 'Scheduled',
    },
    {
      id: 'EX-103',
      date: 'July 29',
      subject: 'VLSI Architecture (VL-701)',
      time: '2:00 PM - 5:00 PM',
      depts: 'ECE',
      status: 'Scheduled',
    },
  ]);

  const [seatingPlans, setSeatingPlans] = useState([
    { hall: 'Block A - Hall 101', capacity: 60, assigned: 60, status: 'Fully Allocated' },
    { hall: 'Block A - Hall 102', capacity: 60, assigned: 45, status: 'Available' },
    { hall: 'Block B - Seminar Hall', capacity: 120, assigned: 0, status: 'Empty' },
  ]);

  const handleSearchStudent = () => {
    if (!searchRoll.trim()) {
      toast.error('Please specify a Student Roll Number!');
      return;
    }
    // Mock student search
    setStudentDetails({
      fullName: 'Hanish Senapati',
      rollNumber: searchRoll.toUpperCase(),
      department: 'Computer Science & Engineering',
      semester: 5,
      section: 'A',
      eligible: true,
      subjects: [
        { code: 'ML-502', name: 'Machine Learning' },
        { code: 'CD-504', name: 'Compiler Design' },
        { code: 'DA-506', name: 'Design & Analysis of Algorithms' },
        { code: 'CN-508', name: 'Computer Networks' },
      ],
      examHalls: 'Block A - Hall 101 (Seat #12)',
    });
    toast.success('Candidate record verified successfully.');
  };

  const handleAutoAllot = () => {
    toast.loading('Running candidate permutation algorithms for seating allocation...', {
      duration: 1500,
    });
    setTimeout(() => {
      setSeatingPlans((prev) =>
        prev.map((p) => ({ ...p, assigned: p.capacity, status: 'Fully Allocated' })),
      );
      toast.success('Examination Seating Allocations optimized and locked across 12 halls!');
    }, 1600);
  };

  const handleReleaseResults = () => {
    toast.success('Semester Results processed and released to Student and Parent portals!');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examination Cell Console"
        desc="Administer candidate seating arrangements, print official candidate hall tickets, schedule examinations, and release grade cards."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Exams Scheduled"
          value="14 Papers"
          change="B.Tech Odd Semesters"
          icon={Calendar}
          gradient="bg-gradient-primary"
        />
        <StatCard
          label="Hall Tickets Dispatched"
          value="5,120"
          change="99.4% eligible roster"
          icon={FileText}
          gradient="bg-gradient-violet"
        />
        <StatCard
          label="Exam Halls Roster"
          value="12 Halls"
          change="Total seating: 1,420 seats"
          icon={Grid}
          gradient="bg-gradient-cyan"
        />
        <StatCard
          label="Academic Result Audits"
          value="3 Terms"
          change="Ready to release results"
          icon={TrendingUp}
          gradient="bg-gradient-primary"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Exam Roster */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-3">Exam Roster &amp; Time Schedules</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Exam Code</th>
                  <th className="text-left pb-2">Subject Title</th>
                  <th className="text-left pb-2">Date</th>
                  <th className="text-left pb-2">Session Timings</th>
                  <th className="text-center pb-2">Target Depts</th>
                  <th className="text-right pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {examSchedule.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-mono font-bold text-indigo-700">{row.id}</td>
                    <td className="py-2.5 font-bold">{row.subject}</td>
                    <td className="py-2.5 font-medium text-slate-600">{row.date}</td>
                    <td className="py-2.5 font-mono text-[10px] text-slate-500">{row.time}</td>
                    <td className="py-2.5 text-center font-semibold text-slate-700">{row.depts}</td>
                    <td className="py-2.5 text-right">
                      <Badge tone="success">{row.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Seating allocation status */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-slate-800 text-sm">Exam Seating Chart</h3>
              <Badge tone="info">Capacity</Badge>
            </div>
            <div className="space-y-3">
              {seatingPlans.map((row) => (
                <div
                  key={row.hall}
                  className="text-xs space-y-1.5 p-2.5 border rounded-xl bg-slate-50/50"
                >
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>{row.hall}</span>
                    <span className="font-mono text-indigo-600">
                      {row.assigned} / {row.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-indigo-600`}
                      style={{ width: `${(row.assigned / row.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={handleAutoAllot}
            className="w-full mt-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer"
          >
            Auto-Allocate Seating Arrangement
          </button>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Hall Ticket Downloader */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-2">Generate &amp; Print Hall Ticket</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Enter Student Roll Number to inspect eligibility and download hall tickets.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. CS2026101"
              value={searchRoll}
              onChange={(e) => setSearchRoll(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border bg-background text-xs focus:border-primary outline-none"
            />
            <button
              onClick={handleSearchStudent}
              className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="size-3.5" /> Verify Roll
            </button>
          </div>

          {studentDetails && (
            <div className="mt-5 p-4 border border-dashed rounded-xl bg-slate-50/50 space-y-4">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{studentDetails.fullName}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Roll: {studentDetails.rollNumber} • {studentDetails.department}
                  </p>
                </div>
                <Badge tone={studentDetails.eligible ? 'success' : 'danger'}>
                  {studentDetails.eligible ? 'ELGIBLE FOR EXAM' : 'DISQUALIFIED'}
                </Badge>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground text-[10px] font-medium block">
                    Allotted Exam Hall
                  </span>
                  <span className="font-semibold text-slate-800">{studentDetails.examHalls}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] font-medium block">
                    Admit Card Status
                  </span>
                  <span className="font-semibold text-slate-800">
                    Approved by Controller of Exams
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground text-[10px] font-medium block mb-1">
                  Registered Subject Papers
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {studentDetails.subjects.map((sub: any) => (
                    <Badge key={sub.code} tone="info" className="text-[9px] font-mono">
                      {sub.code}: {sub.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    toast.success(`Hall Ticket PDF for ${studentDetails.fullName} downloaded!`);
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="size-3.5" /> Download Hall Ticket
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Global actions */}
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="font-semibold mb-2">Publish Result Sets</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upon verifying the external mark sheets, compute GPAs, cross-reference backlogs
              registries, and release grade cards.
            </p>
          </div>
          <div className="space-y-2 mt-6">
            <button
              onClick={handleReleaseResults}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 justify-center text-xs font-bold transition cursor-pointer"
            >
              <UserCheck className="size-4" />
              <span>Release Semester Results</span>
            </button>
            <button
              onClick={() => {
                toast.success('Seating Arrangements saved to database.');
              }}
              className="w-full py-2.5 rounded-xl border flex items-center gap-2 justify-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Lock Current Arrangement
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
