import { useState, useEffect } from 'react';
import {
  Users, GraduationCap, Award, Building2, CheckCircle, FileText,
  BookOpen, Sparkles, ClipboardList, Send, AlertTriangle, ShieldCheck,
  TrendingUp, BarChart2, Filter, Search, Download, ChevronRight, MessageSquare,
  Clock, Plus, ArrowUpRight, Check, X, RefreshCw
} from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from 'recharts';
import { toast } from 'sonner';
import { ApprovalSystemModal, type ApprovalRequest } from '@/components/common/ApprovalSystemModal';
import { fetchDashboardData, type DashboardStats } from '@/services/dashboardService';
import { DeanStudentAdmin } from '@/pages/dean/DeanStudentAdmin';
import { DeanExaminationAdmin } from '@/pages/dean/DeanExaminationAdmin';
import { DeanAcademicAdmin } from '@/pages/dean/DeanAcademicAdmin';
import { DeanIMAAdmin } from '@/pages/dean/DeanIMAAdmin';
import { DeanIQACAdmin } from '@/pages/dean/DeanIQACAdmin';
import { DeanReports } from '@/pages/dean/DeanReports';

type DomainTab = 'overview' | 'student_admin' | 'examination' | 'academic' | 'ima' | 'iqac' | 'research';

export function DeanDashboard() {
  const [activeTab, setActiveTab] = useState<DomainTab>('overview');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);

  // Remedial Directive Modal State
  const [isRemedialModalOpen, setIsRemedialModalOpen] = useState(false);
  const [selectedRiskStudent, setSelectedRiskStudent] = useState('CS2026012');
  const [directiveType, setDirectiveType] = useState('Mandatory Remedial Classes & Counseling');
  const [directiveNotes, setDirectiveNotes] = useState('');

  // Executive Dock Modal State
  const [activeDockModal, setActiveDockModal] = useState<string | null>(null);
  const [dockInputText, setDockInputText] = useState('');

  // Live Database Stats State
  const [dbStats, setDbStats] = useState<DashboardStats | null>(null);
  const [loadingDb, setLoadingDb] = useState(true);

  const loadLiveDbStats = async () => {
    setLoadingDb(true);
    try {
      const statsData = await fetchDashboardData();
      setDbStats(statsData);
    } catch (err) {
      console.warn('Could not fetch live dashboard stats:', err);
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    loadLiveDbStats();
  }, []);

  // Executive Approvals State
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([
    { id: 'DA-101', title: 'AI Supercomputing Node Lab Grant', type: 'Research Grant', detail: '₹5.5L — AI Supercomputing Node Lab (Dr. Srinivas Rao)', requestor: 'Dr. Srinivas Rao', role: 'Professor', department: 'CSE', domain: 'IMA', urgency: 'high', date: 'Jul 21', details: 'Requesting allocation of ₹5.5 Lakhs from research reserves to establish an 8x RTX-4090 GPU Node for Deep Learning and GenAI coursework.' },
    { id: 'DA-102', title: 'B.Tech CSE 2026-27 Syllabus Modernization', type: 'Curriculum Revision', detail: 'B.Tech CSE 2026-27 Syllabus Modernization (GenAI Elective)', requestor: 'Prof. V. Sharma', role: 'HOD', department: 'CSE', domain: 'Academic', urgency: 'medium', date: 'Jul 21', details: 'Introduction of 2 new elective subjects: Advanced Machine Learning and Cloud Microservices Architecture for 7th Semester B.Tech Students.' },
    { id: 'DA-103', title: 'Bulk Grace Marks Appeal — Data Structures', type: 'Exam Re-evaluation', detail: 'Bulk Grace Marks Appeal — 14 Students (Data Structures)', requestor: 'Dr. K. Lakshmi', role: 'Controller of Exams', department: 'Exam Cell', domain: 'Examination', urgency: 'high', date: 'Jul 20', details: 'Appeal for 3 grace marks due to out-of-syllabus Question #4B in Semester V End-Exam.' },
    { id: 'DA-104', title: 'NBA Tier-1 Criteria 3 Self-Study Report', type: 'IQAC Accreditation', detail: 'NBA Tier-1 Assessment Criteria 3 Self-Study Report', requestor: 'Dr. Suresh Kumar', role: 'IQAC Coordinator', department: 'IQAC', domain: 'IQAC', urgency: 'low', date: 'Jul 20', details: 'Final submission of Criteria 3 Outcome Based Education metrics for NBA accreditation visit.' },
  ]);

  const [studentRiskCases, setStudentRiskCases] = useState([
    { roll: 'CS2026012', name: 'Rohan Sharma', dept: 'CSE', attendance: '58%', cgpa: 4.8, risk: 'Critical', issue: 'Chronic absenteeism & mid-term failure' },
    { roll: 'EC2026045', name: 'Pooja Verma', dept: 'ECE', attendance: '62%', cgpa: 5.2, risk: 'High', issue: '3 Backlogs in Circuit Theory' },
    { roll: 'ME2026088', name: 'Vikram Singh', rollNo: 'ME2026088', dept: 'ME', attendance: '64%', cgpa: 5.0, risk: 'High', issue: 'Disciplinary hearing pending' },
  ]);

  const handleApprove = (id: string, detail: string) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
    toast.success(`Executive Decision Executed: Approved "${detail}"`);
  };

  const handleReject = (id: string, detail: string) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
    toast.error(`Executive Decision Executed: Rejected "${detail}"`);
  };

  const deptComparison = [
    { dept: 'CSE', students: 720, faculty: 48, passRate: 94, attendance: 92, researchIndex: 8.8 },
    { dept: 'ECE', students: 540, faculty: 36, passRate: 89, attendance: 90, researchIndex: 8.2 },
    { dept: 'ME', students: 410, faculty: 28, passRate: 84, attendance: 87, researchIndex: 7.5 },
    { dept: 'EEE', students: 380, faculty: 26, passRate: 91, attendance: 91, researchIndex: 7.9 },
    { dept: 'CE', students: 400, faculty: 30, passRate: 86, attendance: 89, researchIndex: 7.2 },
  ];

  const domainFilterList: { id: DomainTab; label: string; icon: any; count?: number }[] = [
    { id: 'overview', label: 'Executive Overview', icon: Building2 },
    { id: 'student_admin', label: 'Student Administration', icon: Users, count: 1 },
    { id: 'examination', label: 'Examination Control', icon: BookOpen, count: 1 },
    { id: 'academic', label: 'Academic Affairs', icon: Award, count: 1 },
    { id: 'ima', label: 'IMA Research Hub', icon: Sparkles, count: 1 },
    { id: 'iqac', label: 'IQAC Quality Audit', icon: ShieldCheck, count: 1 },
    { id: 'research', label: 'Grants & Publications', icon: FileText },
  ];

  // Real Database Counts
  const totalDbUsers = dbStats?.totalUsers ?? (dbStats?.stats ? Number(dbStats.stats.find(s => s.label === 'Total Students')?.value || 0) + Number(dbStats.stats.find(s => s.label === 'Total Faculty')?.value || 0) : 17);
  const totalDbStudents = dbStats?.totalStudents ?? Number(dbStats?.stats?.find(s => s.label === 'Total Students')?.value || 1);
  const totalDbFaculty = dbStats?.totalFaculty ?? Number(dbStats?.stats?.find(s => s.label === 'Total Faculty')?.value || 1);

  return (
    <div className="space-y-6">
      {/* Header Banner with Executive Styling */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Database Connected
              </span>
              <span className="text-xs text-slate-400 font-mono">Academic Year 2026-27</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Office of the Dean
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-xl">
              High-level institutional oversight: Live DB User Metrics, Student Welfare, Academic Governance, Examinations, IMA & IQAC Quality Control.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                loadLiveDbStats();
                toast.success('Refreshed real-time user metrics from database!');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw className={`size-3.5 ${loadingDb ? 'animate-spin' : ''}`} /> Refresh DB Data
            </button>
            <button
              onClick={() => toast.success('Dean Circular broadcasted to all HODs & Deans.')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
            >
              <Send className="size-4" /> Issue Dean Circular
            </button>
          </div>
        </div>
      </div>

      {/* KPI Top Dock with LIVE DATABASE USER COUNTS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Total DB Users</span>
            <Users className="size-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {totalDbUsers}
          </div>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Live DB Users</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Students in DB</span>
            <GraduationCap className="size-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {totalDbStudents}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">Live Student Records</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Faculty in DB</span>
            <GraduationCap className="size-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {totalDbFaculty}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Live Faculty Roster</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Approvals</span>
            <ClipboardList className="size-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600">{approvals.length}</div>
          <span className="text-[10px] text-amber-600 font-bold">Action Required</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">IQAC Score</span>
            <ShieldCheck className="size-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">3.84 / 4.0</div>
          <span className="text-[10px] text-emerald-600 font-bold">NAAC A++ Grade</span>
        </div>
      </div>

      {/* Domain Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {domainFilterList.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${isActive ? 'bg-white text-blue-700' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Tab Workspace */}
      <div className="space-y-6">

        {/* Tab 1: Executive Overview */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Executive Approvals Queue */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                      <CheckCircle className="size-5 text-blue-600" /> Pending Executive Approvals
                    </h3>
                    <p className="text-xs text-slate-500">Cross-domain requests requiring Dean authorization</p>
                  </div>
                  <Badge tone="warn">{approvals.length} Pending</Badge>
                </div>

                <div className="space-y-3">
                  {approvals.map(req => (
                    <div key={req.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">{req.id}</span>
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white">{req.title}</span>
                          <Badge tone="info" className="text-[9px]">{req.domain}</Badge>
                        </div>
                        <p className="text-xs text-slate-500">{req.detail}</p>
                      </div>
                      <button
                        onClick={() => setSelectedApproval(req)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shrink-0"
                      >
                        Review & Action &gt;
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Department Performance Breakdown */}
              <Card className="p-5">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm mb-4">Department Academic & Research Performance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="pb-2">Department</th>
                        <th className="pb-2">Students</th>
                        <th className="pb-2">Faculty</th>
                        <th className="pb-2">Pass Rate</th>
                        <th className="pb-2">Attendance</th>
                        <th className="pb-2">R&D Index</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {deptComparison.map(d => (
                        <tr key={d.dept} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 font-extrabold text-slate-900 dark:text-white">{d.dept}</td>
                          <td className="py-3 text-slate-600 dark:text-slate-300">{d.students}</td>
                          <td className="py-3 text-slate-600 dark:text-slate-300">{d.faculty}</td>
                          <td className="py-3 font-extrabold text-emerald-600">{d.passRate}%</td>
                          <td className="py-3 text-slate-600 dark:text-slate-300">{d.attendance}%</td>
                          <td className="py-3 font-extrabold text-blue-600">{d.researchIndex} / 10</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Right Column: Risk Analytics & Tools */}
            <div className="space-y-6">
              
              {/* Student Risk Analytics */}
              <Card className="p-5 border-amber-200 dark:border-amber-950 bg-amber-50/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <AlertTriangle className="size-4 text-amber-500" /> Student Risk Analytics
                  </h3>
                  <Badge tone="warn" className="text-[9px]">3 Critical</Badge>
                </div>
                <p className="text-xs text-slate-500 mb-3">High dropout / failure probability flagged by AI analytics</p>

                <div className="space-y-3">
                  {studentRiskCases.map(st => (
                    <div key={st.roll} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">{st.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                          {st.risk} Risk
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Roll: {st.roll} • Dept: {st.dept}</span>
                        <span>CGPA: <strong>{st.cgpa}</strong></span>
                      </div>
                      <p className="text-[10px] text-slate-400 italic">{st.issue}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setIsRemedialModalOpen(true)}
                  className="w-full mt-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="size-4" /> Issue Remedial Directive
                </button>
              </Card>

              {/* Dean Executive Tools Dock */}
              <Card className="p-5">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm mb-4">Dean Executive Dock</h3>
                <div className="space-y-2.5">
                  {[
                    { id: 'council', label: 'Schedule Academic Council', icon: Clock, color: 'text-blue-600' },
                    { id: 'gazette', label: 'Approve Result Gazette', icon: Award, color: 'text-emerald-600' },
                    { id: 'iqac_review', label: 'IQAC Accreditation Review', icon: ShieldCheck, color: 'text-violet-600' },
                    { id: 'ima_funding', label: 'IMA Research Funding Approval', icon: Sparkles, color: 'text-amber-600' },
                    { id: 'broadcast', label: 'Broadcast Dean Notice', icon: Send, color: 'text-slate-600' },
                  ].map(({ id, label, icon: Icon, color }) => (
                    <button
                      key={id}
                      onClick={() => {
                        if (id === 'iqac_review') {
                          setActiveTab('iqac');
                        } else if (id === 'ima_funding') {
                          setActiveTab('ima');
                        } else {
                          setActiveDockModal(id);
                        }
                      }}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`size-4 ${color}`} />
                        <span>{label}</span>
                      </div>
                      <ChevronRight className="size-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Student Administration */}
        {activeTab === 'student_admin' && <DeanStudentAdmin />}

        {/* Tab 3: Examination Governance */}
        {activeTab === 'examination' && <DeanExaminationAdmin />}

        {/* Tab 4: Academic Affairs */}
        {activeTab === 'academic' && <DeanAcademicAdmin />}

        {/* Tab 5: IMA Research Hub */}
        {activeTab === 'ima' && <DeanIMAAdmin />}

        {/* Tab 6: IQAC Quality Audit */}
        {activeTab === 'iqac' && <DeanIQACAdmin />}

        {/* Tab 7: Grants & Publications Reports */}
        {activeTab === 'research' && <DeanReports />}
      </div>

      {/* ISSUE REMEDIAL DIRECTIVE MODAL */}
      {isRemedialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                  <AlertTriangle className="size-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">Issue Remedial Directive</h3>
                  <p className="text-xs text-slate-500">Official Dean academic intervention & probation dispatch</p>
                </div>
              </div>
              <button onClick={() => setIsRemedialModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 mb-1 block">Select Target At-Risk Student</label>
                <select
                  value={selectedRiskStudent}
                  onChange={e => setSelectedRiskStudent(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold"
                >
                  {studentRiskCases.map(st => (
                    <option key={st.roll} value={st.roll}>
                      {st.name} ({st.roll}) — Dept: {st.dept} [CGPA: {st.cgpa}, Risk: {st.risk}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 mb-1 block">Directive Action Category</label>
                <select
                  value={directiveType}
                  onChange={e => setDirectiveType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold"
                >
                  <option value="Mandatory Remedial Classes & Counseling">Mandatory Remedial Classes & Counseling</option>
                  <option value="Academic Probation Notice & Exam Restriction">Academic Probation Notice & Exam Restriction</option>
                  <option value="Executive Parent-Teacher Conference Required">Executive Parent-Teacher Conference Required</option>
                  <option value="Special Senior Faculty Mentorship Assignment">Special Senior Faculty Mentorship Assignment</option>
                </select>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 mb-1 block">Directive Specifics & Timeline Remarks</label>
                <textarea
                  value={directiveNotes}
                  onChange={e => setDirectiveNotes(e.target.value)}
                  placeholder="e.g. Attendance deficit must be recovered to 75% within 14 working days through special extra-class sessions..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsRemedialModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const targetStudentObj = studentRiskCases.find(s => s.roll === selectedRiskStudent);
                  const name = targetStudentObj ? targetStudentObj.name : selectedRiskStudent;
                  toast.success(`Dispatched Executive Remedial Directive for ${name} (${directiveType})`);
                  setIsRemedialModalOpen(false);
                  setDirectiveNotes('');
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-lg flex items-center gap-1.5"
              >
                <Send className="size-4" /> Dispatch Directive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXECUTIVE DOCK MODALS */}
      {activeDockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white capitalize">
                {activeDockModal === 'council' && 'Schedule Academic Council Meeting'}
                {activeDockModal === 'gazette' && 'Approve Result Gazette AY 2026-27'}
                {activeDockModal === 'broadcast' && 'Broadcast Executive Dean Notice'}
              </h3>
              <button onClick={() => setActiveDockModal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-500">
                {activeDockModal === 'council' && 'Set date, agenda and invitees for the upcoming Academic Council Session.'}
                {activeDockModal === 'gazette' && 'Sanction end-semester result gazette for immediate publishing to Student Portals.'}
                {activeDockModal === 'broadcast' && 'Send institutional executive circular to all HODs, Faculty and Students.'}
              </p>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 mb-1 block">
                  {activeDockModal === 'council' ? 'Council Agenda & Focus Topics' : activeDockModal === 'gazette' ? 'Sanction Resolution Code' : 'Notice Headline & Content'}
                </label>
                <textarea
                  value={dockInputText}
                  onChange={e => setDockInputText(e.target.value)}
                  placeholder="Enter details..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs min-h-[90px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => setActiveDockModal(null)} className="px-4 py-2 rounded-xl border text-slate-600 font-bold text-xs">
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success(`Executive action executed successfully!`);
                  setActiveDockModal(null);
                  setDockInputText('');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg"
              >
                Confirm & Execute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval System Modal */}
      <ApprovalSystemModal
        request={selectedApproval}
        isOpen={Boolean(selectedApproval)}
        onClose={() => setSelectedApproval(null)}
        onActionComplete={(reqId, action, comment) => {
          setApprovals(prev => prev.filter(a => a.id !== reqId));
          toast.success(`Executive Decision (${action.toUpperCase()}) executed for ${reqId}. Remark logged.`);
        }}
      />
    </div>
  );
}
