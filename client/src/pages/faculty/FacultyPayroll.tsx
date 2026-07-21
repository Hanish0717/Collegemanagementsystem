import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Calendar,
  User,
  Building2,
  Clock,
  CheckCircle,
  AlertOctagon,
  RefreshCw,
  Download,
  Printer,
  Eye,
  TrendingUp,
  TrendingDown,
  Award,
  BadgeCheck,
  FileText,
  ChevronDown,
  ChevronUp,
  Wallet,
  CalendarCheck,
  CalendarX,
  Percent,
} from 'lucide-react';
import { PageHeader, Card, Badge } from '@/components/dashboard/ui';
import { toast } from 'sonner';
import { getStoredFacultyProfile } from '@/services/facultyProfileService';
import {
  LIVE_DATABASE_FACULTY,
  FacultyPayrollItem,
  calculateSalary,
  generatePayslipPDF,
} from '@/services/payrollService';

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function getStatusColor(status: FacultyPayrollItem['status']) {
  switch (status) {
    case 'Paid':        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Pending':     return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Processing':  return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Salary Hold': return 'bg-rose-100 text-rose-700 border-rose-200';
    default:            return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

function getStatusIcon(status: FacultyPayrollItem['status']) {
  switch (status) {
    case 'Paid':        return <CheckCircle className="size-4" />;
    case 'Pending':     return <Clock className="size-4" />;
    case 'Processing':  return <RefreshCw className="size-4 animate-spin" />;
    case 'Salary Hold': return <AlertOctagon className="size-4" />;
    default:            return <Clock className="size-4" />;
  }
}

// ─── Build payroll history for last 3 months from a current record ───────────
function buildHistory(current: FacultyPayrollItem): Array<FacultyPayrollItem & { monthLabel: string }> {
  const months = ['July 2026', 'June 2026', 'May 2026'];
  const absent  = [current.absentDays, 0, 2];
  const statuses: Array<FacultyPayrollItem['status']> = [current.status, 'Paid', 'Paid'];

  return months.map((m, i) => {
    const calc = calculateSalary(current.baseSalary, current.workingDays, absent[i]);
    return {
      ...current,
      ...calc,
      month: m,
      monthLabel: m,
      status: statuses[i],
    };
  });
}

// ─── DEPT FULL NAMES ─────────────────────────────────────────────────────────
const DEPT_NAMES: Record<string, string> = {
  CSE: 'Computer Science & Engineering',
  AIML: 'Artificial Intelligence & Machine Learning',
  AIDS: 'Artificial Intelligence & Data Science',
  CYBERSECURITY: 'Cyber Security',
  ECE: 'Electronics & Communication Engineering',
  EEE: 'Electrical & Electronics Engineering',
  IT: 'Information Technology',
  MECH: 'Mechanical Engineering',
  CIVIL: 'Civil Engineering',
};

// ─── Main Component ──────────────────────────────────────────────────────────
export function FacultyPayroll() {
  const profile = getStoredFacultyProfile();

  // Find the payroll record for the logged-in faculty
  const payrollRecord = useMemo<FacultyPayrollItem | null>(() => {
    // 1. Match by employeeId
    const byEmpId = LIVE_DATABASE_FACULTY.find(
      (p) => p.employeeId === profile.employeeId
    );
    if (byEmpId) return byEmpId;

    // 2. Match by email
    const byEmail = LIVE_DATABASE_FACULTY.find(
      (p) => p.email.toLowerCase() === profile.email.toLowerCase()
    );
    if (byEmail) return byEmail;

    // 3. Build a synthetic record from profile data
    const calc = calculateSalary(profile.baseSalary || 65000, profile.workingDays || 30, profile.absentDays || 0);
    return {
      id: `PAY-${profile.employeeId}`,
      employeeId: profile.employeeId,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
      department: profile.department,
      category: profile.category,
      designation: profile.designation,
      baseSalary: profile.baseSalary || 65000,
      month: 'July 2026',
      status: 'Paid',
      bankAccount: 'N/A',
      ifscCode: 'N/A',
      panNumber: 'N/A',
      ...calc,
    } satisfies FacultyPayrollItem;
  }, [profile.employeeId, profile.email]);

  const history = useMemo(() => payrollRecord ? buildHistory(payrollRecord) : [], [payrollRecord]);

  const [showHistory, setShowHistory] = useState(false);
  const [showPayslip, setShowPayslip] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!payrollRecord) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No payroll record found for your account. Please contact HR.
      </div>
    );
  }

  const deptFull = DEPT_NAMES[payrollRecord.department] || payrollRecord.department;

  const handleDownloadPayslip = () => {
    generatePayslipPDF(payrollRecord);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) return;
    win.document.write(`
      <html><head><title>Payslip – ${payrollRecord.employeeId}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 32px; color: #1e293b; }
        h1 { font-size: 20px; font-weight: 700; margin: 0 0 4px; }
        h2 { font-size: 14px; font-weight: 500; color: #64748b; margin: 0 0 24px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
        td:first-child { color: #64748b; width: 50%; }
        td:last-child { font-weight: 600; }
        .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 24px; border-radius: 12px 12px 0 0; margin-bottom: 0; }
        .header h1, .header h2 { color: white; }
        .section { margin: 20px 0; }
        .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; }
        .net { background: #f0fdf4; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
        .net span:last-child { font-size: 20px; font-weight: 800; color: #16a34a; }
        .footer { margin-top: 24px; font-size: 11px; color: #94a3b8; text-align: center; }
        @media print { body { padding: 16px; } }
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const attendancePct = payrollRecord.attendancePercentage;

  return (
    <div className="space-y-6 pb-12">
      {/* ── Page Header ── */}
      <PageHeader
        title="My Payroll"
        desc={`Salary details for ${payrollRecord.month} · ${payrollRecord.employeeId}`}
      />

      {/* ── Identity Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 p-6 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative">
                {payrollRecord.avatar ? (
                  <img
                    src={payrollRecord.avatar}
                    alt={payrollRecord.name}
                    className="w-16 h-16 rounded-2xl object-cover border-4 border-white/30 shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-white/20 border-4 border-white/30 flex items-center justify-center">
                    <User className="size-8 text-white/80" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-emerald-400 rounded-full p-0.5">
                  <BadgeCheck className="size-4 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white truncate">{payrollRecord.name}</h2>
                <p className="text-indigo-200 text-sm">{payrollRecord.designation}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
                    {payrollRecord.employeeId}
                  </span>
                  <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Building2 className="size-3" />
                    {payrollRecord.department}
                  </span>
                  <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Award className="size-3" />
                    {payrollRecord.category}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-indigo-200 font-medium mb-1 flex items-center gap-1 justify-end">
                  <Calendar className="size-3" />
                  {payrollRecord.month}
                </div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${getStatusColor(payrollRecord.status)}`}>
                  {getStatusIcon(payrollRecord.status)}
                  {payrollRecord.status}
                </div>
              </div>
            </div>
          </div>

          {/* Salary at-a-glance bar */}
          <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t grid grid-cols-3 divide-x">
            <div className="pr-4 text-center">
              <p className="text-xs text-muted-foreground font-medium">Base Salary</p>
              <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{fmt(payrollRecord.baseSalary)}</p>
            </div>
            <div className="px-4 text-center">
              <p className="text-xs text-muted-foreground font-medium">Deduction</p>
              <p className="text-lg font-extrabold text-rose-600 mt-0.5">−{fmt(payrollRecord.totalDeduction)}</p>
            </div>
            <div className="pl-4 text-center">
              <p className="text-xs text-muted-foreground font-medium">Net Salary</p>
              <p className="text-lg font-extrabold text-emerald-600 mt-0.5">{fmt(payrollRecord.netSalary)}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Stat Cards Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: <CalendarCheck className="size-5 text-indigo-600" />,
            bg: 'bg-indigo-50 dark:bg-indigo-950/40',
            label: 'Present Days',
            value: payrollRecord.presentDays,
            sub: `out of ${payrollRecord.workingDays}`,
            color: 'text-indigo-700 dark:text-indigo-300',
          },
          {
            icon: <CalendarX className="size-5 text-rose-600" />,
            bg: 'bg-rose-50 dark:bg-rose-950/40',
            label: 'Absent Days',
            value: payrollRecord.absentDays,
            sub: 'leaves taken',
            color: 'text-rose-700 dark:text-rose-300',
          },
          {
            icon: <Percent className="size-5 text-amber-600" />,
            bg: 'bg-amber-50 dark:bg-amber-950/40',
            label: 'Attendance',
            value: `${attendancePct}%`,
            sub: attendancePct >= 90 ? 'Excellent' : attendancePct >= 75 ? 'Good' : 'Low',
            color: 'text-amber-700 dark:text-amber-300',
          },
          {
            icon: <TrendingDown className="size-5 text-purple-600" />,
            bg: 'bg-purple-50 dark:bg-purple-950/40',
            label: 'Per Day Rate',
            value: fmt(payrollRecord.perDaySalary),
            sub: 'per working day',
            color: 'text-purple-700 dark:text-purple-300',
          },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
          >
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.bg}`}>
                {s.icon}
              </div>
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
              <p className={`text-xl font-extrabold mt-0.5 ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Detailed Salary Breakdown + Payslip side-by-side ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary Breakdown */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6 h-full">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center">
                <DollarSign className="size-4 text-indigo-600" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Salary Calculation Breakdown</h3>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Department', value: deptFull, bold: false },
                { label: 'Designation', value: payrollRecord.designation, bold: false },
                { label: 'Category', value: payrollRecord.category, bold: false },
                { label: 'Month', value: payrollRecord.month, bold: false },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-right max-w-[55%] text-foreground">{value}</span>
                </div>
              ))}

              <div className="h-px bg-border my-2" />

              {[
                { label: 'Working Days', value: `${payrollRecord.workingDays} days` },
                { label: 'Present Days', value: `${payrollRecord.presentDays} days`, color: 'text-emerald-600' },
                { label: 'Absent Days', value: `${payrollRecord.absentDays} days`, color: 'text-rose-600' },
                { label: 'Attendance %', value: `${attendancePct}%`, color: attendancePct >= 90 ? 'text-emerald-600' : 'text-amber-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={`font-semibold ${color || 'text-foreground'}`}>{value}</span>
                </div>
              ))}

              <div className="h-px bg-border my-2" />

              {[
                { label: 'Base Salary', value: fmt(payrollRecord.baseSalary), color: 'text-foreground' },
                { label: 'Per Day Rate', value: fmt(payrollRecord.perDaySalary), color: 'text-foreground' },
                { label: 'Per Day Deduction Rate', value: fmt(payrollRecord.perDayDeduction), color: 'text-rose-600' },
                { label: `Total Deduction (${payrollRecord.absentDays}d × ${fmt(payrollRecord.perDayDeduction)})`, value: `−${fmt(payrollRecord.totalDeduction)}`, color: 'text-rose-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={`font-semibold ${color}`}>{value}</span>
                </div>
              ))}

              <div className="mt-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-emerald-600">NET SALARY PAYABLE</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{payrollRecord.month}</p>
                </div>
                <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">{fmt(payrollRecord.netSalary)}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* My Payslip Panel */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
          <Card className="p-6 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center">
                <FileText className="size-4 text-purple-600" />
              </div>
              <h3 className="font-bold text-sm text-foreground">My Payslip</h3>
            </div>

            {/* Payslip Preview Toggle */}
            <button
              onClick={() => setShowPayslip(!showPayslip)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-muted/60 hover:bg-muted transition text-sm font-medium mb-4"
            >
              <span className="flex items-center gap-2">
                <Eye className="size-4 text-muted-foreground" />
                {showPayslip ? 'Hide Payslip Preview' : 'Preview Payslip'}
              </span>
              {showPayslip ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>

            <AnimatePresence>
              {showPayslip && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  {/* Payslip Preview Box */}
                  <div ref={printRef} className="border rounded-xl overflow-hidden mb-4 text-sm">
                    {/* Payslip Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-5">
                      <h1 className="text-base font-bold">College Management System</h1>
                      <h2 className="text-sm font-normal text-indigo-200">Faculty Payslip — {payrollRecord.month}</h2>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Profile info */}
                      <div className="section">
                        <p className="section-title text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Employee Details</p>
                        <table className="w-full">
                          <tbody>
                            {[
                              ['Employee ID', payrollRecord.employeeId],
                              ['Name', payrollRecord.name],
                              ['Department', deptFull],
                              ['Designation', payrollRecord.designation],
                              ['Category', payrollRecord.category],
                            ].map(([k, v]) => (
                              <tr key={k} className="border-b border-border/40 last:border-0">
                                <td className="py-1.5 text-muted-foreground text-xs w-1/2">{k}</td>
                                <td className="py-1.5 font-semibold text-xs">{v}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="h-px bg-border" />

                      {/* Attendance */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Attendance</p>
                        <table className="w-full">
                          <tbody>
                            {[
                              ['Working Days', payrollRecord.workingDays],
                              ['Present Days', payrollRecord.presentDays],
                              ['Absent Days', payrollRecord.absentDays],
                              ['Attendance %', `${attendancePct}%`],
                            ].map(([k, v]) => (
                              <tr key={k} className="border-b border-border/40 last:border-0">
                                <td className="py-1.5 text-muted-foreground text-xs w-1/2">{k}</td>
                                <td className="py-1.5 font-semibold text-xs">{v}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="h-px bg-border" />

                      {/* Salary */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Salary Breakdown</p>
                        <table className="w-full">
                          <tbody>
                            {[
                              ['Base Salary', fmt(payrollRecord.baseSalary)],
                              ['Per Day Rate', fmt(payrollRecord.perDaySalary)],
                              ['Total Deduction', `−${fmt(payrollRecord.totalDeduction)}`],
                            ].map(([k, v]) => (
                              <tr key={k} className="border-b border-border/40 last:border-0">
                                <td className="py-1.5 text-muted-foreground text-xs w-1/2">{k}</td>
                                <td className="py-1.5 font-semibold text-xs">{v}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Net Salary */}
                      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-emerald-600">Net Salary Payable</p>
                          <p className="text-[10px] text-muted-foreground">{payrollRecord.month} · {payrollRecord.status}</p>
                        </div>
                        <p className="text-lg font-extrabold text-emerald-700">{fmt(payrollRecord.netSalary)}</p>
                      </div>

                      <p className="text-center text-[10px] text-muted-foreground mt-2">
                        This is a computer-generated salary slip.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="mt-auto space-y-2">
              <button
                onClick={handleDownloadPayslip}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                <Download className="size-4" />
                Download Payslip
              </button>
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-sm font-semibold transition-colors border"
              >
                <Printer className="size-4" />
                Print Payslip
              </button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── Attendance Progress Bar ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-indigo-500" />
              <span className="text-sm font-semibold text-foreground">Attendance Overview</span>
            </div>
            <span className={`text-sm font-bold ${attendancePct >= 90 ? 'text-emerald-600' : attendancePct >= 75 ? 'text-amber-600' : 'text-rose-600'}`}>
              {attendancePct}%
            </span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${attendancePct >= 90 ? 'bg-emerald-500' : attendancePct >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${attendancePct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>0%</span>
            <span>75% (Min. Req.)</span>
            <span>100%</span>
          </div>
        </Card>
      </motion.div>

      {/* ── Payroll History ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <Card className="overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition"
            onClick={() => setShowHistory(!showHistory)}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
                <Wallet className="size-4 text-amber-600" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-sm text-foreground">Salary History</h3>
                <p className="text-xs text-muted-foreground">Last 3 months</p>
              </div>
            </div>
            {showHistory ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="border-t">
                  {/* Table Header */}
                  <div className="grid grid-cols-5 px-5 py-2.5 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <span>Month</span>
                    <span className="text-right">Base Salary</span>
                    <span className="text-right">Deduction</span>
                    <span className="text-right">Net Salary</span>
                    <span className="text-right">Status</span>
                  </div>
                  {history.map((row, i) => (
                    <motion.div
                      key={row.month}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="grid grid-cols-5 px-5 py-3.5 border-b last:border-0 items-center hover:bg-muted/20 transition"
                    >
                      <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-muted-foreground" />
                        {row.month}
                      </span>
                      <span className="text-right text-sm text-foreground font-medium">{fmt(row.baseSalary)}</span>
                      <span className="text-right text-sm text-rose-600 font-medium">
                        {row.totalDeduction > 0 ? `−${fmt(row.totalDeduction)}` : '—'}
                      </span>
                      <span className="text-right text-sm text-emerald-600 font-bold">{fmt(row.netSalary)}</span>
                      <div className="flex justify-end">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(row.status)}`}>
                          {getStatusIcon(row.status)}
                          {row.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
