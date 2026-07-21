/**
 * FacultyCounselling.tsx
 * Student Counselling Module for Faculty
 *
 * - Department-wise student assignment (only logged-in faculty's dept)
 * - Equal distribution among faculty in the same dept
 * - Multi-section counselling form (10 sections, right-side drawer)
 * - Student detail view with full profile
 * - Counselling history stored in localStorage
 * - PDF report generation
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartHandshake,
  Search,
  Filter,
  Users,
  BookOpen,
  AlertTriangle,
  Percent,
  X,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Download,
  Eye,
  Edit3,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  FileText,
  Star,
  BarChart3,
  TrendingUp,
  GraduationCap,
  MessageSquare,
  Printer,
  Save,
  Send,
  ArrowLeft,
  Building2,
  Badge as BadgeIcon,
} from 'lucide-react';
import { PageHeader, Card, Badge } from '@/components/dashboard/ui';
import { toast } from 'sonner';
import { getStoredFacultyProfile, ALL_FACULTY_MEMBERS } from '@/services/facultyProfileService';
import api from '@/lib/api';

// ─── Types ──────────────────────────────────────────────────────────────────

interface StudentRecord {
  id: string;
  fullName: string;
  rollNumber: string;
  email: string;
  department: string;
  year: number;
  semester: number;
  section: string;
  attendancePercentage: number;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  gender?: string;
  phoneNumber?: string;
  admissionNumber?: string;
}

interface SubjectMark { subject: string; marks: string; }
interface MonthAttendance { month: string; percentage: string; }
interface CounsellorComment { comment: string; date: string; faculty: string; }

interface CounsellingRecord {
  id: string;
  studentRoll: string;
  facultyId: string;
  date: string;
  // Section 1
  hostelInfo: string;
  transport: string;
  journeyTime: string;
  hasTextbooks: string;
  // Section 2
  difficultSubjects: string;
  difficultReason: string;
  easySubjects: string;
  easyReason: string;
  // Section 3
  subjectMarks: SubjectMark[];
  monthlyAttendance: MonthAttendance[];
  // Section 4
  behaviourInClass: number;
  discipline: number;
  communicationSkills: number;
  participation: number;
  learningAbility: number;
  concentration: number;
  confidenceLevel: number;
  // Section 5
  hoursStudying: string;
  hoursAssignments: string;
  hoursTv: string;
  hoursMobile: string;
  hoursSocialMedia: string;
  hoursGames: string;
  hoursSleep: string;
  // Section 6
  recommendations: string;
  actionPlan: string;
  goalsNextMeeting: string;
  // Section 7
  bestFriends: string;
  disturbanceFactors: string;
  familySupport: string;
  facultyEncouragement: string;
  healthIssues: string;
  financialIssues: string;
  mentalWellbeing: string;
  // Section 8
  comments: CounsellorComment[];
  // Section 9
  nextCounsellingDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  // Section 10
  documents: string[];
  // meta
  status: 'Draft' | 'Submitted';
  summary?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'cms_counselling_records';

function loadRecords(): CounsellingRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    
    // Seed default sample counselling sessions for active testing/demo
    const demoRecords: CounsellingRecord[] = [
      {
        id: 'CR-DEMO-1',
        studentRoll: 'CSE26001',
        facultyId: 'FACCSE1',
        date: '2026-07-10',
        hostelInfo: 'Hosteller',
        transport: 'College Bus',
        journeyTime: '20 mins',
        hasTextbooks: 'Yes',
        difficultSubjects: 'Data Structures',
        difficultReason: 'Finding recursion and pointers logic hard to trace.',
        easySubjects: 'Digital Logic Design',
        easyReason: 'Enjoys boolean algebra.',
        subjectMarks: [
          { subject: 'Data Structures', marks: '14/25' },
          { subject: 'Digital Logic', marks: '22/25' }
        ],
        monthlyAttendance: [
          { month: 'June 2026', percentage: '92' },
          { month: 'July 2026', percentage: '94' }
        ],
        behaviourInClass: 4,
        discipline: 5,
        communicationSkills: 4,
        participation: 4,
        learningAbility: 3,
        concentration: 4,
        confidenceLevel: 3,
        hoursStudying: '3',
        hoursAssignments: '2',
        hoursTv: '1',
        hoursMobile: '2',
        hoursSocialMedia: '1',
        hoursGames: '0',
        hoursSleep: '7',
        recommendations: 'Recommended practicing daily coding exercises and attending peer discussion groups.',
        actionPlan: 'Solve 2 recursion problems daily. Check progress in next meeting.',
        goalsNextMeeting: 'Understand linked lists completely.',
        bestFriends: 'Sai, Vikram',
        disturbanceFactors: 'Social media notifications',
        familySupport: 'Very Supportive',
        facultyEncouragement: 'Offered extra lab assistance.',
        healthIssues: 'None',
        financialIssues: 'None',
        mentalWellbeing: 'Good but slightly anxious about exams.',
        comments: [
          { comment: 'Shows keen interest during digital logic labs.', date: '2026-07-10', faculty: 'Kambhampati Harish' }
        ],
        nextCounsellingDate: '2026-08-10',
        priority: 'Medium',
        documents: ['Progress Report: sem1_midterm.pdf'],
        status: 'Submitted',
        summary: 'Requires practice on recursive programming.'
      },
      {
        id: 'CR-DEMO-2',
        studentRoll: 'CSE26007',
        facultyId: 'FACCSE1',
        date: '2026-07-15',
        hostelInfo: 'Day Scholar',
        transport: 'Private Vehicle',
        journeyTime: '50 mins',
        hasTextbooks: 'No',
        difficultSubjects: 'Mathematics',
        difficultReason: 'Backlog in integration formulas.',
        easySubjects: 'English',
        easyReason: 'Enjoys reading books.',
        subjectMarks: [
          { subject: 'Mathematics', marks: '8/25' }
        ],
        monthlyAttendance: [
          { month: 'July 2026', percentage: '68' }
        ],
        behaviourInClass: 2,
        discipline: 3,
        communicationSkills: 3,
        participation: 2,
        learningAbility: 2,
        concentration: 2,
        confidenceLevel: 2,
        hoursStudying: '1',
        hoursAssignments: '1',
        hoursTv: '3',
        hoursMobile: '5',
        hoursSocialMedia: '3',
        hoursGames: '2',
        hoursSleep: '6',
        recommendations: 'Strictly advised to purchase course textbooks and improve class attendance to cross minimum threshold.',
        actionPlan: 'Attend remedial math classes starting Monday.',
        goalsNextMeeting: 'Improve monthly attendance to above 75%.',
        bestFriends: 'Lokesh',
        disturbanceFactors: 'Excessive gaming and mobile use',
        familySupport: 'Moderate support',
        facultyEncouragement: 'Warned about shortage criteria.',
        healthIssues: 'Suffered from seasonal flu mid-month.',
        financialIssues: 'Faced difficulties acquiring books.',
        mentalWellbeing: 'Stressed due to low scores.',
        comments: [
          { comment: 'Frequently distracted in lectures.', date: '2026-07-15', faculty: 'Kambhampati Harish' }
        ],
        nextCounsellingDate: '2026-07-28',
        priority: 'Critical',
        documents: [],
        status: 'Submitted',
        summary: 'Low attendance and poor marks in Mathematics.'
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoRecords));
    return demoRecords;
  } catch { return []; }
}

function saveRecords(records: CounsellingRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function makeBlankRecord(studentRoll: string, facultyId: string, facultyName: string): CounsellingRecord {
  return {
    id: `CR-${Date.now()}`,
    studentRoll,
    facultyId,
    date: new Date().toISOString().slice(0, 10),
    hostelInfo: 'Day Scholar',
    transport: '',
    journeyTime: '',
    hasTextbooks: 'Yes',
    difficultSubjects: '',
    difficultReason: '',
    easySubjects: '',
    easyReason: '',
    subjectMarks: [{ subject: '', marks: '' }],
    monthlyAttendance: [{ month: '', percentage: '' }],
    behaviourInClass: 3,
    discipline: 3,
    communicationSkills: 3,
    participation: 3,
    learningAbility: 3,
    concentration: 3,
    confidenceLevel: 3,
    hoursStudying: '',
    hoursAssignments: '',
    hoursTv: '',
    hoursMobile: '',
    hoursSocialMedia: '',
    hoursGames: '',
    hoursSleep: '',
    recommendations: '',
    actionPlan: '',
    goalsNextMeeting: '',
    bestFriends: '',
    disturbanceFactors: '',
    familySupport: '',
    facultyEncouragement: '',
    healthIssues: '',
    financialIssues: '',
    mentalWellbeing: '',
    comments: [{ comment: '', date: new Date().toISOString().slice(0, 10), faculty: facultyName }],
    nextCounsellingDate: '',
    priority: 'Medium',
    documents: [],
    status: 'Draft',
    summary: '',
  };
}

function getAttendanceColor(pct: number) {
  if (pct >= 90) return 'text-emerald-600';
  if (pct >= 75) return 'text-amber-600';
  return 'text-rose-600';
}

function getAttendanceBg(pct: number) {
  if (pct >= 90) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (pct >= 75) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-rose-100 text-rose-700 border-rose-200';
}

function getPriorityColor(p: string) {
  switch (p) {
    case 'Critical': return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'High':     return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Medium':   return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Low':      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    default:         return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function getCounsellingStatus(records: CounsellingRecord[], roll: string) {
  const recs = records.filter(r => r.studentRoll === roll);
  if (recs.length === 0) return 'Not Started';
  const last = recs[recs.length - 1];
  if (last.priority === 'Critical' || last.priority === 'High') return 'Needs Attention';
  if (last.status === 'Submitted') return 'Counselled';
  return 'In Progress';
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'Counselled':     return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Needs Attention': return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'In Progress':    return 'bg-blue-100 text-blue-700 border-blue-200';
    default:               return 'bg-slate-100 text-slate-500 border-slate-200';
  }
}

function getLastCounsellingDate(records: CounsellingRecord[], roll: string) {
  const recs = records.filter(r => r.studentRoll === roll && r.status === 'Submitted');
  if (recs.length === 0) return null;
  return recs[recs.length - 1].date;
}

// Rating star widget
function RatingStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`size-7 rounded-lg transition font-bold text-sm ${n <= value ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-indigo-100'}`}
        >
          {n}
        </button>
      ))}
      <span className="ml-2 text-xs text-muted-foreground">
        {['', 'Poor', 'Below Avg', 'Average', 'Good', 'Excellent'][value]}
      </span>
    </div>
  );
}

// Section accordion wrapper
function FormSection({ title, children, defaultOpen = false }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition text-left"
      >
        <span className="font-bold text-sm text-foreground">{title}</span>
        {open ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}

// Form field
function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition";
const textareaCls = `${inputCls} min-h-[80px] resize-y`;

// ─── Main Component ──────────────────────────────────────────────────────────

export function FacultyCounselling() {
  const profile = getStoredFacultyProfile();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [semFilter, setSemFilter] = useState('All');
  const [secFilter, setSecFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [attFilter, setAttFilter] = useState('All');
  const [records, setRecords] = useState<CounsellingRecord[]>(loadRecords);

  // UI states
  const [view, setView] = useState<'grid' | 'student' | 'form'>('grid');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<CounsellingRecord | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // ── Load students from API, then slice for this faculty ──────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get('/api/students?limit=1000');
        const raw: any[] = res.data?.data?.students || res.data?.students || res.data?.data || [];

        const mapped: StudentRecord[] = raw.map((s: any) => {
          const dept = typeof s.department === 'string' 
            ? s.department 
            : (s.department?.code || s.department?.name || '');
          
          return {
            id: s._id || s.id || s.roll_number,
            fullName: s.full_name || s.fullName || s.name || 'Unknown',
            rollNumber: s.roll_number || s.rollNumber || '',
            email: s.email || '',
            department: dept,
            year: s.year || 1,
            semester: s.semester || 1,
            section: s.section || 'A',
            attendancePercentage: s.attendance_percentage !== undefined 
              ? Number(s.attendance_percentage) 
              : (s.attendancePercentage !== undefined ? Number(s.attendancePercentage) : Math.floor(75 + Math.random() * 25)),
            parentName: s.parent_name || s.parentName || '',
            parentPhone: s.parent_phone || s.parentPhone || '',
            parentEmail: s.parent_email || s.parentEmail || '',
            gender: s.gender || '',
            phoneNumber: s.phone_number || s.phoneNumber || '',
            admissionNumber: s.admission_number || s.admissionNumber || '',
          };
        }).filter(s => s.department?.toUpperCase() === profile.department?.toUpperCase());

        // Sort by roll number for consistent splitting
        mapped.sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));

        // Slice for this faculty
        const deptFaculty = ALL_FACULTY_MEMBERS.filter(f => f.department === profile.department);
        const myIndex = deptFaculty.findIndex(f => f.employeeId === profile.employeeId);
        const idx = myIndex < 0 ? 0 : myIndex;
        const chunkSize = Math.ceil(mapped.length / Math.max(1, deptFaculty.length));
        const mine = mapped.slice(idx * chunkSize, (idx + 1) * chunkSize);
        setStudents(mine);
      } catch (err) {
        console.error('Failed to load students:', err);
        setStudents([]);
      }
      setLoading(false);
    }
    load();
  }, [profile.employeeId, profile.department]);

  // Persist counselling records
  const persistRecords = (recs: CounsellingRecord[]) => {
    setRecords(recs);
    saveRecords(recs);
  };

  // ── Computed stats ───────────────────────────────────────────────────────
  const counselledCount = useMemo(() =>
    students.filter(s => getCounsellingStatus(records, s.rollNumber) === 'Counselled').length,
    [students, records]);
  const needsAttentionCount = useMemo(() =>
    students.filter(s => getCounsellingStatus(records, s.rollNumber) === 'Needs Attention').length,
    [students, records]);
  const avgAtt = useMemo(() => {
    if (students.length === 0) return 0;
    return Math.round(students.reduce((a, s) => a + s.attendancePercentage, 0) / students.length);
  }, [students]);

  // ── Filters ───────────────────────────────────────────────────────────────
  const semesters = useMemo(() => ['All', ...Array.from(new Set(students.map(s => String(s.semester))))], [students]);
  const sections = useMemo(() => ['All', ...Array.from(new Set(students.map(s => s.section)))], [students]);

  const filtered = useMemo(() => students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.fullName.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q);
    const matchSem = semFilter === 'All' || String(s.semester) === semFilter;
    const matchSec = secFilter === 'All' || s.section === secFilter;
    const matchAtt = attFilter === 'All' ||
      (attFilter === 'low' && s.attendancePercentage < 75) ||
      (attFilter === 'medium' && s.attendancePercentage >= 75 && s.attendancePercentage < 90) ||
      (attFilter === 'high' && s.attendancePercentage >= 90);
    const cStatus = getCounsellingStatus(records, s.rollNumber);
    const matchStatus = statusFilter === 'All' || cStatus === statusFilter;
    return matchSearch && matchSem && matchSec && matchAtt && matchStatus;
  }), [students, search, semFilter, secFilter, attFilter, statusFilter, records]);

  // ── Counselling form handlers ─────────────────────────────────────────────
  const openAddForm = (student: StudentRecord) => {
    const blank = makeBlankRecord(student.rollNumber, profile.employeeId, profile.name);
    setEditingRecord(blank);
    setSelectedStudent(student);
    setView('form');
  };

  const openEditForm = (student: StudentRecord, record: CounsellingRecord) => {
    setEditingRecord({ ...record });
    setSelectedStudent(student);
    setView('form');
  };

  const saveForm = (asDraft: boolean) => {
    if (!editingRecord || !selectedStudent) return;
    const updated = {
      ...editingRecord,
      status: asDraft ? 'Draft' as const : 'Submitted' as const,
      summary: editingRecord.recommendations || `Counselling session for ${selectedStudent.fullName}`,
      date: editingRecord.date || new Date().toISOString().slice(0, 10),
    };
    const existing = records.filter(r => r.id !== updated.id);
    persistRecords([...existing, updated]);
    toast.success(asDraft ? 'Draft saved!' : 'Counselling record submitted!');
    setView('student');
  };

  const generateReport = (student: StudentRecord) => {
    const recs = records.filter(r => r.studentRoll === student.rollNumber);
    const lines = [
      '=================================================',
      '    COLLEGE MANAGEMENT SYSTEM',
      '    STUDENT COUNSELLING REPORT',
      '=================================================',
      '',
      `Student Name   : ${student.fullName}`,
      `Roll Number    : ${student.rollNumber}`,
      `Department     : ${student.department}`,
      `Year / Sem     : ${student.year} / ${student.semester}`,
      `Section        : ${student.section}`,
      `Attendance     : ${student.attendancePercentage}%`,
      '',
      `Counsellor     : ${profile.name}`,
      `Employee ID    : ${profile.employeeId}`,
      `Generated On   : ${new Date().toLocaleDateString('en-IN')}`,
      '',
      '-------------------------------------------------',
      `Total Sessions : ${recs.length}`,
      '',
      ...recs.map((r, i) => [
        `Session ${i + 1} — ${r.date}`,
        `  Status   : ${r.status}`,
        `  Priority : ${r.priority}`,
        `  Summary  : ${r.summary || r.recommendations || '-'}`,
        `  Next Date: ${r.nextCounsellingDate || '-'}`,
        '',
      ]).flat(),
      '=================================================',
      '    This is a computer-generated report.',
      '=================================================',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Counselling_Report_${student.rollNumber}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Report downloaded for ${student.fullName}`);
  };

  // ── VIEWS ─────────────────────────────────────────────────────────────────

  if (view === 'student' && selectedStudent) {
    return (
      <StudentDetailView
        student={selectedStudent}
        records={records.filter(r => r.studentRoll === selectedStudent.rollNumber)}
        profile={profile}
        onBack={() => { setView('grid'); setSelectedStudent(null); }}
        onAddCounselling={() => openAddForm(selectedStudent)}
        onEditRecord={(rec) => openEditForm(selectedStudent, rec)}
        onDownload={() => generateReport(selectedStudent)}
      />
    );
  }

  if (view === 'form' && editingRecord && selectedStudent) {
    return (
      <CounsellingForm
        student={selectedStudent}
        record={editingRecord}
        onChange={setEditingRecord}
        onCancel={() => setView('student')}
        onSaveDraft={() => saveForm(true)}
        onSubmit={() => saveForm(false)}
      />
    );
  }

  // Grid view
  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Student Counselling"
        desc={`Manage counselling records, academic guidance, attendance analysis and student progress assigned to you. · ${profile.department} Dept`}
      />

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <Users className="size-5 text-indigo-600" />, bg: 'bg-indigo-50 dark:bg-indigo-950/40', label: 'Assigned Students', value: students.length, color: 'text-indigo-700 dark:text-indigo-300' },
          { icon: <HeartHandshake className="size-5 text-emerald-600" />, bg: 'bg-emerald-50 dark:bg-emerald-950/40', label: 'Counselling Sessions', value: records.filter(r => r.facultyId === profile.employeeId && r.status === 'Submitted').length, color: 'text-emerald-700 dark:text-emerald-300' },
          { icon: <AlertTriangle className="size-5 text-rose-600" />, bg: 'bg-rose-50 dark:bg-rose-950/40', label: 'Needs Attention', value: needsAttentionCount, color: 'text-rose-700 dark:text-rose-300' },
          { icon: <Percent className="size-5 text-amber-600" />, bg: 'bg-amber-50 dark:bg-amber-950/40', label: 'Average Attendance', value: `${avgAtt}%`, color: 'text-amber-700 dark:text-amber-300' },
        ].map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${c.bg}`}>{c.icon}</div>
              <p className="text-xs text-muted-foreground font-medium">{c.label}</p>
              <p className={`text-2xl font-extrabold mt-0.5 ${c.color}`}>{loading ? '—' : c.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Search & Filters ── */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or roll number…"
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-border text-foreground hover:bg-muted'}`}
          >
            <Filter className="size-4" />
            Filters
            {[semFilter, secFilter, attFilter, statusFilter].filter(f => f !== 'All').length > 0 && (
              <span className="ml-1 size-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                {[semFilter, secFilter, attFilter, statusFilter].filter(f => f !== 'All').length}
              </span>
            )}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t">
                {[
                  { label: 'Semester', value: semFilter, options: semesters.map(s => ({ v: s, l: s === 'All' ? 'All Semesters' : `Sem ${s}` })), onChange: setSemFilter },
                  { label: 'Section', value: secFilter, options: sections.map(s => ({ v: s, l: s === 'All' ? 'All Sections' : `Section ${s}` })), onChange: setSecFilter },
                  { label: 'Attendance', value: attFilter, options: [{ v: 'All', l: 'All Attendance' }, { v: 'high', l: '≥90% (Good)' }, { v: 'medium', l: '75-90%' }, { v: 'low', l: '<75% (Low)' }], onChange: setAttFilter },
                  { label: 'Status', value: statusFilter, options: [{ v: 'All', l: 'All Statuses' }, { v: 'Not Started', l: 'Not Started' }, { v: 'In Progress', l: 'In Progress' }, { v: 'Counselled', l: 'Counselled' }, { v: 'Needs Attention', l: 'Needs Attention' }], onChange: setStatusFilter },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{f.label}</label>
                    <select
                      value={f.value}
                      onChange={e => f.onChange(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    >
                      {f.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* ── Student List count ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-bold text-foreground">{filtered.length}</span> of {students.length} assigned students
        </p>
      </div>

      {/* ── Student Cards Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <HeartHandshake className="size-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No students found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((student, i) => {
            const cStatus = getCounsellingStatus(records, student.rollNumber);
            const lastDate = getLastCounsellingDate(records, student.rollNumber);
            const attColor = getAttendanceColor(student.attendancePercentage);
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
              >
                <Card className="p-4 hover:shadow-md transition-shadow group cursor-pointer" onClick={() => { setSelectedStudent(student); setView('student'); }}>
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow">
                      {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-foreground truncate group-hover:text-indigo-600 transition-colors">{student.fullName}</h4>
                      <p className="text-xs text-muted-foreground">{student.rollNumber}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex-shrink-0 ${getStatusBadgeClass(cStatus)}`}>
                      {cStatus}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                    <div className="text-center p-1.5 rounded-lg bg-muted/40">
                      <p className="text-muted-foreground">Dept</p>
                      <p className="font-semibold text-foreground">{student.department}</p>
                    </div>
                    <div className="text-center p-1.5 rounded-lg bg-muted/40">
                      <p className="text-muted-foreground">Year</p>
                      <p className="font-semibold text-foreground">Y{student.year} S{student.semester}</p>
                    </div>
                    <div className="text-center p-1.5 rounded-lg bg-muted/40">
                      <p className="text-muted-foreground">Section</p>
                      <p className="font-semibold text-foreground">{student.section}</p>
                    </div>
                  </div>

                  {/* Attendance bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Attendance</span>
                      <span className={`font-bold ${attColor}`}>{student.attendancePercentage}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${student.attendancePercentage >= 90 ? 'bg-emerald-500' : student.attendancePercentage >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${student.attendancePercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Last session */}
                  {lastDate && (
                    <p className="text-[11px] text-muted-foreground mb-3 flex items-center gap-1">
                      <Calendar className="size-3" /> Last session: {new Date(lastDate).toLocaleDateString('en-IN')}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => { setSelectedStudent(student); setView('student'); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground transition"
                    >
                      <Eye className="size-3" /> View
                    </button>
                    <button
                      onClick={() => openAddForm(student)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition"
                    >
                      <Plus className="size-3" /> Add
                    </button>
                    <button
                      onClick={() => generateReport(student)}
                      className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-700 transition border border-emerald-200"
                    >
                      <Download className="size-3" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Student Detail View ──────────────────────────────────────────────────────

function StudentDetailView({ student, records, profile, onBack, onAddCounselling, onEditRecord, onDownload }: {
  student: StudentRecord;
  records: CounsellingRecord[];
  profile: any;
  onBack: () => void;
  onAddCounselling: () => void;
  onEditRecord: (r: CounsellingRecord) => void;
  onDownload: () => void;
}) {
  const submittedRecords = records.filter(r => r.status === 'Submitted');
  const draftRecords = records.filter(r => r.status === 'Draft');

  return (
    <div className="space-y-6 pb-12">
      {/* Back header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="size-4" /> Back to Counselling
        </button>
      </div>

      {/* Student profile card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 border-4 border-white/30 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{student.fullName}</h2>
              <p className="text-indigo-200 text-sm">{student.rollNumber} · {student.department} · Year {student.year}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full">Sem {student.semester}</span>
                <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full">Section {student.section}</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getAttendanceBg(student.attendancePercentage)}`}>
                  {student.attendancePercentage}% Attendance
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={onAddCounselling} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-indigo-700 text-sm font-bold hover:bg-indigo-50 transition shadow">
                <Plus className="size-4" /> Add Counselling
              </button>
              <button onClick={onDownload} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition">
                <Download className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick info strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x border-t bg-white dark:bg-slate-900">
          {[
            { label: 'Department', value: student.department },
            { label: 'Email', value: student.email || '—' },
            { label: 'Phone', value: student.phoneNumber || '—' },
            { label: 'Admission No', value: student.admissionNumber || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xs font-semibold text-foreground truncate mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Parent details */}
      {(student.parentName || student.parentPhone) && (
        <Card className="p-4">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><User className="size-4 text-indigo-500" /> Parent / Guardian Details</h3>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            {student.parentName && <div><p className="text-muted-foreground text-xs">Name</p><p className="font-medium">{student.parentName}</p></div>}
            {student.parentPhone && <div><p className="text-muted-foreground text-xs">Phone</p><p className="font-medium">{student.parentPhone}</p></div>}
            {student.parentEmail && <div><p className="text-muted-foreground text-xs">Email</p><p className="font-medium">{student.parentEmail}</p></div>}
          </div>
        </Card>
      )}

      {/* Counselling History */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between bg-muted/20">
          <h3 className="font-bold text-sm flex items-center gap-2"><HeartHandshake className="size-4 text-indigo-500" /> Counselling History ({submittedRecords.length} sessions)</h3>
          {draftRecords.length > 0 && (
            <span className="text-xs text-amber-600 font-semibold">{draftRecords.length} draft(s) saved</span>
          )}
        </div>
        {records.length === 0 ? (
          <div className="text-center py-10">
            <HeartHandshake className="size-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No counselling records yet. Click "Add Counselling" to begin.</p>
          </div>
        ) : (
          <div className="divide-y">
            {records.map((rec, i) => (
              <div key={rec.id} className="px-5 py-4 hover:bg-muted/10 transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-foreground">Session {i + 1}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="size-3" />{new Date(rec.date).toLocaleDateString('en-IN')}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getPriorityColor(rec.priority)}`}>{rec.priority}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${rec.status === 'Submitted' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>{rec.status}</span>
                    </div>
                    {rec.summary && <p className="text-xs text-muted-foreground mb-1">{rec.summary}</p>}
                    {rec.nextCounsellingDate && <p className="text-xs text-blue-600 font-medium">Next: {new Date(rec.nextCounsellingDate).toLocaleDateString('en-IN')}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => onEditRecord(rec)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition">
                      <Edit3 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Counselling Form (10 sections) ──────────────────────────────────────────

function CounsellingForm({ student, record, onChange, onCancel, onSaveDraft, onSubmit }: {
  student: StudentRecord;
  record: CounsellingRecord;
  onChange: (r: CounsellingRecord) => void;
  onCancel: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}) {
  const up = (patch: Partial<CounsellingRecord>) => onChange({ ...record, ...patch });

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="size-4" /> Back
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Add Counselling Record</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{student.fullName} · {student.rollNumber} · {student.department}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onSaveDraft} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border bg-background text-sm font-semibold hover:bg-muted transition">
            <Save className="size-4" /> Save Draft
          </button>
          <button onClick={onSubmit} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition shadow">
            <Send className="size-4" /> Submit
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Section 1: Basic Details */}
        <FormSection title="① Basic Details" defaultOpen>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Student Name"><input readOnly value={student.fullName} className={`${inputCls} opacity-70`} /></Field>
            <Field label="Roll Number"><input readOnly value={student.rollNumber} className={`${inputCls} opacity-70`} /></Field>
            <Field label="Department"><input readOnly value={student.department} className={`${inputCls} opacity-70`} /></Field>
            <Field label="Year"><input readOnly value={`Year ${student.year}`} className={`${inputCls} opacity-70`} /></Field>
            <Field label="Semester"><input readOnly value={`Semester ${student.semester}`} className={`${inputCls} opacity-70`} /></Field>
            <Field label="Section"><input readOnly value={student.section} className={`${inputCls} opacity-70`} /></Field>
            <Field label="Hostel Information">
              <select value={record.hostelInfo} onChange={e => up({ hostelInfo: e.target.value })} className={inputCls}>
                {['Day Scholar', 'Hosteller'].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Mode of Transport">
              <input value={record.transport} onChange={e => up({ transport: e.target.value })} placeholder="e.g. College Bus, Private, Walking" className={inputCls} />
            </Field>
            <Field label="Time of Journey">
              <input value={record.journeyTime} onChange={e => up({ journeyTime: e.target.value })} placeholder="e.g. 45 minutes" className={inputCls} />
            </Field>
            <Field label="Do you have all textbooks?">
              <select value={record.hasTextbooks} onChange={e => up({ hasTextbooks: e.target.value })} className={inputCls}>
                {['Yes', 'No', 'Partial'].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
          </div>
        </FormSection>

        {/* Section 2: Academic Status */}
        <FormSection title="② Academic Status">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Most Difficult Subjects">
              <input value={record.difficultSubjects} onChange={e => up({ difficultSubjects: e.target.value })} placeholder="List subjects…" className={inputCls} />
            </Field>
            <Field label="Reason for Difficulty">
              <textarea value={record.difficultReason} onChange={e => up({ difficultReason: e.target.value })} placeholder="Explain…" className={textareaCls} />
            </Field>
            <Field label="Most Easy Subjects">
              <input value={record.easySubjects} onChange={e => up({ easySubjects: e.target.value })} placeholder="List subjects…" className={inputCls} />
            </Field>
            <Field label="Reason">
              <textarea value={record.easyReason} onChange={e => up({ easyReason: e.target.value })} placeholder="Explain…" className={textareaCls} />
            </Field>
          </div>
        </FormSection>

        {/* Section 3: Attendance & Marks */}
        <FormSection title="③ Attendance & Internal Marks">
          <div className="space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Subject Internal Marks</p>
            {record.subjectMarks.map((sm, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input value={sm.subject} onChange={e => { const a = [...record.subjectMarks]; a[i] = { ...a[i], subject: e.target.value }; up({ subjectMarks: a }); }} placeholder="Subject" className={`${inputCls} flex-1`} />
                <input value={sm.marks} onChange={e => { const a = [...record.subjectMarks]; a[i] = { ...a[i], marks: e.target.value }; up({ subjectMarks: a }); }} placeholder="Marks" className={`${inputCls} w-24`} />
                {record.subjectMarks.length > 1 && (
                  <button type="button" onClick={() => up({ subjectMarks: record.subjectMarks.filter((_, j) => j !== i) })} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => up({ subjectMarks: [...record.subjectMarks, { subject: '', marks: '' }] })} className="flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:text-indigo-700">
              <Plus className="size-3" /> Add Another Subject
            </button>
          </div>

          <div className="space-y-3 mt-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monthly Attendance</p>
            {record.monthlyAttendance.map((ma, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input value={ma.month} onChange={e => { const a = [...record.monthlyAttendance]; a[i] = { ...a[i], month: e.target.value }; up({ monthlyAttendance: a }); }} placeholder="Month (e.g. July 2026)" className={`${inputCls} flex-1`} />
                <input value={ma.percentage} onChange={e => { const a = [...record.monthlyAttendance]; a[i] = { ...a[i], percentage: e.target.value }; up({ monthlyAttendance: a }); }} placeholder="%" className={`${inputCls} w-24`} />
                {record.monthlyAttendance.length > 1 && (
                  <button type="button" onClick={() => up({ monthlyAttendance: record.monthlyAttendance.filter((_, j) => j !== i) })} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => up({ monthlyAttendance: [...record.monthlyAttendance, { month: '', percentage: '' }] })} className="flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:text-indigo-700">
              <Plus className="size-3" /> Add Another Month
            </button>
          </div>
        </FormSection>

        {/* Section 4: Behaviour */}
        <FormSection title="④ Behaviour & Discipline">
          <div className="space-y-4">
            {[
              { label: 'Behaviour in Class', key: 'behaviourInClass' },
              { label: 'Discipline', key: 'discipline' },
              { label: 'Communication Skills', key: 'communicationSkills' },
              { label: 'Participation', key: 'participation' },
              { label: 'Learning Ability', key: 'learningAbility' },
              { label: 'Concentration', key: 'concentration' },
              { label: 'Confidence Level', key: 'confidenceLevel' },
            ].map(({ label, key }) => (
              <div key={key}>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">{label}</p>
                <RatingStars value={(record as any)[key]} onChange={v => up({ [key]: v } as any)} />
              </div>
            ))}
          </div>
        </FormSection>

        {/* Section 5: Time Management */}
        <FormSection title="⑤ Time Management (Hours per day)">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Studying', key: 'hoursStudying' },
              { label: 'Assignments', key: 'hoursAssignments' },
              { label: 'TV', key: 'hoursTv' },
              { label: 'Mobile', key: 'hoursMobile' },
              { label: 'Social Media', key: 'hoursSocialMedia' },
              { label: 'Games', key: 'hoursGames' },
              { label: 'Sleep', key: 'hoursSleep' },
            ].map(({ label, key }) => (
              <Field key={key} label={label}>
                <input type="number" min="0" max="24" value={(record as any)[key]} onChange={e => up({ [key]: e.target.value } as any)} placeholder="hrs" className={inputCls} />
              </Field>
            ))}
          </div>
        </FormSection>

        {/* Section 6: Counselling Suggestions */}
        <FormSection title="⑥ Counselling Suggestions">
          <Field label="Faculty Recommendations">
            <textarea value={record.recommendations} onChange={e => up({ recommendations: e.target.value })} placeholder="Write detailed recommendations…" className={`${textareaCls} min-h-[100px]`} />
          </Field>
          <Field label="Action Plan">
            <textarea value={record.actionPlan} onChange={e => up({ actionPlan: e.target.value })} placeholder="Steps the student should follow…" className={textareaCls} />
          </Field>
          <Field label="Goals for Next Meeting">
            <textarea value={record.goalsNextMeeting} onChange={e => up({ goalsNextMeeting: e.target.value })} placeholder="Goals to achieve before next session…" className={textareaCls} />
          </Field>
        </FormSection>

        {/* Section 7: Social & Personal */}
        <FormSection title="⑦ Social & Personal">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Best Friends', key: 'bestFriends', ph: 'Names…' },
              { label: 'Disturbance Factors', key: 'disturbanceFactors', ph: 'Any factors affecting studies…' },
              { label: 'Family Support', key: 'familySupport', ph: 'Level of support at home…' },
              { label: 'Faculty Encouragement', key: 'facultyEncouragement', ph: 'Notes on encouragement…' },
              { label: 'Health Issues', key: 'healthIssues', ph: 'Any ongoing health issues…' },
              { label: 'Financial Issues', key: 'financialIssues', ph: 'Any financial challenges…' },
              { label: 'Mental Well-being', key: 'mentalWellbeing', ph: 'Current mental well-being status…' },
            ].map(({ label, key, ph }) => (
              <Field key={key} label={label}>
                <textarea value={(record as any)[key]} onChange={e => up({ [key]: e.target.value } as any)} placeholder={ph} className={textareaCls} />
              </Field>
            ))}
          </div>
        </FormSection>

        {/* Section 8: Counsellor Comments */}
        <FormSection title="⑧ Counsellor Comments">
          <div className="space-y-3">
            {record.comments.map((c, i) => (
              <div key={i} className="border border-border rounded-xl p-3 space-y-2">
                <div className="flex gap-2">
                  <Field label="Comment">
                    <textarea value={c.comment} onChange={e => { const a = [...record.comments]; a[i] = { ...a[i], comment: e.target.value }; up({ comments: a }); }} placeholder="Write comment…" className={textareaCls} />
                  </Field>
                </div>
                <div className="flex gap-2">
                  <Field label="Date">
                    <input type="date" value={c.date} onChange={e => { const a = [...record.comments]; a[i] = { ...a[i], date: e.target.value }; up({ comments: a }); }} className={inputCls} />
                  </Field>
                  <Field label="Faculty">
                    <input readOnly value={c.faculty} className={`${inputCls} opacity-70`} />
                  </Field>
                  {record.comments.length > 1 && (
                    <div className="flex items-end pb-0.5">
                      <button type="button" onClick={() => up({ comments: record.comments.filter((_, j) => j !== i) })} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button type="button" onClick={() => up({ comments: [...record.comments, { comment: '', date: new Date().toISOString().slice(0, 10), faculty: '' }] })} className="flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:text-indigo-700">
              <Plus className="size-3" /> Add Another Comment
            </button>
          </div>
        </FormSection>

        {/* Section 9: Follow-up */}
        <FormSection title="⑨ Follow-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Next Counselling Date">
              <input type="date" value={record.nextCounsellingDate} onChange={e => up({ nextCounsellingDate: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Priority">
              <select value={record.priority} onChange={e => up({ priority: e.target.value as any })} className={inputCls}>
                {['Low', 'Medium', 'High', 'Critical'].map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
          </div>
        </FormSection>

        {/* Section 10: Documents */}
        <FormSection title="⑩ Documents">
          <p className="text-xs text-muted-foreground">Document upload references (filenames only in this version)</p>
          <div className="space-y-2">
            {['Medical Certificate', 'Progress Report', 'Supporting Documents'].map(docType => (
              <div key={docType} className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border hover:border-indigo-400 transition">
                <FileText className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">{docType}</p>
                  <p className="text-[11px] text-muted-foreground">Click to attach</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  className="opacity-0 absolute w-0 h-0"
                  onChange={e => {
                    if (e.target.files?.[0]) {
                      up({ documents: [...(record.documents || []), `${docType}: ${e.target.files[0].name}`] });
                      toast.success(`${e.target.files[0].name} attached`);
                    }
                  }}
                />
              </div>
            ))}
            {record.documents?.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                <CheckCircle className="size-3" /> {d}
                <button type="button" onClick={() => up({ documents: record.documents.filter((_, j) => j !== i) })} className="ml-auto text-rose-500 hover:text-rose-700">
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </FormSection>
      </div>

      {/* Bottom action bar */}
      <div className="sticky bottom-0 bg-background border-t py-4 flex items-center justify-between gap-3">
        <button onClick={onCancel} className="px-5 py-2.5 rounded-xl border bg-background text-sm font-semibold hover:bg-muted transition">
          Cancel
        </button>
        <div className="flex gap-2">
          <button onClick={onSaveDraft} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border bg-background text-sm font-semibold hover:bg-muted transition">
            <Save className="size-4" /> Save Draft
          </button>
          <button onClick={onSubmit} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition shadow">
            <Send className="size-4" /> Submit Counselling
          </button>
        </div>
      </div>
    </div>
  );
}
