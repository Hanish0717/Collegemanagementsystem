import { useState } from 'react';
import {
  GraduationCap, BookOpen, Clock, Calendar, FileText, Download, Upload,
  CheckCircle, AlertTriangle, Sparkles, Award, Wallet, Building2, User,
  Send, ShieldAlert, ChevronRight, MessageSquare, PlayCircle, FileCode,
  Briefcase, Check, X, Printer, Search, ArrowRight, Zap, Star, Shield,
  Compass, MapPin, Bus, Home, Bed, Phone, Mail, Bell, Key, RefreshCw
} from 'lucide-react';
import { Card, StatCard, Badge } from '@/components/dashboard/ui';
import { printReport, exportToCSV } from '@/lib/exportUtils';
import { toast } from 'sonner';

type PortalTab =
  | 'schedule'
  | 'attendance'
  | 'lms'
  | 'assignments'
  | 'exams'
  | 'fees'
  | 'certificates'
  | 'library'
  | 'hostel'
  | 'transport'
  | 'placements'
  | 'projects'
  | 'internships'
  | 'achievements'
  | 'leave'
  | 'complaints'
  | 'notifications'
  | 'profile'
  | 'ai_assistant';

export function StudentPortal() {
  const [activeTab, setActiveTab] = useState<PortalTab>('schedule');

  // Interactive state handlers
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDays, setLeaveDays] = useState('1');
  const [complaintCategory, setComplaintCategory] = useState('Academic');
  const [complaintText, setComplaintText] = useState('');
  const [bookSearch, setBookSearch] = useState('');

  // Student Profile Data
  const student = {
    name: 'Rohan Sharma',
    rollNo: 'CS2026012',
    branch: 'Computer Science & Engineering',
    section: 'Section A',
    year: 'Year 3',
    semester: 'Semester 6',
    mentor: 'Dr. Srinivas Rao (Professor, CSE)',
    cgpa: '3.84 / 4.0',
    attendance: 88.4,
    status: 'Good Standing',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    email: 'rohan.cs2026012@univ.edu',
    phone: '+91 98765 43210',
    bloodGroup: 'O+',
    address: '142 University Green Park, Block B, City',
    parentName: 'Mr. Suresh Sharma',
    parentPhone: '+91 98111 22334',
  };

  // 1. Timetable
  const todayClasses = [
    { period: 'Period 1 (09:00 - 10:00)', subject: 'Machine Learning (CS-601)', faculty: 'Dr. Srinivas Rao', room: 'LH-101', status: 'Ongoing' },
    { period: 'Period 2 (10:00 - 11:00)', subject: 'Compiler Design (CS-602)', faculty: 'Mrs. Ananya Sen', room: 'LH-102', status: 'Upcoming' },
    { period: 'Period 3 (11:15 - 12:15)', subject: 'Cloud Microservices (CS-603)', faculty: 'Mr. Ramesh Yadav', room: 'LH-104', status: 'Upcoming' },
    { period: 'Period 4 (13:15 - 15:15)', subject: 'AI & Robotics Lab (CS-604L)', faculty: 'Dr. K. Lakshmi', room: 'CSE Lab 3', status: 'Upcoming' },
  ];

  // 2. Attendance
  const subjectAttendance = [
    { subject: 'Machine Learning', present: 28, total: 30, percentage: 93.3 },
    { subject: 'Compiler Design', present: 24, total: 28, percentage: 85.7 },
    { subject: 'Cloud Microservices', present: 26, total: 30, percentage: 86.6 },
    { subject: 'AI & Robotics Lab', present: 18, total: 20, percentage: 90.0 },
  ];

  // 3. LMS Course Materials
  const courseMaterials = [
    { title: 'Unit 3: Deep Neural Networks & Backpropagation', subject: 'Machine Learning', type: 'PPT & Notes', size: '4.8 MB', date: 'Jul 19' },
    { title: 'Lexical Analysis & Syntax Trees Lecture Video', subject: 'Compiler Design', type: 'Recorded Video', size: '124 MB', date: 'Jul 18' },
    { title: 'Lab Manual: Docker & Kubernetes Hands-On', subject: 'Cloud Microservices', type: 'Lab Manual PDF', size: '8.2 MB', date: 'Jul 15' },
    { title: 'Previous 5-Year Solved Question Bank', subject: 'Machine Learning', type: 'Question Bank', size: '14.5 MB', date: 'Jul 10' },
  ];

  // 4. Assignments
  const assignments = [
    { id: 'ASN-1', title: 'Implement CNN Model for Image Classification in PyTorch', subject: 'Machine Learning', dueDate: 'Jul 25', status: 'Pending', grade: 'Pending' },
    { id: 'ASN-2', title: 'Write LL(1) Parser in C/C++', subject: 'Compiler Design', dueDate: 'Jul 28', status: 'Pending', grade: 'Pending' },
    { id: 'ASN-3', title: 'Deploy Microservice API to Minikube Cluster', subject: 'Cloud Microservices', dueDate: 'Jul 18', status: 'Submitted', grade: '95 / 100' },
  ];

  // 5. Examinations
  const upcomingExams = [
    { code: 'CS-601', subject: 'Machine Learning', date: 'Aug 04', time: '10:00 - 13:00', room: 'LH-101', seat: 'Seat A-14', internalMarks: '28/30', externalMarks: 'Expected 65+' },
    { code: 'CS-602', subject: 'Compiler Design', date: 'Aug 06', time: '10:00 - 13:00', room: 'LH-102', seat: 'Seat B-08', internalMarks: '26/30', externalMarks: 'Expected 60+' },
    { code: 'CS-603', subject: 'Cloud Microservices', date: 'Aug 08', time: '10:00 - 13:00', room: 'LH-104', seat: 'Seat C-22', internalMarks: '29/30', externalMarks: 'Expected 68+' },
  ];

  // 6. Fees
  const feeDetails = [
    { type: 'Semester 6 Tuition Fee', amount: '₹45,000', dueDate: 'Paid', status: 'Paid', receiptId: 'RCP-2026-801' },
    { type: 'Hostel & Mess Charges (Sem 6)', amount: '₹22,000', dueDate: 'Paid', status: 'Paid', receiptId: 'RCP-2026-802' },
    { type: 'Exam & Library Fee', amount: '₹2,500', dueDate: 'Aug 01', status: 'Pending', receiptId: 'N/A' },
  ];

  // 8. Library
  const libraryBooks = [
    { id: 'LIB-401', title: 'Pattern Recognition and Machine Learning — Christopher Bishop', issueDate: 'Jul 05', dueDate: 'Jul 25', fine: '₹0' },
    { id: 'LIB-402', title: 'Compilers: Principles, Techniques, and Tools (Dragon Book)', issueDate: 'Jul 10', dueDate: 'Jul 30', fine: '₹0' },
  ];

  // 10. Placement Drives
  const placements = [
    { company: 'Google India', role: 'Software Engineer (L3)', package: '₹24 LPA', eligibility: 'CGPA > 8.0', status: 'Eligible', date: 'Aug 12' },
    { company: 'Microsoft', role: 'Cloud Solutions Engineer', package: '₹22 LPA', eligibility: 'CGPA > 7.5', status: 'Eligible', date: 'Aug 15' },
    { company: 'Amazon AWS', role: 'DevOps Intern', package: '₹18 LPA', eligibility: 'CGPA > 7.0', status: 'Eligible', date: 'Aug 20' },
  ];

  // 11. Projects
  const projects = [
    { title: 'AI Driven Student Academic Performance Predictor', guide: 'Dr. Srinivas Rao', type: 'Major Project', progress: 85, status: 'In Progress' },
    { title: 'Dockerized Microservices E-Commerce Portal', guide: 'Mr. Ramesh Yadav', type: 'Mini Project', progress: 100, status: 'Completed & Evaluated' },
  ];

  // 12. Internships
  const internships = [
    { company: 'TCS Innovation Labs', role: 'AI Engineering Intern', duration: '2 Months (Summer 2026)', stipend: '₹25,000 / Mo', status: 'Completed Certificate Issued' },
  ];

  // 13. Achievements
  const achievements = [
    { title: '1st Rank — National Smart India Hackathon 2026', category: 'Hackathon', year: '2026' },
    { title: 'AWS Certified Solutions Architect Associate', category: 'Global Certification', year: '2025' },
    { title: 'Inter-College Coding Championship Winner', category: 'Awards', year: '2025' },
  ];

  // Handlers
  const handlePrintHallTicket = () => {
    printReport(
      'Official Student Examination Hall Ticket',
      `Candidate: ${student.name} (${student.rollNo}) — ${student.branch}`,
      [
        { header: 'Subject Code', key: 'code' },
        { header: 'Subject Name', key: 'subject' },
        { header: 'Exam Date', key: 'date' },
        { header: 'Time Slot', key: 'time' },
        { header: 'Exam Hall', key: 'room' },
        { header: 'Allocated Seat', key: 'seat' },
      ],
      upcomingExams
    );
  };

  const handleDownloadCertificate = (certType: string) => {
    printReport(
      `Institutional ${certType}`,
      `This is to certify that ${student.name} (${student.rollNo}) is a bona fide student of ${student.branch}, ${student.year}.`,
      [
        { header: 'Field Description', key: 'key' },
        { header: 'Official Details', key: 'val' },
      ],
      [
        { key: 'Student Name', val: student.name },
        { key: 'Roll Number', val: student.rollNo },
        { key: 'Department', val: student.branch },
        { key: 'Academic Status', val: student.status },
        { key: 'Current CGPA', val: student.cgpa },
        { key: 'Issue Date', val: new Date().toLocaleDateString() },
      ]
    );
    toast.success(`${certType} generated and opened for printing!`);
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason) {
      toast.error('Please enter a leave reason.');
      return;
    }
    toast.success(`Leave request submitted for ${leaveDays} day(s). Forwarded to Faculty Mentor & Parent.`);
    setLeaveReason('');
  };

  const handleRaiseComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText) {
      toast.error('Please describe your grievance.');
      return;
    }
    toast.success(`Grievance ticket created under ${complaintCategory}. Ticket ID: TKT-${Math.floor(1000 + Math.random() * 9000)}.`);
    setComplaintText('');
  };

  return (
    <div className="space-y-6">
      
      {/* Canvas LMS Inspired Student HUD Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-2xl relative overflow-hidden border border-blue-800/50">
        <div className="absolute -right-10 -bottom-10 size-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={student.avatar} alt={student.name} className="size-20 rounded-2xl object-cover ring-4 ring-blue-500/30 shadow-lg" />
              <span className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500 ring-2 ring-slate-900 flex items-center justify-center">
                <Check className="size-3 text-white font-extrabold" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {student.rollNo}
                </span>
                <span className="text-xs text-slate-300 font-medium">{student.year} • {student.semester}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white">{student.name}</h1>
              <p className="text-xs text-slate-300 mt-0.5">{student.branch} ({student.section})</p>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">Academic Mentor: <strong className="text-white">{student.mentor}</strong></div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <div className="text-xs text-slate-300 font-bold">Current CGPA</div>
              <div className="text-xl font-black text-amber-400 mt-0.5">{student.cgpa}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <div className="text-xs text-slate-300 font-bold">Attendance</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">{student.attendance}%</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <div className="text-xs text-slate-300 font-bold">Status</div>
              <div className="text-xs font-black text-emerald-300 mt-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20">{student.status}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Student Quick Actions Dock */}
      <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-center gap-2 overflow-x-auto">
        <button onClick={handlePrintHallTicket} className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-blue-500/20">
          <Printer className="size-4" /> Download Hall Ticket
        </button>
        <button onClick={() => setActiveTab('fees')} className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-emerald-500/20">
          <Wallet className="size-4" /> Pay Fees
        </button>
        <button onClick={() => setActiveTab('assignments')} className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer">
          <Upload className="size-4 text-blue-600" /> Upload Assignment
        </button>
        <button onClick={() => setActiveTab('certificates')} className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer">
          <Award className="size-4 text-amber-500" /> Certificates
        </button>
        <button onClick={() => setActiveTab('leave')} className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer">
          <Calendar className="size-4 text-indigo-500" /> Apply Leave
        </button>
        <button onClick={() => setActiveTab('ai_assistant')} className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-violet-500/20">
          <Sparkles className="size-4 text-amber-300" /> Student AI Assistant
        </button>
      </div>

      {/* Navigation Workspace Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        {[
          { id: 'schedule', label: 'Schedule', icon: Clock },
          { id: 'attendance', label: 'Attendance', icon: Calendar },
          { id: 'lms', label: 'LMS Reader', icon: BookOpen },
          { id: 'assignments', label: 'Assignments', icon: FileText, count: 2 },
          { id: 'exams', label: 'Exams & Marks', icon: Award },
          { id: 'fees', label: 'Fees & Dues', icon: Wallet },
          { id: 'certificates', label: 'Certificates', icon: GraduationCap },
          { id: 'library', label: 'Library', icon: BookOpen },
          { id: 'hostel', label: 'Hostel', icon: Home },
          { id: 'transport', label: 'Transport', icon: Bus },
          { id: 'placements', label: 'Placements', icon: Briefcase },
          { id: 'projects', label: 'Projects', icon: FileCode },
          { id: 'internships', label: 'Internships', icon: Zap },
          { id: 'achievements', label: 'Achievements', icon: Star },
          { id: 'leave', label: 'Leave', icon: Calendar },
          { id: 'complaints', label: 'Complaints', icon: AlertTriangle },
          { id: 'notifications', label: 'Circulars', icon: Bell },
          { id: 'profile', label: 'My Profile', icon: User },
          { id: 'ai_assistant', label: 'AI Assistant', icon: Sparkles },
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="size-3.5" />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${isActive ? 'bg-white text-blue-700' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Workspace */}
      <div className="space-y-6">

        {/* Tab 1: Schedule & Timetable */}
        {activeTab === 'schedule' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                      <Clock className="size-5 text-blue-600" /> Today's Live Class Schedule
                    </h3>
                    <p className="text-xs text-slate-500">Real-time period updates for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <Badge tone="info">Active Semester</Badge>
                </div>

                <div className="space-y-3">
                  {todayClasses.map(c => (
                    <div key={c.period} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">{c.period}</span>
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white">{c.subject}</span>
                        </div>
                        <p className="text-xs text-slate-500">Faculty: {c.faculty} • Room: <strong className="text-slate-800 dark:text-slate-200">{c.room}</strong></p>
                      </div>
                      <Badge tone={c.status === 'Ongoing' ? 'success' : 'default'} className="text-[9px]">
                        {c.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-5 border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Award className="size-4 text-blue-600" /> Exam Notice
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Mid-Semester Examination schedule has been released. Download your official hall ticket before Aug 01.
                </p>
                <button onClick={handlePrintHallTicket} className="w-full mt-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer hover:bg-blue-700">
                  Download Hall Ticket PDF
                </button>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Attendance Hub */}
        {activeTab === 'attendance' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-5">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Subject-wise Attendance Progress</h3>
                <div className="space-y-4">
                  {subjectAttendance.map(s => (
                    <div key={s.subject} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">{s.subject}</span>
                        <span className="font-mono text-xs font-black text-emerald-600">{s.percentage}%</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mb-2">Attended {s.present} out of {s.total} conducted lectures</div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="p-5 border-amber-200 dark:border-amber-950 bg-amber-50/20">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <Sparkles className="size-4 text-amber-500" /> AI Attendance Predictor
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                If you attend all lectures next week, your overall attendance increases to <strong className="text-emerald-600">91.2%</strong>.
              </p>
              <button onClick={() => toast.success('Attendance summary PDF generated!')} className="w-full py-2 rounded-xl bg-amber-500 text-white font-bold text-xs cursor-pointer">
                Download Attendance Report
              </button>
            </Card>
          </div>
        )}

        {/* Tab 3: LMS Reader */}
        {activeTab === 'lms' && (
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">LMS Course Materials & Question Banks</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {courseMaterials.map((m, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">{m.subject}</span>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mt-1.5">{m.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{m.type} • {m.size} • Uploaded {m.date}</p>
                  </div>
                  <button onClick={() => toast.success(`Downloaded "${m.title}"`)} className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shrink-0 cursor-pointer shadow-md">
                    <Download className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 4: Assignments */}
        {activeTab === 'assignments' && (
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Course Assignments & Submission Portal</h3>
            <div className="space-y-3">
              {assignments.map(a => (
                <div key={a.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] font-bold text-blue-600">{a.id}</span>
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white">{a.title}</span>
                    </div>
                    <p className="text-xs text-slate-500">Subject: {a.subject} • Due Date: <strong className="text-rose-600">{a.dueDate}</strong></p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge tone={a.status === 'Submitted' ? 'success' : 'warn'} className="text-[9px]">{a.status}</Badge>
                    <button onClick={() => toast.success(`Submission modal opened for ${a.id}`)} className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer">
                      {a.status === 'Submitted' ? 'View Submission' : 'Upload File'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 5: Examinations */}
        {activeTab === 'exams' && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Upcoming Examinations & Seat Allocations</h3>
              <button onClick={handlePrintHallTicket} className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer">
                <Printer className="size-3.5" /> Download Hall Ticket
              </button>
            </div>
            <div className="space-y-3">
              {upcomingExams.map(ex => (
                <div key={ex.code} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-[10px] font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">{ex.code}</span>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mt-1">{ex.subject}</h4>
                    <p className="text-xs text-slate-500">Date: {ex.date} • Time: {ex.time} • Room: <strong>{ex.room}</strong> • Seat: <strong className="text-blue-600">{ex.seat}</strong></p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="text-slate-500 block text-[10px]">Internal Marks</span>
                    <span className="font-extrabold text-emerald-600">{ex.internalMarks}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 6: Fees */}
        {activeTab === 'fees' && (
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Fee Statement & Online Payments</h3>
            <div className="space-y-3">
              {feeDetails.map((f, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{f.type}</h4>
                    <p className="text-xs text-slate-500">Amount: <strong className="text-slate-900 dark:text-white">{f.amount}</strong> • Due: {f.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge tone={f.status === 'Paid' ? 'success' : 'warn'} className="text-[9px]">{f.status}</Badge>
                    {f.status === 'Paid' ? (
                      <button onClick={() => handleDownloadCertificate('Fee Receipt')} className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer">
                        <Printer className="size-3" /> Receipt
                      </button>
                    ) : (
                      <button onClick={() => toast.success(`Redirected to payment gateway for ${f.amount}`)} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer">
                        Pay Online
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 7: Certificates Desk */}
        {activeTab === 'certificates' && (
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Instant Certificate Generation Desk</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { title: 'Bonafide Certificate', desc: 'Official proof of active enrollment' },
                { title: 'Study Certificate', desc: 'Course completion & branch details' },
                { title: 'Fee Payment Receipt', desc: 'Official institutional receipt' },
                { title: 'No Dues Certificate', desc: 'Library & hostel clearance' },
                { title: 'Character Certificate', desc: 'Conduct & discipline endorsement' },
                { title: 'Migration Certificate', desc: 'University transfer document' },
              ].map(c => (
                <div key={c.title} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{c.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 mb-3">{c.desc}</p>
                  <button onClick={() => handleDownloadCertificate(c.title)} className="w-full py-1.5 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer">
                    <Printer className="size-3.5" /> Generate & Print
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 8: Library */}
        {activeTab === 'library' && (
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Central Library Issued Books & Digital Catalog</h3>
            <div className="space-y-3">
              {libraryBooks.map(b => (
                <div key={b.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-blue-600">{b.id}</span>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mt-0.5">{b.title}</h4>
                    <p className="text-xs text-slate-500">Issued: {b.issueDate} • Due Date: <strong className="text-amber-600">{b.dueDate}</strong> • Fine: {b.fine}</p>
                  </div>
                  <button onClick={() => toast.success(`Renewed book ${b.id} for 14 additional days`)} className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer">
                    Renew Book
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 9: Hostel */}
        {activeTab === 'hostel' && (
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Hostel Resident Desk & Mess Menu</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                <span className="text-xs font-bold text-blue-600 uppercase">Room Details</span>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">Hostel Block A — Room 304</h4>
                <p className="text-xs text-slate-500 mt-1">Room Type: 2-Sharing AC • Warden: Mr. K. Sharma (+91 98989 12345)</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Today's Mess Menu</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">Breakfast: Idli Sambar • Lunch: Paneer Butter Masala & Rice • Dinner: Dal Tadka & Chapati</p>
              </div>
            </div>
          </Card>
        )}

        {/* Tab 10: Transport */}
        {activeTab === 'transport' && (
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">University Transport & Live Bus Tracking</h3>
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-extrabold text-blue-600">Bus No #14</span>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5">Route: City Center &gt; Green Park &gt; Campus</h4>
                <p className="text-xs text-slate-500 mt-0.5">Driver: Mr. Satish Kumar (+91 97777 88888) • Live Status: On Schedule</p>
              </div>
              <button onClick={() => toast.success('Live Bus GPS Tracking Map opened.')} className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer">
                Track Live Bus GPS
              </button>
            </div>
          </Card>
        )}

        {/* Tab 11: Placements */}
        {activeTab === 'placements' && (
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Corporate Placement Drives & Career Portal</h3>
            <div className="space-y-3">
              {placements.map(p => (
                <div key={p.company} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{p.company} — {p.role}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Package: <strong className="text-emerald-600">{p.package}</strong> • Criteria: {p.eligibility} • Drive Date: {p.date}</p>
                  </div>
                  <button onClick={() => toast.success(`Applied for ${p.company} placement drive!`)} className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer">
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 12: Projects */}
        {activeTab === 'projects' && (
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Academic Projects & Research Submissions</h3>
            <div className="space-y-3">
              {projects.map((pr, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">{pr.type}</span>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mt-1">{pr.title}</h4>
                    <p className="text-xs text-slate-500">Guide: {pr.guide} • Progress: <strong className="text-blue-600">{pr.progress}%</strong></p>
                  </div>
                  <button onClick={() => toast.success(`Submitted source code for ${pr.title}`)} className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer">
                    Upload Source Code
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 13: Internships */}
        {activeTab === 'internships' && (
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Industry Internships & Summer Training</h3>
            <div className="space-y-3">
              {internships.map((it, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{it.company} — {it.role}</h4>
                    <p className="text-xs text-slate-500">{it.duration} • Stipend: <strong className="text-emerald-600">{it.stipend}</strong></p>
                  </div>
                  <Badge tone="success" className="text-[9px]">{it.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 14: Achievements */}
        {activeTab === 'achievements' && (
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Student Achievements, Awards & Certifications</h3>
            <div className="space-y-3">
              {achievements.map((ac, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center gap-3">
                  <Star className="size-5 text-amber-500 shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{ac.title}</h4>
                    <p className="text-[11px] text-slate-500">{ac.category} • Year {ac.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 15: Leave Management */}
        {activeTab === 'leave' && (
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Apply for Academic Leave</h3>
            <form onSubmit={handleApplyLeave} className="space-y-4 max-w-lg">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Number of Days</label>
                <select value={leaveDays} onChange={e => setLeaveDays(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900">
                  <option value="1">1 Day</option>
                  <option value="2">2 Days</option>
                  <option value="3">3 Days</option>
                  <option value="5">5 Days (Medical Leave)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Reason for Leave</label>
                <textarea
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  rows={3}
                  placeholder="Specify illness or personal reason..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900"
                />
              </div>
              <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer hover:bg-blue-700">
                Submit Leave Application
              </button>
            </form>
          </Card>
        )}

        {/* Tab 16: Complaints */}
        {activeTab === 'complaints' && (
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Raise Student Grievance / Complaint</h3>
            <form onSubmit={handleRaiseComplaint} className="space-y-4 max-w-lg">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                <select value={complaintCategory} onChange={e => setComplaintCategory(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900">
                  <option value="Academic">Academic / Lecture</option>
                  <option value="Hostel">Hostel Maintenance</option>
                  <option value="Library">Library Services</option>
                  <option value="Transport">Transport / Bus</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Grievance Description</label>
                <textarea
                  value={complaintText}
                  onChange={e => setComplaintText(e.target.value)}
                  rows={3}
                  placeholder="Describe issue..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900"
                />
              </div>
              <button type="submit" className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs cursor-pointer hover:bg-rose-700">
                Submit Grievance Ticket
              </button>
            </form>
          </Card>
        )}

        {/* Tab 17: Notifications */}
        {activeTab === 'notifications' && (
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Official College Circulars & Notifications</h3>
            <div className="space-y-3">
              {[
                { title: 'Mid-Semester Examination Schedule Published', date: 'Jul 21', category: 'Exam' },
                { title: 'Campus Placement Drive — Google India Registration Open', date: 'Jul 20', category: 'Placement' },
                { title: 'Annual Tech Fest "TechVista 2026" Announcements', date: 'Jul 18', category: 'Events' },
              ].map((nc, i) => (
                <div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">{nc.category}</span>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white mt-1">{nc.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Posted: {nc.date}</p>
                  </div>
                  <button onClick={() => toast.success(`Viewing circular: ${nc.title}`)} className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold cursor-pointer">
                    Read Circular
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 18: Profile */}
        {activeTab === 'profile' && (
          <Card className="p-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4">Student Profile & Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                <p>Full Name: <strong>{student.name}</strong></p>
                <p>Roll Number: <strong>{student.rollNo}</strong></p>
                <p>Department: <strong>{student.branch}</strong></p>
                <p>Email: <strong>{student.email}</strong></p>
                <p>Phone: <strong>{student.phone}</strong></p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                <p>Blood Group: <strong>{student.bloodGroup}</strong></p>
                <p>Parent Name: <strong>{student.parentName}</strong></p>
                <p>Parent Phone: <strong>{student.parentPhone}</strong></p>
                <p>Permanent Address: <strong>{student.address}</strong></p>
              </div>
            </div>
          </Card>
        )}

        {/* Tab 19: AI Assistant */}
        {activeTab === 'ai_assistant' && (
          <Card className="p-5 border-violet-200 dark:border-violet-950 bg-violet-50/20">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Sparkles className="size-5 text-violet-600" /> Student AI Academic Assistant
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
              AI-driven insights for CGPA optimization, exam preparation strategy, and career readiness.
            </p>

            <div className="grid md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="font-extrabold text-slate-900 dark:text-white block mb-1">CGPA Predictor</span>
                <p className="text-[11px] text-slate-500">Scoring A grade in Machine Learning & Compiler Design will boost your CGPA from <strong className="text-blue-600">3.84</strong> to <strong className="text-emerald-600">3.91</strong>.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="font-extrabold text-slate-900 dark:text-white block mb-1">Placement Readiness</span>
                <p className="text-[11px] text-slate-500">Your readiness score is <strong className="text-emerald-600">86%</strong> based on project portfolio, PyTorch coursework, and CGPA.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="font-extrabold text-slate-900 dark:text-white block mb-1">Exam Prep Planner</span>
                <p className="text-[11px] text-slate-500">Recommended 2.5 study hours/day focusing on Compiler Parsing Trees before Aug 04.</p>
              </div>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}
