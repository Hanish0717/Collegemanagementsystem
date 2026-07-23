import { useState, useEffect } from 'react';
import {
  Users, CalendarCheck, Award, AlertTriangle, Download, CheckCircle, RefreshCw, Send, ShieldCheck
} from 'lucide-react';
import { Badge, Card, StatCard } from '@/components/dashboard/ui';
import { exportToCSV } from '@/lib/exportUtils';
import { toast } from 'sonner';
import { fetchDashboardData, type DashboardStats } from '@/services/dashboardService';

export function DeanStudentAdmin() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'attendance' | 'discipline' | 'scholarships' | 'approvals'>('analytics');
  const [dbStats, setDbStats] = useState<DashboardStats | null>(null);
  const [loadingDb, setLoadingDb] = useState(true);

  const loadLiveDbStats = async () => {
    setLoadingDb(true);
    try {
      const statsData = await fetchDashboardData();
      setDbStats(statsData);
    } catch (err) {
      console.warn('Could not fetch live student admin stats:', err);
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    loadLiveDbStats();
  }, []);

  const totalDbStudents = (dbStats as any)?.totalStudents ?? Number(dbStats?.stats?.find(s => s.label === 'Total Students')?.value || 55);

  // Dynamic State for Defaulters
  const [defaultersList, setDefaultersList] = useState([
    { name: 'Hanish Senapati', roll: 'CS2026101', dept: 'CSE', att: '68%', status: 'Condonation Fee Eligible', waived: false },
    { name: 'Varun Verma', roll: 'EC2026115', dept: 'ECE', att: '72%', status: 'Condonation Fee Eligible', waived: false },
    { name: 'Nikita Reddy', roll: 'ME2026122', dept: 'ME', att: '65%', status: 'Requires Dean Medical Waiver', waived: false },
  ]);

  // Dynamic State for Scholarships
  const [scholarshipRequests, setScholarshipRequests] = useState([
    { id: 'SCH-801', name: 'Rohan Sharma', roll: 'CS2026012', dept: 'CSE', gpa: '9.4', category: 'Merit-cum-Means', amount: '₹45,000', status: 'Pending Dean Approval' },
    { id: 'SCH-802', name: 'Priya Patel', roll: 'EC2026045', dept: 'ECE', gpa: '9.6', category: 'Institutional Merit', amount: '₹60,000', status: 'Pending Dean Approval' },
    { id: 'SCH-803', name: 'Aditya Verma', roll: 'ME2026019', dept: 'ME', gpa: '8.9', category: 'Sports Excellence', amount: '₹30,000', status: 'Pending Dean Approval' },
  ]);

  // Dynamic State for Discipline Cases
  const [disciplineCases, setDisciplineCases] = useState([
    { id: 'DIS-101', student: 'Karan Malhotra (Roll: CS2026088)', dept: 'CSE', issue: 'Exam Hall Mobile Infraction', committeeVerdict: 'Warning & Fine', status: 'Requires Dean Confirmation' },
    { id: 'DIS-102', student: 'Siddharth Rao (Roll: EE2026034)', dept: 'EEE', issue: 'Hostel Curfew Infraction', committeeVerdict: 'Community Service', status: 'Under Dean Review' },
  ]);

  // Dynamic State for Transfers
  const [transferRequests, setTransferRequests] = useState([
    { id: 'TRF-101', student: 'Ananya Sharma', roll: 'EC2026099', fromDept: 'ECE', toDept: 'CSE', credits: 48, status: 'HOD Approved' }
  ]);

  const handleGrantWaiver = (roll: string, name: string) => {
    setDefaultersList(prev => prev.map(item => item.roll === roll ? { ...item, status: 'Dean Medical Waiver Granted', waived: true } : item));
    toast.success(`Granted Dean Condonation Waiver for ${name} (${roll})`);
  };

  const handleSendWarningNotices = () => {
    setDefaultersList(prev => prev.map(item => ({ ...item, status: 'Parent Warning Notice Dispatched' })));
    toast.success('Dispatched official warning SMS to parents of all attendance defaulters.');
  };

  const handleApproveScholarship = (id: string, name: string) => {
    setScholarshipRequests((prev) => prev.filter((item) => item.id !== id));
    toast.success(`[Dean Sanction] Approved Scholarship for ${name} (${id})`);
  };

  const handleConfirmDiscipline = (id: string, student: string) => {
    setDisciplineCases((prev) => prev.filter((item) => item.id !== id));
    toast.success(`[Dean Confirmation] Disciplinary verdict upheld for ${student}`);
  };

  const handleApproveTransfer = (id: string, student: string) => {
    setTransferRequests((prev) => prev.filter((item) => item.id !== id));
    toast.success(`[Dean Sanction] Approved Transfer Certificate for ${student}`);
  };

  const handleExportStudentReport = () => {
    exportToCSV('Dean_Student_Oversight_Report', [
      { header: 'Student ID', key: 'id' },
      { header: 'Student Name', key: 'name' },
      { header: 'Roll Number', key: 'roll' },
      { header: 'Department', key: 'dept' },
      { header: 'Sanction Category', key: 'category' },
      { header: 'Amount', key: 'amount' },
    ], scholarshipRequests);
    toast.success('Exported Institutional Student Analytics Report to CSV!');
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
            <span className="text-xs text-slate-400 font-mono">Student Administration</span>
          </div>
          <h1 className="text-2xl font-black text-white">Student Oversight & Executive Administration</h1>
          <p className="text-xs text-slate-400 mt-1">
            Institutional student analytics, low-attendance alerts, discipline committee reviews, merit scholarship approvals, and transfer certifications.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              loadLiveDbStats();
              toast.success('Refreshed live database student count!');
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`size-3.5 ${loadingDb ? 'animate-spin' : ''}`} /> Refresh DB Data
          </button>
          <button
            onClick={handleExportStudentReport}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer shrink-0"
          >
            <Download className="size-4" /> Export Student Report
          </button>
        </div>
      </div>

      {/* Metrics Row WITH LIVE DATABASE STUDENT COUNT */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Enrolled (DB)" value={String(totalDbStudents)} change="Live DB Enrolled Students" icon={Users} />
        <StatCard label="Average Attendance" value="94.2%" change="Benchmark Met" icon={CalendarCheck} />
        <StatCard label="Merit Scholarships" value={String(scholarshipRequests.length + 139)} change="₹64.5L Disbursed" icon={Award} />
        <StatCard label="Discipline Cases" value={String(disciplineCases.length)} change="Active Reviews" icon={AlertTriangle} />
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'analytics', label: 'Student Analytics & CGPA' },
          { id: 'attendance', label: `Attendance Audit (${defaultersList.length})` },
          { id: 'scholarships', label: `Scholarship Approvals (${scholarshipRequests.length})` },
          { id: 'discipline', label: `Discipline Cases (${disciplineCases.length})` },
          { id: 'approvals', label: `Transfers & Promotions (${transferRequests.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Student Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">CGPA Performance Spectrum</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span>&gt; 9.0 CGPA (High Honors)</span><span className="font-bold text-emerald-600">420 Students (17%)</span></div>
                <div className="flex justify-between"><span>8.0 - 8.9 CGPA (First Class)</span><span className="font-bold text-blue-600">1,280 Students (52%)</span></div>
                <div className="flex justify-between"><span>7.0 - 7.9 CGPA (Second Class)</span><span className="font-bold text-indigo-600">590 Students (24%)</span></div>
                <div className="flex justify-between"><span>&lt; 7.0 CGPA (Remedial Tracking)</span><span className="font-bold text-amber-600">160 Students (7%)</span></div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">Departmental Distribution</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span>Computer Science & Eng (CSE)</span><span className="font-bold">720 Enrolled</span></div>
                <div className="flex justify-between"><span>Electronics & Comm (ECE)</span><span className="font-bold">540 Enrolled</span></div>
                <div className="flex justify-between"><span>Mechanical Eng (ME)</span><span className="font-bold">410 Enrolled</span></div>
                <div className="flex justify-between"><span>Electrical Eng (EEE)</span><span className="font-bold">380 Enrolled</span></div>
                <div className="flex justify-between"><span>Civil & Allied (CE)</span><span className="font-bold">400 Enrolled</span></div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">Institutional Demographics</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span>Male Students</span><span className="font-bold">1,470 (60%)</span></div>
                <div className="flex justify-between"><span>Female Students</span><span className="font-bold">980 (40%)</span></div>
                <div className="flex justify-between"><span>Hostel Residents</span><span className="font-bold">1,150 Students</span></div>
                <div className="flex justify-between"><span>Day Scholars</span><span className="font-bold">1,300 Students</span></div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance Audit */}
      {activeTab === 'attendance' && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Low Attendance Defaulters (&lt;75%)</h3>
              <p className="text-xs text-slate-500">Dean intervention dashboard for student exam eligibility control.</p>
            </div>
            <button
              onClick={handleSendWarningNotices}
              className="px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <Send className="size-3.5" /> Send Warning Notices to Parents
            </button>
          </div>

          <div className="space-y-2">
            {defaultersList.map((st) => (
              <div key={st.roll} className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-800/40">
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white">{st.name} ({st.roll})</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Dept: {st.dept} • Status: <strong className={st.waived ? 'text-emerald-600' : 'text-amber-600'}>{st.status}</strong></div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-rose-600 text-sm">{st.att}</span>
                  {st.waived ? (
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold text-[11px] flex items-center gap-1">
                      <ShieldCheck className="size-3.5" /> Waiver Approved
                    </span>
                  ) : (
                    <button
                      onClick={() => handleGrantWaiver(st.roll, st.name)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition text-[11px] cursor-pointer shadow-md"
                    >
                      Grant Waiver
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 3: Scholarships */}
      {activeTab === 'scholarships' && (
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">Merit & Means Scholarship Disbursal Approvals</h3>
          {scholarshipRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-bold">
              All pending scholarship requests have been sanctioned by Dean.
            </div>
          ) : (
            <div className="space-y-3">
              {scholarshipRequests.map((sch) => (
                <div key={sch.id} className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">{sch.name} ({sch.roll})</span>
                      <Badge tone="info" className="text-[10px]">{sch.dept}</Badge>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      GPA: <strong className="text-slate-900 dark:text-white">{sch.gpa}</strong> • Scheme: {sch.category} • Sanction Amount: <strong className="text-emerald-600">{sch.amount}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApproveScholarship(sch.id, sch.name)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1 cursor-pointer shrink-0 shadow-md"
                  >
                    <CheckCircle className="size-3.5" /> Sanction Scholarship
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 4: Discipline Cases */}
      {activeTab === 'discipline' && (
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">Disciplinary Committee Cases & Verdicts</h3>
          {disciplineCases.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-bold">
              All disciplinary committee reviews have been confirmed.
            </div>
          ) : (
            <div className="space-y-3">
              {disciplineCases.map((dis) => (
                <div key={dis.id} className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
                  <div>
                    <div className="font-extrabold text-xs text-rose-600 mb-1">{dis.id}: {dis.student}</div>
                    <p className="text-xs font-medium">Infraction: {dis.issue}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Recommended Verdict: <strong>{dis.committeeVerdict}</strong></p>
                  </div>

                  <button
                    onClick={() => handleConfirmDiscipline(dis.id, dis.student)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer shrink-0 shadow-md"
                  >
                    Confirm Verdict
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 5: Transfers */}
      {activeTab === 'approvals' && (
        <Card className="p-5">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">Student Transfers & Promotions</h3>
          {transferRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-bold">
              No pending transfer certificate requests.
            </div>
          ) : (
            <div className="space-y-3">
              {transferRequests.map(tr => (
                <div key={tr.id} className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-800/40">
                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-white">Inter-College Transfer: {tr.student} ({tr.fromDept} &gt; {tr.toDept})</div>
                    <div className="text-slate-500 mt-0.5">Credits Verified: {tr.credits} Credits • HOD Approval Received</div>
                  </div>
                  <button
                    onClick={() => handleApproveTransfer(tr.id, tr.student)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold cursor-pointer hover:bg-blue-700 transition shadow-md"
                  >
                    Approve Transfer
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
