import { useState } from 'react';
import {
  BookOpen, Building2, Users, Award, AlertTriangle, Download, CheckCircle, Search, Filter, ShieldAlert
} from 'lucide-react';
import { Badge, Card, StatCard } from '@/components/dashboard/ui';
import { exportToCSV } from '@/lib/exportUtils';
import { toast } from 'sonner';

export function DeanExaminationAdmin() {
  const [activeTab, setActiveTab] = useState<'schedules' | 'revaluation' | 'malpractice'>('schedules');
  const [searchTerm, setSearchTerm] = useState('');

  const [examSchedules, setExamSchedules] = useState([
    { code: 'CS-SEM5-2026', program: 'B.Tech CSE', semester: 'Sem V', dates: 'Nov 10 - Nov 24, 2026', totalPapers: 6, status: 'Sanctioned by Dean' },
    { code: 'EC-SEM5-2026', program: 'B.Tech ECE', semester: 'Sem V', dates: 'Nov 10 - Nov 24, 2026', totalPapers: 6, status: 'Sanctioned by Dean' },
    { code: 'ME-SEM3-2026', program: 'B.Tech ME', semester: 'Sem III', dates: 'Nov 12 - Nov 26, 2026', totalPapers: 5, status: 'Pending Sanction' },
    { code: 'EE-SEM7-2026', program: 'B.Tech EEE', semester: 'Sem VII', dates: 'Nov 08 - Nov 20, 2026', totalPapers: 5, status: 'Sanctioned by Dean' },
  ]);

  const [revaluationAppeals, setRevaluationAppeals] = useState([
    { id: 'REV-901', roll: 'CS2026014', name: 'Aniket Verma', subject: 'Compiler Design', originalMarks: 32, revisedMarks: 41, status: 'Pending Final Dean Approval' },
    { id: 'REV-902', roll: 'EC2026088', name: 'Sanya Malhotra', subject: 'Digital Signal Processing', originalMarks: 28, revisedMarks: 36, status: 'Pending Final Dean Approval' },
    { id: 'REV-903', roll: 'ME2026022', name: 'Karan Patel', subject: 'Thermodynamics', originalMarks: 34, revisedMarks: 35, status: 'Approved' },
  ]);

  const handleApproveRevaluation = (id: string, name: string) => {
    setRevaluationAppeals(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved & Grade Updated' } : r));
    toast.success(`Approved revaluation appeal for ${name} (${id})`);
  };

  const handleSanctionSchedule = (code: string) => {
    setExamSchedules(prev => prev.map(s => s.code === code ? { ...s, status: 'Sanctioned by Dean' } : s));
    toast.success(`Exam Schedule ${code} sanctioned for publication.`);
  };

  const handleExportExamData = () => {
    exportToCSV('Dean_Exam_Schedules', [
      { header: 'Schedule Code', key: 'code' },
      { header: 'Program', key: 'program' },
      { header: 'Semester', key: 'semester' },
      { header: 'Exam Dates', key: 'dates' },
      { header: 'Papers', key: 'totalPapers' },
      { header: 'Status', key: 'status' },
    ], examSchedules);
    toast.success('Exported Exam Governance Data to CSV.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              DEAN EXECUTIVE SUITE
            </span>
            <span className="text-xs text-slate-400 font-mono">Examination Governance</span>
          </div>
          <h1 className="text-2xl font-black text-white">Examination Governance & Result Sanctions</h1>
          <p className="text-xs text-slate-400 mt-1">
            End-semester examination schedule approvals, grace marks sanctions, revaluation final decisions, and malpractice committee reports.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportExamData}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <Download className="size-4" /> Export Exam Data
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Exam Candidates" value="4,820" change="All Departments" icon={Users} />
        <StatCard label="End-Sem Schedules" value={String(examSchedules.length)} change="Sanctioned" icon={BookOpen} />
        <StatCard label="Revaluation Appeals" value={String(revaluationAppeals.length)} change="Under Review" icon={Award} />
        <StatCard label="Malpractice Incidents" value="0" change="Clean Record" icon={AlertTriangle} />
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('schedules')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
            activeTab === 'schedules' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400'
          }`}
        >
          End-Sem Timetables ({examSchedules.length})
        </button>
        <button
          onClick={() => setActiveTab('revaluation')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
            activeTab === 'revaluation' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400'
          }`}
        >
          Revaluation Appeals ({revaluationAppeals.length})
        </button>
        <button
          onClick={() => setActiveTab('malpractice')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
            activeTab === 'malpractice' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-400'
          }`}
        >
          Malpractice Committee Log (0)
        </button>
      </div>

      {/* TAB CONTENT: END-SEM SCHEDULES */}
      {activeTab === 'schedules' && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">End-Semester Examination Sanctions Queue</h3>
              <p className="text-xs text-slate-500">Official timetable sanctioning prior to Controller of Exams publishing</p>
            </div>
            <button
              onClick={() => toast.success('All examination results sanctioned and published to Student Portal.')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <CheckCircle className="size-4" /> Publish End-Sem Results
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-2">Schedule Code</th>
                  <th className="pb-2">Program & Sem</th>
                  <th className="pb-2">Date Range</th>
                  <th className="pb-2">Papers</th>
                  <th className="pb-2">Sanction Status</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {examSchedules.map(sch => (
                  <tr key={sch.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 font-mono font-extrabold text-blue-600">{sch.code}</td>
                    <td className="py-3 font-extrabold text-slate-900 dark:text-white">{sch.program} ({sch.semester})</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{sch.dates}</td>
                    <td className="py-3 font-bold text-slate-700 dark:text-slate-300">{sch.totalPapers} Subjects</td>
                    <td className="py-3">
                      <Badge tone={sch.status.includes('Sanctioned') ? 'success' : 'warn'}>
                        {sch.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      {sch.status.includes('Pending') ? (
                        <button
                          onClick={() => handleSanctionSchedule(sch.code)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer"
                        >
                          Sanction Schedule
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                          <CheckCircle className="size-3.5" /> Sanctioned
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB CONTENT: REVALUATION APPEALS */}
      {activeTab === 'revaluation' && (
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">Revaluation & Grade Improvement Appeals</h3>
          <div className="space-y-3">
            {revaluationAppeals.map((rev) => (
              <div key={rev.id} className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-800/40">
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white">{rev.name} ({rev.roll}) — {rev.subject}</div>
                  <div className="text-slate-500 mt-0.5">Original Marks: {rev.originalMarks} ➔ Re-eval Marks: <strong className="text-emerald-600">{rev.revisedMarks}</strong> • Status: {rev.status}</div>
                </div>

                {rev.status.includes('Pending') ? (
                  <button
                    onClick={() => handleApproveRevaluation(rev.id, rev.name)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition shadow-md"
                  >
                    Approve Grade Change
                  </button>
                ) : (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle className="size-4" /> Approved
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB CONTENT: MALPRACTICE */}
      {activeTab === 'malpractice' && (
        <Card className="p-8 text-center">
          <ShieldAlert className="size-8 text-emerald-600 mx-auto mb-2" />
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Zero Malpractice Incidents Reported</h3>
          <p className="text-xs text-slate-500 mt-1">End-semester exams conducted under strict Dean squad surveillance with 100% compliance.</p>
        </Card>
      )}
    </div>
  );
}
