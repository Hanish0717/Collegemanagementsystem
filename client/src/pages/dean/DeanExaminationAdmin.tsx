import { useState } from 'react';
import {
  BookOpen, FileText, CheckCircle, Clock, Download, Printer, Plus,
  Award, ShieldAlert, Users, Search, AlertTriangle, ShieldCheck, Lock,
  CalendarCheck, Building2, Send, Filter, Check, X, RefreshCw, Layers,
  FileSpreadsheet, HelpCircle, FileCheck, UserCheck, Eye, Upload, FileCode
} from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { exportToCSV, printReport } from '@/lib/exportUtils';
import { toast } from 'sonner';

type ExamSubTab =
  | 'overview'
  | 'schedules'
  | 'hall_tickets'
  | 'question_papers'
  | 'exam_centers'
  | 'invigilators'
  | 'seating'
  | 'attendance'
  | 'internal_marks'
  | 'external_marks'
  | 'results'
  | 'revaluation'
  | 'grace_marks'
  | 'malpractice'
  | 'notifications'
  | 'reports';

export function DeanExaminationAdmin() {
  const [activeTab, setActiveTab] = useState<ExamSubTab>('overview');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // 1. EXAM SCHEDULES STATE
  const [examSchedules, setExamSchedules] = useState([
    { id: 'SCH-101', code: 'CS-501', subject: 'Compiler Design', dept: 'CSE', date: '2026-11-10', session: 'FN (10:00 - 13:00)', room: 'LH-101 to LH-104', candidates: 180, status: 'Sanctioned' },
    { id: 'SCH-102', code: 'EC-502', subject: 'Digital Signal Processing', dept: 'ECE', date: '2026-11-12', session: 'FN (10:00 - 13:00)', room: 'LH-201 to LH-203', candidates: 140, status: 'Sanctioned' },
    { id: 'SCH-103', code: 'ME-301', subject: 'Fluid Mechanics', dept: 'ME', date: '2026-11-14', session: 'AN (14:00 - 17:00)', room: 'LH-301 to LH-302', candidates: 110, status: 'Pending Sanction' },
    { id: 'SCH-104', code: 'EE-701', subject: 'Power Systems Analysis', dept: 'EEE', date: '2026-11-16', session: 'FN (10:00 - 13:00)', room: 'LH-105 to LH-106', candidates: 95, status: 'Sanctioned' },
  ]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ code: '', subject: '', dept: 'CSE', date: '2026-11-20', session: 'FN (10:00 - 13:00)', room: 'LH-101', candidates: '60' });

  // 2. HALL TICKETS STATE
  const [hallTickets, setHallTickets] = useState([
    { roll: 'CS2026001', student: 'Aarav Patel', dept: 'CSE', sem: 'Sem V', feeStatus: 'Paid', eligibility: 'Eligible', ticketStatus: 'Approved & Published' },
    { roll: 'CS2026012', student: 'Rohan Sharma', dept: 'CSE', sem: 'Sem V', feeStatus: 'Paid', eligibility: 'Detained (<65% Att)', ticketStatus: 'Withheld (Attendance)' },
    { roll: 'EC2026045', student: 'Priya Patel', dept: 'ECE', sem: 'Sem V', feeStatus: 'Pending', eligibility: 'Eligible', ticketStatus: 'Withheld (Fee Dues)' },
    { roll: 'ME2026019', student: 'Aditya Verma', dept: 'ME', sem: 'Sem III', feeStatus: 'Paid', eligibility: 'Eligible', ticketStatus: 'Approved & Published' },
  ]);

  // 3. QUESTION PAPERS STATE
  const [questionPapers, setQuestionPapers] = useState([
    { code: 'CS-501', subject: 'Compiler Design', setter: 'Dr. Srinivas Rao', encrypted: true, status: 'COE Approved & Locked' },
    { code: 'EC-502', subject: 'Digital Signal Processing', setter: 'Mrs. Ananya Sen', encrypted: true, status: 'COE Approved & Locked' },
    { code: 'ME-301', subject: 'Fluid Mechanics', setter: 'Mr. Ramesh Yadav', encrypted: false, status: 'Pending Encryption & COE Review' },
  ]);

  // 4. EXAM CENTERS STATE
  const [examCenters, setExamCenters] = useState([
    { id: 'CTR-1', name: 'Main Academic Block A', capacity: 600, chief: 'Dr. V. K. Sharma', rooms: 12, status: 'Active' },
    { id: 'CTR-2', name: 'Science & Tech Complex B', capacity: 450, chief: 'Dr. K. Lakshmi', rooms: 9, status: 'Active' },
    { id: 'CTR-3', name: 'New Engineering Wing C', capacity: 300, chief: 'Prof. S. Rao', rooms: 6, status: 'Standby' },
  ]);

  // 5. INVIGILATORS STATE
  const [invigilators, setInvigilators] = useState([
    { empId: 'FAC-101', name: 'Dr. Srinivas Rao', dept: 'CSE', hall: 'LH-101', date: '2026-11-10', status: 'Assigned' },
    { empId: 'FAC-102', name: 'Mrs. Ananya Sen', dept: 'ECE', hall: 'LH-201', date: '2026-11-12', status: 'Assigned' },
    { empId: 'FAC-103', name: 'Mr. Ramesh Yadav', dept: 'ME', hall: 'LH-301', date: '2026-11-14', status: 'Pending Confirmation' },
  ]);

  // 6. INTERNAL MARKS STATE
  const [internalMarks, setInternalMarks] = useState([
    { code: 'CS-501', subject: 'Compiler Design', faculty: 'Dr. Srinivas Rao', enrolled: 180, submitted: 180, status: 'Frozen by COE' },
    { code: 'EC-502', subject: 'Digital Signal Processing', faculty: 'Mrs. Ananya Sen', enrolled: 140, submitted: 140, status: 'Frozen by COE' },
    { code: 'ME-301', subject: 'Fluid Mechanics', faculty: 'Mr. Ramesh Yadav', enrolled: 110, submitted: 110, status: 'Pending COE Freeze' },
  ]);

  // 7. EXTERNAL MARKS & RESULTS STATE
  const [resultsState, setResultsState] = useState([
    { sem: 'Sem V B.Tech CSE', total: 180, passed: 172, failed: 8, passPct: '95.5%', status: 'Published' },
    { sem: 'Sem V B.Tech ECE', total: 140, passed: 129, failed: 11, passPct: '92.1%', status: 'Published' },
    { sem: 'Sem III B.Tech ME', total: 110, passed: 97, failed: 13, passPct: '88.1%', status: 'Pending Final COE Approval' },
  ]);

  // 8. REVALUATION APPEALS STATE
  const [revaluations, setRevaluations] = useState([
    { id: 'REV-901', roll: 'CS2026014', name: 'Aniket Verma', subject: 'Compiler Design', origMarks: 32, revMarks: 41, status: 'Pending COE Sanction' },
    { id: 'REV-902', roll: 'EC2026088', name: 'Sanya Malhotra', subject: 'Digital Signal Processing', origMarks: 28, revMarks: 36, status: 'Pending COE Sanction' },
    { id: 'REV-903', roll: 'ME2026022', name: 'Karan Patel', subject: 'Thermodynamics', origMarks: 34, revMarks: 35, status: 'Approved & Grade Updated' },
  ]);

  // 9. GRACE MARKS STATE
  const [graceStudents, setGraceStudents] = useState([
    { roll: 'CS2026077', name: 'Vikas Kumar', subject: 'Data Structures', currentMarks: 33, graceNeeded: 2, verdict: 'Eligible (+2 Grace)', status: 'Pending COE Sanction' },
    { roll: 'EC2026099', name: 'Neha Singh', subject: 'Microprocessors', currentMarks: 34, graceNeeded: 1, verdict: 'Eligible (+1 Grace)', status: 'Pending COE Sanction' },
  ]);

  // 10. MALPRACTICE CASES STATE
  const [malpracticeCases, setMalpracticeCases] = useState([
    { id: 'MAL-201', roll: 'CS2026088', name: 'Karan Malhotra', subject: 'Compiler Design', hall: 'LH-102', incident: 'Unauthorized Notes In Exam Hall', recommendation: 'Cancel Subject Exam & Fine ₹2000', status: 'Pending COE Final Verdict' }
  ]);

  // Handlers for COE Actions
  const handleSanctionSchedule = (id: string, code: string) => {
    setExamSchedules(prev => prev.map(s => s.id === id ? { ...s, status: 'Sanctioned' } : s));
    toast.success(`[COE Action] Exam schedule ${code} sanctioned and published.`);
  };

  const handleApproveHallTicket = (roll: string) => {
    setHallTickets(prev => prev.map(h => h.roll === roll ? { ...h, ticketStatus: 'Approved & Published' } : h));
    toast.success(`[COE Action] Hall Ticket approved for student ${roll}.`);
  };

  const handleApproveQuestionPaper = (code: string) => {
    setQuestionPapers(prev => prev.map(q => q.code === code ? { ...q, encrypted: true, status: 'COE Approved & Locked' } : q));
    toast.success(`[COE Action] Question paper for ${code} encrypted and approved.`);
  };

  const handleFreezeInternalMarks = (code: string) => {
    setInternalMarks(prev => prev.map(m => m.code === code ? { ...m, status: 'Frozen by COE' } : m));
    toast.success(`[COE Action] Internal marks for ${code} frozen into database.`);
  };

  const handleApproveResults = (sem: string) => {
    setResultsState(prev => prev.map(r => r.sem === sem ? { ...r, status: 'Published' } : r));
    toast.success(`[COE Action] End-semester results for ${sem} approved and published to Student Portal!`);
  };

  const handleApproveRevaluation = (id: string, name: string) => {
    setRevaluations(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved & Grade Updated' } : r));
    toast.success(`[COE Action] Revaluation mark revision sanctioned for ${name} (${id}).`);
  };

  const handleSanctionGraceMarks = (roll: string, name: string) => {
    setGraceStudents(prev => prev.map(g => g.roll === roll ? { ...g, status: 'Sanctioned & Updated' } : g));
    toast.success(`[COE Action] Grace marks sanctioned for ${name} (${roll}).`);
  };

  const handleExecuteMalpracticeVerdict = (id: string, name: string) => {
    setMalpracticeCases(prev => prev.map(m => m.id === id ? { ...m, status: 'Verdict Executed & Debarred' } : m));
    toast.success(`[COE Action] Disciplinary verdict enforced for ${name} (${id}).`);
  };

  const handleExportCOEReport = () => {
    exportToCSV('COE_Master_Examination_Report', [
      { header: 'Schedule Code', key: 'code' },
      { header: 'Subject Title', key: 'subject' },
      { header: 'Department', key: 'dept' },
      { header: 'Exam Date', key: 'date' },
      { header: 'Exam Session', key: 'session' },
      { header: 'Exam Hall', key: 'room' },
      { header: 'Candidates', key: 'candidates' },
      { header: 'Status', key: 'status' },
    ], examSchedules);
    toast.success('Downloaded COE Master Examination Report CSV!');
  };

  const handlePrintHallTicketSample = (roll: string) => {
    printReport(
      'OFFICE OF THE CONTROLLER OF EXAMINATIONS — HALL TICKET',
      `Candidate Roll Number: ${roll} • End-Semester Examinations 2026`,
      [
        { header: 'Subject Code', key: 'code' },
        { header: 'Subject Title', key: 'subject' },
        { header: 'Exam Date', key: 'date' },
        { header: 'Session', key: 'session' },
        { header: 'Exam Hall', key: 'room' },
      ],
      examSchedules
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR — CONTROLLER OF EXAMINATIONS */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              OFFICE OF THE CONTROLLER OF EXAMINATIONS (COE)
            </span>
            <span className="text-xs text-slate-400 font-mono">Exam Governance Suite</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <BookOpen className="size-6 text-blue-400" /> Examination Control & Governance Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            End-to-end examination administration: Timetables, Hall Tickets, Encrypted Question Papers, Invigilation Rosters, Marks Moderation, Grace Marks & Result Publication.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer transition"
          >
            <Plus className="size-4" /> Create Exam Schedule
          </button>
          <button
            onClick={handleExportCOEReport}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition"
          >
            <Download className="size-4 text-blue-400" /> Export COE Report
          </button>
        </div>
      </div>

      {/* OVERVIEW KPI METRICS (9 REQUIRED COE CARDS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        <StatCard label="Total Exams" value="36" change="Scheduled" icon={BookOpen} />
        <StatCard label="Upcoming" value="14" change="Next 15 Days" icon={Clock} />
        <StatCard label="Completed" value="22" change="Evaluated" icon={CheckCircle} />
        <StatCard label="Pending Tickets" value="180" change="Fee/Att Dues" icon={Users} />
        <StatCard label="Pending Results" value="4" change="In Moderation" icon={Award} />
        <StatCard label="Revaluation" value="14" change="Appeals" icon={FileCheck} />
        <StatCard label="Malpractice" value="1" change="Under Review" icon={ShieldAlert} />
        <StatCard label="Circulars" value="6" change="Published" icon={Send} />
        <StatCard label="COE Approvals" value="8" change="Action Needed" icon={AlertTriangle} />
      </div>

      {/* 17 SUB-TAB SIDEBAR / TOP BAR NAVIGATION */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs scrollbar-thin">
        {[
          { id: 'overview', label: 'Dashboard Overview' },
          { id: 'schedules', label: `Exam Schedules (${examSchedules.length})` },
          { id: 'hall_tickets', label: `Hall Tickets (${hallTickets.length})` },
          { id: 'question_papers', label: `Question Papers (${questionPapers.length})` },
          { id: 'exam_centers', label: `Exam Centers (${examCenters.length})` },
          { id: 'invigilators', label: `Invigilator Roster (${invigilators.length})` },
          { id: 'seating', label: 'Seating Layout' },
          { id: 'attendance', label: 'Exam Hall Attendance' },
          { id: 'internal_marks', label: 'Internal Marks' },
          { id: 'external_marks', label: 'External Marks' },
          { id: 'results', label: 'Result Processing' },
          { id: 'revaluation', label: `Revaluation (${revaluations.length})` },
          { id: 'grace_marks', label: `Grace Marks (${graceStudents.length})` },
          { id: 'malpractice', label: `Malpractice (${malpracticeCases.length})` },
          { id: 'notifications', label: 'Exam Circulars' },
          { id: 'reports', label: 'COE Reports' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ExamSubTab)}
            className={`px-3.5 py-2 rounded-xl font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Active End-Semester Timetables</h3>
                  <p className="text-xs text-slate-500">Official COE schedule queue pending publication</p>
                </div>
                <button
                  onClick={() => toast.success('All end-semester schedules published to student portal.')}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                >
                  Publish All Schedules
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b text-slate-400">
                      <th className="pb-2">Code</th>
                      <th className="pb-2">Subject Name</th>
                      <th className="pb-2">Date & Session</th>
                      <th className="pb-2">Halls</th>
                      <th className="pb-2 text-center">Candidates</th>
                      <th className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {examSchedules.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 font-mono text-blue-600 font-extrabold">{s.code}</td>
                        <td className="py-2.5 font-bold text-slate-900 dark:text-white">{s.subject}</td>
                        <td className="py-2.5 text-slate-600 dark:text-slate-300">{s.date} ({s.session})</td>
                        <td className="py-2.5 text-slate-500">{s.room}</td>
                        <td className="py-2.5 text-center font-bold">{s.candidates}</td>
                        <td className="py-2.5 text-right">
                          <Badge tone={s.status === 'Sanctioned' ? 'success' : 'warn'} className="text-[9px]">
                            {s.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Pending Result Approvals (Semester-wise)</h3>
              <div className="space-y-3">
                {resultsState.map(r => (
                  <div key={r.sem} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-800/40">
                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-white">{r.sem}</div>
                      <div className="text-slate-500 mt-0.5">Enrolled: {r.total} • Passed: {r.passed} • Pass Rate: <strong className="text-emerald-600">{r.passPct}</strong></div>
                    </div>
                    {r.status === 'Published' ? (
                      <Badge tone="success" className="text-[10px]">Published</Badge>
                    ) : (
                      <button
                        onClick={() => handleApproveResults(r.sem)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md"
                      >
                        Approve & Publish Result
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-5">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">Malpractice & Disciplinary Queue</h3>
              {malpracticeCases.map(m => (
                <div key={m.id} className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-950/20 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-rose-600">{m.id}</span>
                    <Badge tone="danger" className="text-[9px]">{m.status}</Badge>
                  </div>
                  <div className="font-extrabold text-slate-900 dark:text-white">{m.name} ({m.roll})</div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">Infraction: {m.incident}</p>
                  <p className="text-slate-500 text-[11px]">Verdict: <strong>{m.recommendation}</strong></p>
                  <button
                    onClick={() => handleExecuteMalpracticeVerdict(m.id, m.name)}
                    className="w-full py-1.5 rounded-xl bg-rose-600 text-white font-bold text-[11px] cursor-pointer"
                  >
                    Enforce Disciplinary Action
                  </button>
                </div>
              ))}
            </Card>

            <Card className="p-5">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">COE Action Dock</h3>
              <div className="space-y-2">
                <button onClick={() => handlePrintHallTicketSample('CS2026001')} className="w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                  <span>Print Sample Hall Ticket</span>
                  <Printer className="size-4 text-blue-600" />
                </button>
                <button onClick={() => toast.success('Dispatched hall ticket download alerts to all eligible students.')} className="w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                  <span>Broadcast Hall Ticket SMS</span>
                  <Send className="size-4 text-emerald-600" />
                </button>
                <button onClick={handleExportCOEReport} className="w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                  <span>Generate Master Exam Report</span>
                  <Download className="size-4 text-indigo-600" />
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: EXAM SCHEDULES */}
      {activeTab === 'schedules' && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Exam Timetable & Schedule Control</h3>
            <button onClick={() => setIsScheduleModalOpen(true)} className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer">
              <Plus className="size-4" /> Add Exam Schedule
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="pb-2">Code</th>
                  <th className="pb-2">Subject Title</th>
                  <th className="pb-2">Dept</th>
                  <th className="pb-2">Date & Session</th>
                  <th className="pb-2">Assigned Hall</th>
                  <th className="pb-2 text-center">Candidates</th>
                  <th className="pb-2 text-center">Status</th>
                  <th className="pb-2 text-right">COE Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {examSchedules.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-mono font-extrabold text-blue-600">{s.code}</td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">{s.subject}</td>
                    <td className="py-3 font-bold">{s.dept}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">{s.date} ({s.session})</td>
                    <td className="py-3 text-slate-500">{s.room}</td>
                    <td className="py-3 text-center font-bold text-blue-600">{s.candidates}</td>
                    <td className="py-3 text-center">
                      <Badge tone={s.status === 'Sanctioned' ? 'success' : 'warn'}>{s.status}</Badge>
                    </td>
                    <td className="py-3 text-right">
                      {s.status === 'Pending Sanction' ? (
                        <button onClick={() => handleSanctionSchedule(s.id, s.code)} className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer">
                          Sanction Schedule
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold text-[11px]">Sanctioned ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUB-TAB 3: HALL TICKETS */}
      {activeTab === 'hall_tickets' && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Hall Ticket Management & Clearance Control</h3>
              <p className="text-xs text-slate-500">Approve, withhold or reprint candidate exam admit cards</p>
            </div>
            <button onClick={() => toast.success('Approved all eligible hall tickets campus-wide!')} className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer">
              Approve All Eligible
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="pb-2">Roll Number</th>
                  <th className="pb-2">Candidate Name</th>
                  <th className="pb-2">Dept & Sem</th>
                  <th className="pb-2">Fee Status</th>
                  <th className="pb-2">Attendance Eligibility</th>
                  <th className="pb-2 text-center">Ticket Status</th>
                  <th className="pb-2 text-right">COE Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hallTickets.map(h => (
                  <tr key={h.roll} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-mono font-extrabold text-blue-600">{h.roll}</td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">{h.student}</td>
                    <td className="py-3 text-slate-500">{h.dept} ({h.sem})</td>
                    <td className="py-3 font-bold">{h.feeStatus}</td>
                    <td className="py-3 font-bold text-slate-700 dark:text-slate-300">{h.eligibility}</td>
                    <td className="py-3 text-center">
                      <Badge tone={h.ticketStatus.includes('Approved') ? 'success' : 'danger'}>{h.ticketStatus}</Badge>
                    </td>
                    <td className="py-3 text-right space-x-1">
                      {h.ticketStatus.includes('Withheld') ? (
                        <button onClick={() => handleApproveHallTicket(h.roll)} className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] cursor-pointer">
                          Clear & Approve Ticket
                        </button>
                      ) : (
                        <button onClick={() => handlePrintHallTicketSample(h.roll)} className="px-2.5 py-1 rounded-lg border text-slate-700 dark:text-slate-300 font-bold text-[10px] cursor-pointer hover:bg-slate-100">
                          Reprint Ticket
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUB-TAB 4: QUESTION PAPERS */}
      {activeTab === 'question_papers' && (
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Question Paper Encryption & COE Lock</h3>
          <div className="space-y-3">
            {questionPapers.map(q => (
              <div key={q.code} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-800/40">
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white">{q.code}: {q.subject}</div>
                  <div className="text-slate-500 mt-0.5">Setter: {q.setter} • Security: <strong className="text-indigo-600">{q.encrypted ? 'AES-256 Encrypted' : 'Unencrypted'}</strong></div>
                </div>
                {q.encrypted ? (
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center gap-1">
                    <Lock className="size-3.5" /> COE Locked
                  </span>
                ) : (
                  <button onClick={() => handleApproveQuestionPaper(q.code)} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer hover:bg-indigo-700 shadow-md">
                    Encrypt & COE Approve
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUB-TAB 5: EXAM CENTERS */}
      {activeTab === 'exam_centers' && (
        <div className="grid md:grid-cols-3 gap-4">
          {examCenters.map(c => (
            <Card key={c.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-blue-600 font-black text-xs">{c.id}</span>
                <Badge tone="success">{c.status}</Badge>
              </div>
              <h4 className="font-black text-sm text-slate-900 dark:text-white">{c.name}</h4>
              <div className="text-xs text-slate-500 space-y-1">
                <div>Seating Capacity: <strong className="text-slate-900 dark:text-white">{c.capacity} Candidates</strong></div>
                <div>Chief Superintendent: <strong className="text-slate-900 dark:text-white">{c.chief}</strong></div>
                <div>Allocated Exam Halls: <strong className="text-slate-900 dark:text-white">{c.rooms} Halls</strong></div>
              </div>
              <button onClick={() => toast.success(`Chief Superintendent ${c.chief} re-confirmed for ${c.name}`)} className="w-full py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs cursor-pointer hover:bg-slate-700">
                Manage Allocation
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* SUB-TAB 6: INVIGILATOR ROSTER */}
      {activeTab === 'invigilators' && (
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Faculty Invigilation Roster</h3>
          <div className="space-y-3">
            {invigilators.map(i => (
              <div key={i.empId} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-800/40">
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white">{i.name} ({i.empId})</div>
                  <div className="text-slate-500 mt-0.5">Dept: {i.dept} • Assigned Hall: <strong className="text-blue-600">{i.hall}</strong> • Date: {i.date}</div>
                </div>
                <button onClick={() => toast.success(`Invigilation duty confirmed for ${i.name}`)} className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold cursor-pointer hover:bg-blue-700">
                  Confirm Duty
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUB-TAB 7: SEATING LAYOUT */}
      {activeTab === 'seating' && (
        <Card className="p-6 text-center space-y-3">
          <Layers className="size-10 text-blue-600 mx-auto" />
          <h3 className="font-black text-base text-slate-900 dark:text-white">Automated Seating Matrix & Roll Randomizer</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Generate anti-malpractice seating arrangements mixing CSE, ECE and ME students across 27 examination halls.</p>
          <button onClick={() => toast.success('Auto-generated seating plan for 4,820 candidates across 27 exam halls.')} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer shadow-lg">
            Generate & Lock Seating Matrix
          </button>
        </Card>
      )}

      {/* SUB-TAB 8: EXAM ATTENDANCE */}
      {activeTab === 'attendance' && (
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">Live Exam Hall Attendance Monitor</h3>
          <div className="p-4 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40 text-xs flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">LH-101 (Compiler Design — CS-501)</div>
              <div className="text-slate-500 mt-0.5">Present: 44/45 Candidates • Absent: 1 (Roll: CS2026044)</div>
            </div>
            <button onClick={() => toast.success('Exam Hall Attendance verified and frozen by COE.')} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold cursor-pointer">
              Verify & Freeze Attendance
            </button>
          </div>
        </Card>
      )}

      {/* SUB-TAB 9: INTERNAL MARKS */}
      {activeTab === 'internal_marks' && (
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Internal Assessment Marks Verification</h3>
          <div className="space-y-3">
            {internalMarks.map(m => (
              <div key={m.code} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-800/40">
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white">{m.code}: {m.subject}</div>
                  <div className="text-slate-500 mt-0.5">Faculty: {m.faculty} • Uploaded: {m.submitted}/{m.enrolled} Students</div>
                </div>
                {m.status.includes('Frozen') ? (
                  <Badge tone="success">Frozen</Badge>
                ) : (
                  <button onClick={() => handleFreezeInternalMarks(m.code)} className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer">
                    Approve & Freeze
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUB-TAB 10: EXTERNAL MARKS */}
      {activeTab === 'external_marks' && (
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">External Valuation & Moderation Board</h3>
          <div className="p-4 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40 text-xs flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 dark:text-white">CS-501 Compiler Design (External Valuation)</div>
              <div className="text-slate-500 mt-0.5">Evaluator: Prof. K. R. Sharma (External Examiner) • Papers: 180 • Moderation Score: Normal (+0)</div>
            </div>
            <button onClick={() => toast.success('External marks moderated and approved by COE Board.')} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold cursor-pointer">
              Approve Moderation
            </button>
          </div>
        </Card>
      )}

      {/* SUB-TAB 11: RESULTS PROCESSING */}
      {activeTab === 'results' && (
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">End-Semester Result Processing & SGPA/CGPA Computation</h3>
          <div className="space-y-3">
            {resultsState.map(r => (
              <div key={r.sem} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-800/40">
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white">{r.sem}</div>
                  <div className="text-slate-500 mt-0.5">Pass Rate: <strong className="text-emerald-600">{r.passPct}</strong> ({r.passed}/{r.total} passed)</div>
                </div>
                <button onClick={() => handleApproveResults(r.sem)} className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer">
                  Generate & Publish Results
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUB-TAB 12: REVALUATION */}
      {activeTab === 'revaluation' && (
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Revaluation & Grade Improvement Sanctions</h3>
          <div className="space-y-3">
            {revaluations.map(r => (
              <div key={r.id} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-800/40">
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white">{r.name} ({r.roll}) — {r.subject}</div>
                  <div className="text-slate-500 mt-0.5">Original Mark: {r.origMarks} ➔ Reval Mark: <strong className="text-emerald-600">{r.revMarks}</strong></div>
                </div>
                {r.status.includes('Approved') ? (
                  <Badge tone="success">Approved & Updated</Badge>
                ) : (
                  <button onClick={() => handleApproveRevaluation(r.id, r.name)} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer">
                    Sanction Grade Update
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUB-TAB 13: GRACE MARKS */}
      {activeTab === 'grace_marks' && (
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">COE Grace Marks Sanction Board</h3>
          <div className="space-y-3">
            {graceStudents.map(g => (
              <div key={g.roll} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-800/40">
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white">{g.name} ({g.roll}) — {g.subject}</div>
                  <div className="text-slate-500 mt-0.5">Current Score: {g.currentMarks}/100 • Board Recommendation: <strong className="text-emerald-600">{g.verdict}</strong></div>
                </div>
                {g.status.includes('Sanctioned') ? (
                  <Badge tone="success">Sanctioned</Badge>
                ) : (
                  <button onClick={() => handleSanctionGraceMarks(g.roll, g.name)} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer">
                    Sanction Grace Marks
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUB-TAB 14: MALPRACTICE */}
      {activeTab === 'malpractice' && (
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Malpractice Committee Hearings & Verdicts</h3>
          <div className="space-y-3">
            {malpracticeCases.map(m => (
              <div key={m.id} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs bg-rose-50/50 dark:bg-rose-950/20">
                <div>
                  <div className="font-extrabold text-rose-600">{m.id}: {m.name} ({m.roll})</div>
                  <div className="text-slate-700 dark:text-slate-300 mt-0.5">Subject: {m.subject} • Incident: {m.incident}</div>
                  <div className="text-slate-500 mt-0.5">Committee Recommendation: <strong>{m.recommendation}</strong></div>
                </div>
                {m.status.includes('Executed') ? (
                  <Badge tone="danger">Verdict Executed</Badge>
                ) : (
                  <button onClick={() => handleExecuteMalpracticeVerdict(m.id, m.name)} className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs cursor-pointer">
                    Enforce COE Verdict
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUB-TAB 15: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Publish Exam Circular / Notification</h3>
          </div>
          <div className="space-y-3 text-xs">
            <input type="text" placeholder="Circular Title e.g. End-Semester Examination Schedule November 2026" className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 font-bold" />
            <textarea placeholder="Circular text body..." className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 min-h-[90px]" />
            <button onClick={() => toast.success('COE Exam Circular published to all students and faculty!')} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold cursor-pointer">
              Publish Circular
            </button>
          </div>
        </Card>
      )}

      {/* SUB-TAB 16: REPORTS */}
      {activeTab === 'reports' && (
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Official COE Governance Reports & Exports</h3>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { label: 'Master Exam Schedule Report', desc: 'Complete dates, halls, and candidate distribution' },
              { label: 'Hall Ticket Clearance Report', desc: 'Approved, withheld and fee pending stats' },
              { label: 'End-Sem Result Analysis Report', desc: 'Department-wise pass percentages and toppers' },
              { label: 'Faculty Invigilation Duty Log', desc: 'Staff duty allocation and attendance' },
              { label: 'Revaluation & Grace Sanctions Log', desc: 'Grade improvement audit trail' },
              { label: 'Malpractice Disciplinary Log', desc: 'Committee findings and verdicts' },
            ].map(r => (
              <div key={r.label} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-2">
                <div className="font-extrabold text-slate-900 dark:text-white">{r.label}</div>
                <div className="text-slate-500 text-[11px]">{r.desc}</div>
                <button onClick={handleExportCOEReport} className="w-full py-1.5 rounded-xl bg-blue-600 text-white font-bold text-[11px] cursor-pointer hover:bg-blue-700 flex items-center justify-center gap-1">
                  <Download className="size-3.5" /> Download Report (CSV)
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* CREATE SCHEDULE MODAL */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="size-5 text-blue-600" />
                <h3 className="font-black text-base text-slate-900 dark:text-white">Create Exam Schedule</h3>
              </div>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold mb-1 block">Subject Code</label>
                  <input type="text" value={scheduleForm.code} onChange={e => setScheduleForm({ ...scheduleForm, code: e.target.value })} placeholder="e.g. CS-601" className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 font-bold" />
                </div>
                <div>
                  <label className="font-extrabold mb-1 block">Department</label>
                  <select value={scheduleForm.dept} onChange={e => setScheduleForm({ ...scheduleForm, dept: e.target.value })} className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 font-bold">
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="ME">ME</option>
                    <option value="EEE">EEE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-extrabold mb-1 block">Subject Name</label>
                <input type="text" value={scheduleForm.subject} onChange={e => setScheduleForm({ ...scheduleForm, subject: e.target.value })} placeholder="e.g. Cloud Computing" className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 font-bold" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold mb-1 block">Exam Date</label>
                  <input type="date" value={scheduleForm.date} onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })} className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 font-bold" />
                </div>
                <div>
                  <label className="font-extrabold mb-1 block">Session</label>
                  <select value={scheduleForm.session} onChange={e => setScheduleForm({ ...scheduleForm, session: e.target.value })} className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 font-bold">
                    <option value="FN (10:00 - 13:00)">Forenoon (FN)</option>
                    <option value="AN (14:00 - 17:00)">Afternoon (AN)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button onClick={() => setIsScheduleModalOpen(false)} className="px-4 py-2 rounded-xl border text-xs font-bold">Cancel</button>
              <button
                onClick={() => {
                  if (!scheduleForm.code || !scheduleForm.subject) {
                    toast.error('Please fill subject code and title');
                    return;
                  }
                  const newSch = {
                    id: `SCH-${Math.floor(100 + Math.random() * 900)}`,
                    code: scheduleForm.code,
                    subject: scheduleForm.subject,
                    dept: scheduleForm.dept,
                    date: scheduleForm.date,
                    session: scheduleForm.session,
                    room: scheduleForm.room,
                    candidates: Number(scheduleForm.candidates),
                    status: 'Sanctioned'
                  };
                  setExamSchedules(prev => [newSch, ...prev]);
                  toast.success(`Exam Schedule ${scheduleForm.code} created and sanctioned!`);
                  setIsScheduleModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg"
              >
                Create Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
