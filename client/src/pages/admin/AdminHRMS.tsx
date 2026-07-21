import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  FileCheck,
  DollarSign,
  UserPlus,
  Trash2,
  CheckCircle,
  Plus,
  X,
  Fingerprint,
  BookOpen,
  Award,
  Calendar,
  ClipboardList,
  AlertCircle,
  Coins,
  ShieldAlert,
  Search,
  Sparkles,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { Card, PageHeader, StatCard, Badge } from '@/components/dashboard/ui';
import { toast } from 'sonner';
import { AdminPayroll } from './AdminPayroll';

export function AdminHRMS() {
  const [activeTab, setActiveTab] = useState<
    'records' | 'recruitment' | 'attendance' | 'leave' | 'payroll' | 'performance'
  >('records');

  // State: Employee Records
  const [employees, setEmployees] = useState([
    {
      id: 'EMP-101',
      name: 'Dr. Srinivas Rao',
      dept: 'CSE',
      designation: 'Professor',
      status: 'Active',
      leaveBalance: 18,
      email: 'srinivas.rao@college.edu',
      joined: '2018-06-15',
    },
    {
      id: 'EMP-102',
      name: 'Mrs. Ananya Sen',
      dept: 'CSE',
      designation: 'Assistant Professor',
      status: 'Active',
      leaveBalance: 12,
      email: 'ananya.sen@college.edu',
      joined: '2021-08-20',
    },
    {
      id: 'EMP-103',
      name: 'Dr. Aisha Khan',
      dept: 'IT',
      designation: 'HOD IT',
      status: 'Active',
      leaveBalance: 15,
      email: 'aisha.khan@college.edu',
      joined: '2017-04-10',
    },
    {
      id: 'EMP-104',
      name: 'Mr. Ramesh Yadav',
      dept: 'CSE',
      designation: 'Senior Lecturer',
      status: 'Active',
      leaveBalance: 14,
      email: 'ramesh.yadav@college.edu',
      joined: '2020-11-05',
    },
  ]);

  // State: Recruitment
  const [recruitmentList, setRecruitmentList] = useState([
    {
      id: 'REC-01',
      title: 'Assistant Professor (AIML)',
      depts: 'AIML',
      applicants: 24,
      status: 'Interviewing',
      type: 'Full-Time',
    },
    {
      id: 'REC-02',
      title: 'System Administrator',
      depts: 'IT',
      applicants: 15,
      status: 'Open',
      type: 'Full-Time',
    },
    {
      id: 'REC-03',
      title: 'Lab Assistant (ECE)',
      depts: 'ECE',
      applicants: 8,
      status: 'Open',
      type: 'Contract',
    },
  ]);

  // State: Attendance
  const [biometricLogs, setBiometricLogs] = useState([
    {
      id: 'BIO-1001',
      employee: 'Dr. Srinivas Rao',
      time: '2026-07-16 08:58 AM',
      punchType: 'Check-In',
      device: 'Main Block Gate 1',
      status: 'Present',
    },
    {
      id: 'BIO-1002',
      employee: 'Mrs. Ananya Sen',
      time: '2026-07-16 09:02 AM',
      punchType: 'Check-In',
      device: 'CSE Dept Gate A',
      status: 'Present',
    },
    {
      id: 'BIO-1003',
      employee: 'Mr. Ramesh Yadav',
      time: '2026-07-16 09:15 AM',
      punchType: 'Check-In',
      device: 'Main Block Gate 1',
      status: 'Late',
    },
  ]);

  // State: Leave
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 'LR-501',
      employee: 'Dr. Srinivas Rao',
      type: 'Casual Leave',
      start: '2026-07-20',
      end: '2026-07-22',
      days: 3,
      status: 'Pending',
    },
    {
      id: 'LR-502',
      employee: 'Mrs. Ananya Sen',
      type: 'Sick Leave',
      start: '2026-07-18',
      end: '2026-07-19',
      days: 2,
      status: 'Approved',
    },
    {
      id: 'LR-503',
      employee: 'Mr. Ramesh Yadav',
      type: 'Earned Leave',
      start: '2026-07-25',
      end: '2026-07-30',
      days: 5,
      status: 'Pending',
    },
  ]);

  // State: Payroll
  const [payrollLogs, setPayrollLogs] = useState([
    {
      id: 'PAY-701',
      employee: 'Dr. Srinivas Rao',
      basic: 95000,
      allowance: 12000,
      deductions: 5000,
      net: 102000,
      status: 'Disbursed',
    },
    {
      id: 'PAY-702',
      employee: 'Mrs. Ananya Sen',
      basic: 65000,
      allowance: 8000,
      deductions: 3000,
      net: 70000,
      status: 'Pending',
    },
    {
      id: 'PAY-703',
      employee: 'Dr. Aisha Khan',
      basic: 110000,
      allowance: 15000,
      deductions: 6000,
      net: 119000,
      status: 'Disbursed',
    },
    {
      id: 'PAY-704',
      employee: 'Mr. Ramesh Yadav',
      basic: 55000,
      allowance: 6000,
      deductions: 2500,
      net: 58500,
      status: 'Pending',
    },
  ]);

  // State: Performance
  const [performanceRecords, setPerformanceRecords] = useState([
    {
      id: 'PRF-801',
      employee: 'Dr. Srinivas Rao',
      rating: 4.8,
      publications: 14,
      feedbackScore: 'Excellent',
      targetAchieved: '95%',
    },
    {
      id: 'PRF-802',
      employee: 'Mrs. Ananya Sen',
      rating: 4.2,
      publications: 3,
      feedbackScore: 'Good',
      targetAchieved: '88%',
    },
    {
      id: 'PRF-803',
      employee: 'Dr. Aisha Khan',
      rating: 4.9,
      publications: 22,
      feedbackScore: 'Outstanding',
      targetAchieved: '98%',
    },
    {
      id: 'PRF-804',
      employee: 'Mr. Ramesh Yadav',
      rating: 3.9,
      publications: 2,
      feedbackScore: 'Satisfactory',
      targetAchieved: '82%',
    },
  ]);

  // Modals & Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDept, setNewDept] = useState('CSE');
  const [newDesignation, setNewDesignation] = useState('Lecturer');

  const [showJobModal, setShowJobModal] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDept, setJobDept] = useState('CSE');
  const [jobType, setJobType] = useState('Full-Time');

  const [searchTerm, setSearchTerm] = useState('');

  // Handlers: Employee Records
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      toast.error('Please fill in all required fields!');
      return;
    }
    const newEmp = {
      id: `EMP-${100 + employees.length + 1}`,
      name: newName,
      dept: newDept,
      designation: newDesignation,
      status: 'Active',
      leaveBalance: 15,
      email: newEmail,
      joined: new Date().toISOString().split('T')[0],
    };
    setEmployees([...employees, newEmp]);

    // Create corresponding empty entries in performance and payroll to ensure data consistency
    setPayrollLogs((prev) => [
      ...prev,
      {
        id: `PAY-${700 + payrollLogs.length + 1}`,
        employee: newName,
        basic: 45000,
        allowance: 4000,
        deductions: 2000,
        net: 47000,
        status: 'Pending',
      },
    ]);
    setPerformanceRecords((prev) => [
      ...prev,
      {
        id: `PRF-${800 + performanceRecords.length + 1}`,
        employee: newName,
        rating: 4.0,
        publications: 0,
        feedbackScore: 'Good',
        targetAchieved: '85%',
      },
    ]);

    toast.success(`Employee ${newName} added successfully!`);
    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
  };

  const handleFireEmployee = (id: string, name: string) => {
    if (confirm(`Are you sure you want to deactivate the profile of ${name}?`)) {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      toast.warning(`Employee record ${name} has been deactivated.`);
    }
  };

  // Handlers: Recruitment
  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim()) {
      toast.error('Please fill in job title!');
      return;
    }
    const newJob = {
      id: `REC-${10 + recruitmentList.length + 1}`,
      title: jobTitle,
      depts: jobDept,
      applicants: 0,
      status: 'Open',
      type: jobType,
    };
    setRecruitmentList([...recruitmentList, newJob]);
    toast.success(`New Job Opening "${jobTitle}" has been published!`);
    setShowJobModal(false);
    setJobTitle('');
  };

  // Handlers: Biometric Attendance
  const handleSyncBiometric = () => {
    toast.loading('Initiating handshake with RFID scanners...', { duration: 1200 });
    setTimeout(() => {
      const luckyEmp = employees[Math.floor(Math.random() * employees.length)];
      const punchTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newLog = {
        id: `BIO-${1000 + biometricLogs.length + 1}`,
        employee: luckyEmp.name,
        time: `${new Date().toISOString().split('T')[0]} ${punchTime}`,
        punchType: 'Check-In',
        device: 'Main Block Gate 1',
        status: Math.random() > 0.15 ? 'Present' : 'Late',
      };
      setBiometricLogs((prev) => [newLog, ...prev]);
      toast.success(`Sync Complete: Punch log for ${luckyEmp.name} received successfully!`);
    }, 1300);
  };

  // Handlers: Leave
  const handleLeaveDecision = (id: string, action: 'Approved' | 'Rejected') => {
    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id === id) {
          if (action === 'Approved') {
            // Reduce leave balance
            setEmployees((empList) =>
              empList.map((e) => {
                if (e.name === req.employee) {
                  return { ...e, leaveBalance: Math.max(0, e.leaveBalance - req.days) };
                }
                return e;
              }),
            );
          }
          return { ...req, status: action };
        }
        return req;
      }),
    );
    toast.success(`Leave request ${id} has been ${action.toLowerCase()}!`);
  };

  // Handlers: Payroll
  const handleDisburseSalary = (id: string) => {
    setPayrollLogs((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Disbursed' } : p)));
    toast.success(`Salary slip processed & funds credited to account!`);
  };

  const handleDisburseAllPayroll = () => {
    toast.loading('Calculating net payouts and preparing bank release...', { duration: 1500 });
    setTimeout(() => {
      setPayrollLogs((prev) => prev.map((p) => ({ ...p, status: 'Disbursed' })));
      toast.success('All pending salaries released successfully! Pay slips dispatched via email.');
    }, 1600);
  };

  // Filter Employees
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Human Resource Management System (HRMS)"
        desc="Central portal for managing recruitment pipelines, biometric attendance devices, leave balances, payroll disbursement, and appraisals."
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto mb-4 bg-background/50 backdrop-blur-md rounded-xl p-1 border">
        {[
          { id: 'records', label: 'Employee Records', icon: Users },
          { id: 'recruitment', label: 'Recruitment Cell', icon: Briefcase },
          { id: 'attendance', label: 'Biometric Attendance', icon: Fingerprint },
          { id: 'leave', label: 'Leaves & Timeoff', icon: FileCheck },
          { id: 'payroll', label: 'Payroll Ledger', icon: DollarSign },
          { id: 'performance', label: 'Performance Appraisals', icon: Award },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold transition cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 font-bold bg-indigo-500/5 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="size-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* SUB-MODULE 1: EMPLOYEE RECORDS */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Staff Directory"
              value={String(employees.length)}
              change={`${employees.filter((e) => e.status === 'Active').length} Active Profiles`}
              icon={Users}
              gradient="bg-gradient-primary"
            />
            <StatCard
              label="Engineering Department"
              value={String(employees.filter((e) => e.dept === 'CSE').length)}
              change="Computer Science & Engineering"
              icon={BookOpen}
              gradient="bg-gradient-violet"
            />
            <StatCard
              label="IT Department"
              value={String(employees.filter((e) => e.dept === 'IT').length)}
              change="Information Technology"
              icon={ClipboardList}
              gradient="bg-gradient-cyan"
            />
            <StatCard
              label="Total Faculty Leave Pool"
              value={`${employees.reduce((acc, c) => acc + c.leaveBalance, 0)} Days`}
              change="Available balance"
              icon={FileCheck}
              gradient="bg-gradient-emerald"
            />
          </div>

          <Card>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search staff directory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border bg-background/50 text-xs focus:border-indigo-500 outline-none"
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-soft"
              >
                <UserPlus className="size-4" /> Add Staff Member
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-400">
                    <th className="text-left pb-3">Emp ID</th>
                    <th className="text-left pb-3">Name</th>
                    <th className="text-left pb-3">Email Address</th>
                    <th className="text-left pb-3">Department</th>
                    <th className="text-left pb-3">Designation</th>
                    <th className="text-center pb-3">Leave Balance</th>
                    <th className="text-center pb-3">Status</th>
                    <th className="text-right pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 font-mono font-bold text-slate-400">{e.id}</td>
                      <td className="py-3 font-bold text-slate-800">{e.name}</td>
                      <td className="py-3 font-medium text-slate-500">{e.email}</td>
                      <td className="py-3">
                        <Badge tone="info">{e.dept}</Badge>
                      </td>
                      <td className="py-3 text-slate-600 font-semibold">{e.designation}</td>
                      <td className="py-3 text-center font-bold text-indigo-600">
                        {e.leaveBalance} Days
                      </td>
                      <td className="py-3 text-center">
                        <Badge tone="success">{e.status}</Badge>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleFireEmployee(e.id, e.name)}
                          className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-lg transition cursor-pointer"
                          title="Deactivate Employee Profile"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-6 text-slate-400">
                        No employees found matching the search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* SUB-MODULE 2: RECRUITMENT */}
      {activeTab === 'recruitment' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-800 text-sm">Active Job Openings</h3>
              <button
                onClick={() => setShowJobModal(true)}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="size-3.5" /> Publish New Vacancy
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-400">
                    <th className="text-left pb-2">Vacancy ID</th>
                    <th className="text-left pb-2">Job Title</th>
                    <th className="text-left pb-2">Department</th>
                    <th className="text-left pb-2">Job Type</th>
                    <th className="text-center pb-2">Applicants</th>
                    <th className="text-right pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recruitmentList.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 font-mono font-bold text-indigo-500">{r.id}</td>
                      <td className="py-3 font-bold text-slate-800">{r.title}</td>
                      <td className="py-3 font-medium">{r.depts}</td>
                      <td className="py-3 font-semibold text-slate-500">{r.type}</td>
                      <td className="py-3 text-center font-bold text-slate-700">
                        {r.applicants} Candidates
                      </td>
                      <td className="py-3 text-right">
                        <Badge tone={r.status === 'Interviewing' ? 'info' : 'success'}>
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-800 text-sm mb-4">
              Recruitment Pipeline Stats
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl border bg-gradient-soft space-y-2">
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Total Applicants Reviewable
                </div>
                <div className="text-2xl font-black text-indigo-600">47 Candidates</div>
                <div className="text-[10px] text-muted-foreground">
                  Across all engineering and science open slots
                </div>
              </div>
              <div className="p-4 rounded-xl border bg-gradient-soft space-y-2">
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Recruitment Phase
                </div>
                <div className="text-base font-bold text-slate-800">Q3 Hiring Semester</div>
                <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                  <CheckCircle className="size-3.5" /> Background check verification active
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* SUB-MODULE 3: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">
                Biometric RFID Fingerprint Attendance Logs
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time status logs of classroom gateways & department portals.
              </p>
            </div>
            <button
              onClick={handleSyncBiometric}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-soft"
            >
              <Fingerprint className="size-4" /> Sync Devices
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Log ID</th>
                  <th className="text-left pb-2">Employee Name</th>
                  <th className="text-left pb-2">Punch Time</th>
                  <th className="text-left pb-2">Punch Type</th>
                  <th className="text-left pb-2">Device Gate / Room</th>
                  <th className="text-right pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {biometricLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 font-mono font-bold text-indigo-600">{log.id}</td>
                    <td className="py-3 font-bold text-slate-800">{log.employee}</td>
                    <td className="py-3 font-mono text-slate-500 font-semibold">{log.time}</td>
                    <td className="py-3 font-medium text-slate-600">{log.punchType}</td>
                    <td className="py-3 font-semibold text-slate-600">{log.device}</td>
                    <td className="py-3 text-right">
                      <Badge tone={log.status === 'Late' ? 'warn' : 'success'}>{log.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUB-MODULE 4: LEAVE */}
      {activeTab === 'leave' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h3 className="font-semibold text-slate-800 text-sm mb-4">
              Pending Leave Approval Requests
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-400">
                    <th className="text-left pb-2">Request ID</th>
                    <th className="text-left pb-2">Staff Member</th>
                    <th className="text-left pb-2">Leave Category</th>
                    <th className="text-center pb-2">Duration</th>
                    <th className="text-center pb-2">Total Days</th>
                    <th className="text-center pb-2">Status</th>
                    <th className="text-right pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaveRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 font-mono font-bold text-slate-400">{req.id}</td>
                      <td className="py-3 font-bold text-slate-800">{req.employee}</td>
                      <td className="py-3 font-medium text-slate-600">{req.type}</td>
                      <td className="py-3 text-center text-slate-500">
                        {req.start} to {req.end}
                      </td>
                      <td className="py-3 text-center font-bold text-indigo-600">
                        {req.days} Days
                      </td>
                      <td className="py-3 text-center">
                        <Badge
                          tone={
                            req.status === 'Approved'
                              ? 'success'
                              : req.status === 'Rejected'
                                ? 'danger'
                                : 'warn'
                          }
                        >
                          {req.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        {req.status === 'Pending' ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleLeaveDecision(req.id, 'Approved')}
                              className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] font-bold transition cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleLeaveDecision(req.id, 'Rejected')}
                              className="px-2 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded text-[10px] font-bold transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-semibold italic text-[10px]">
                            Processed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-800 text-sm mb-4">Leave Policy Information</h3>
            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="p-3 border rounded-xl space-y-1">
                <div className="font-bold text-slate-800">Casual Leave (CL)</div>
                <div>All faculty members are allotted 12 days per academic year.</div>
              </div>
              <div className="p-3 border rounded-xl space-y-1">
                <div className="font-bold text-slate-800">Earned Leave (EL)</div>
                <div>Max 30 days carry forward allowed. Subject to HOD signature.</div>
              </div>
              <div className="p-3 border rounded-xl space-y-1">
                <div className="font-bold text-slate-800">Duty Leave (OD)</div>
                <div>Approved for conference presentations and university evaluation tasks.</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* SUB-MODULE 5: PAYROLL */}
      {activeTab === 'payroll' && <AdminPayroll />}

      {/* SUB-MODULE 6: PERFORMANCE */}
      {activeTab === 'performance' && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">
                Faculty Performance Appraisals &amp; Publications
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Audit key parameters for NAAC criteria (research publication and student feedback
                rating).
              </p>
            </div>
            <Badge tone="info">Accreditation Ready</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="text-left pb-2">Review ID</th>
                  <th className="text-left pb-2">Staff Member</th>
                  <th className="text-center pb-2">Student Rating Rating</th>
                  <th className="text-center pb-2">Target Achievements</th>
                  <th className="text-center pb-2">Research Publications</th>
                  <th className="text-right pb-2">NAAC Performance Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {performanceRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 font-mono font-bold text-slate-400">{r.id}</td>
                    <td className="py-3 font-bold text-slate-800">{r.employee}</td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-bold">
                        ★ {r.rating} / 5.0
                      </span>
                    </td>
                    <td className="py-3 text-center font-semibold text-slate-700">
                      {r.targetAchieved}
                    </td>
                    <td className="py-3 text-center font-bold text-slate-800">
                      {r.publications} Papers
                    </td>
                    <td className="py-3 text-right">
                      <Badge
                        tone={
                          r.feedbackScore === 'Outstanding' || r.feedbackScore === 'Excellent'
                            ? 'success'
                            : 'info'
                        }
                      >
                        {r.feedbackScore}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL: ADD STAFF MEMBER */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-sm p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <UserPlus className="size-5 text-indigo-600" /> New Employee File
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. K. Srinivasa Rao"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. srinivas@college.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                  >
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">MECH</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Designation</label>
                  <select
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Prof</option>
                    <option value="Assistant Professor">Assistant Prof</option>
                    <option value="Lecturer">Lecturer</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-3 py-2 rounded-xl border text-muted-foreground hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer"
                >
                  Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD VACANCY */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-background border rounded-2xl shadow-xl w-full max-w-sm p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Briefcase className="size-5 text-indigo-600" /> Publish Job Vacancy
              </h3>
              <button
                onClick={() => setShowJobModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Professor of Quantum Computing"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Department</label>
                  <select
                    value={jobDept}
                    onChange={(e) => setJobDept(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none"
                  >
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">MECH</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Job Type</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full mt-1.5 px-3 py-2 rounded-xl border bg-background text-xs focus:border-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="flex-1 px-3 py-2 rounded-xl border text-muted-foreground hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer"
                >
                  Publish Vacancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminHRMS;
