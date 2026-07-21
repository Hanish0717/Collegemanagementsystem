import { useState } from 'react';
import {
  BookOpen, FileText, CheckCircle, Clock, Download, Printer, Plus,
  Award, ShieldAlert, Users, Search, AlertTriangle
} from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { exportToCSV, printReport } from '@/lib/exportUtils';
import { toast } from 'sonner';

export function ExaminationControlModule() {
  const [schedules] = useState([
    { code: 'CS-401', subject: 'Compiler Design', date: 'Jul 28', time: '10:00 - 13:00', hall: 'LH-101 to LH-104', candidates: 180, invigilator: 'Dr. Srinivas Rao' },
    { code: 'EC-302', subject: 'Digital Signal Processing', date: 'Jul 29', time: '10:00 - 13:00', hall: 'LH-201 to LH-203', candidates: 140, invigilator: 'Mrs. Ananya Sen' },
    { code: 'ME-201', subject: 'Fluid Mechanics', date: 'Jul 30', time: '10:00 - 13:00', hall: 'LH-301 to LH-302', candidates: 110, invigilator: 'Mr. Ramesh Yadav' },
  ]);

  const [revaluations] = useState([
    { id: 'REV-801', student: 'Rohan Sharma', roll: 'CS2026012', subject: 'Compiler Design', originalMark: 34, expectedGrade: 'B+', status: 'Pending Review' },
    { id: 'REV-802', student: 'Pooja Verma', roll: 'EC2026045', subject: 'Circuit Theory', originalMark: 28, expectedGrade: 'Pass', status: 'Under Re-evaluation' },
  ]);

  const handleExportCSV = () => {
    exportToCSV('Examination_Schedule_2026', [
      { header: 'Subject Code', key: 'code' },
      { header: 'Subject Name', key: 'subject' },
      { header: 'Exam Date', key: 'date' },
      { header: 'Time Slot', key: 'time' },
      { header: 'Exam Hall', key: 'hall' },
      { header: 'Candidates', key: 'candidates' },
      { header: 'Chief Invigilator', key: 'invigilator' },
    ], schedules);
    toast.success('Exam Schedule exported to CSV!');
  };

  const handlePrintHallTicket = (roll: string) => {
    printReport(
      'Official Examination Hall Ticket 2026',
      `Candidate Roll Number: ${roll} — End Semester Examination`,
      [
        { header: 'Subject Code', key: 'code' },
        { header: 'Subject Title', key: 'subject' },
        { header: 'Exam Date', key: 'date' },
        { header: 'Time Slot', key: 'time' },
        { header: 'Exam Hall', key: 'hall' },
      ],
      schedules
    );
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                OFFICE OF THE CONTROLLER OF EXAMINATIONS
              </span>
              <span className="text-xs text-slate-400 font-mono">End-Sem 2026-27</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <BookOpen className="size-7 text-indigo-400" /> Examination Control Suite
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Timetable scheduling, hall ticket generation, invigilation rosters, internal/external marks entry, revaluation appeals & malpractice logging.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleExportCSV} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer">
              <Download className="size-4 text-indigo-400" /> Export CSV
            </button>
            <button onClick={() => handlePrintHallTicket('CS2026001')} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer">
              <Printer className="size-4" /> Print Sample Hall Ticket
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Candidates" value="4,820" change="Hall tickets generated" icon={Users} />
        <StatCard label="Exams Scheduled" value="36" change="Across 6 academic blocks" icon={BookOpen} />
        <StatCard label="Pending Revaluations" value={String(revaluations.length)} change="Under Review" icon={Clock} />
        <StatCard label="Malpractice Incidents" value="0" change="Clean record" icon={ShieldAlert} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Official Examination Timetable</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-400 text-left">
                    <th className="pb-2">Code</th>
                    <th className="pb-2">Subject Title</th>
                    <th className="pb-2">Date & Time</th>
                    <th className="pb-2">Exam Hall</th>
                    <th className="pb-2 text-center">Candidates</th>
                    <th className="pb-2 text-right">Invigilator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {schedules.map(s => (
                    <tr key={s.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-mono text-indigo-600 font-extrabold">{s.code}</td>
                      <td className="py-3 font-bold text-slate-900 dark:text-white">{s.subject}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">
                        {s.date}
                        <div className="text-[10px] text-slate-400 font-mono">{s.time}</div>
                      </td>
                      <td className="py-3 text-slate-700 dark:text-slate-300 font-medium">{s.hall}</td>
                      <td className="py-3 text-center font-bold text-blue-600">{s.candidates}</td>
                      <td className="py-3 text-right font-medium text-slate-600 dark:text-slate-400">{s.invigilator}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Revaluation & Grade Appeals</h3>
            <div className="space-y-3">
              {revaluations.map(r => (
                <div key={r.id} className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-indigo-600 font-bold text-[10px]">{r.id}</span>
                    <Badge tone="warn" className="text-[9px]">{r.status}</Badge>
                  </div>
                  <div className="font-extrabold text-slate-900 dark:text-white">{r.student} ({r.roll})</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{r.subject} • Mark: {r.originalMark}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => toast.success(`Revaluation approved for ${r.student}`)} className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold cursor-pointer">
                      Assign Re-evaluator
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
