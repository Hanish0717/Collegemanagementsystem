/**
 * FacultyCounselling.tsx
 * Student Counselling Module for Faculty Workspace
 *
 * Features:
 * - Department-wise student mapping (logged-in faculty only sees their dept)
 * - Equal student distribution among faculty members in the same department
 * - Counselling Dashboard with 4 real-time Summary Cards
 * - Student cards list with Quick Actions (View, Add Counselling, Edit, Download Report)
 * - Multi-criteria search and filters (Sem, Section, Attendance %, Counselling Status)
 * - 10-Section Right-Side Drawer Modal for Add/Edit Counselling Form
 * - Student Details Modal View with Attendance, Parents, and Counselling History
 * - Professional PDF & Printable Report Generator
 * - Persisted counselling records in localStorage
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartHandshake,
  Search,
  Filter,
  Users,
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
  Calendar,
  User,
  FileText,
  Save,
  Send,
  ArrowLeft,
  BookOpen,
  Clock,
  Printer,
  ShieldCheck,
  Sparkles,
  Paperclip,
} from 'lucide-react';
import { PageHeader, Card, Badge } from '@/components/dashboard/ui';
import { toast } from 'sonner';
import { getStoredFacultyProfile, ALL_FACULTY_MEMBERS } from '@/services/facultyProfileService';
import api from '@/lib/api';

// ─── Interfaces & Types ──────────────────────────────────────────────────────

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

interface SubjectMark {
  subject: string;
  marks: string;
}

interface MonthAttendance {
  month: string;
  percentage: string;
}

interface CounsellorComment {
  comment: string;
  date: string;
  faculty: string;
}

interface CounsellingRecord {
  id: string;
  studentRoll: string;
  facultyId: string;
  date: string;
  // Section 1: Basic & Transport / Hostel Details
  hostelInfo: string;
  transport: string;
  journeyTime: string;
  hasTextbooks: string;
  // Section 2: Academic Status
  difficultSubjects: string;
  difficultReason: string;
  easySubjects: string;
  easyReason: string;
  // Section 3: Attendance & Internal Marks
  subjectMarks: SubjectMark[];
  monthlyAttendance: MonthAttendance[];
  // Section 4: Behaviour & Discipline
  behaviourInClass: number;
  discipline: number;
  communicationSkills: number;
  participation: number;
  learningAbility: number;
  concentration: number;
  confidenceLevel: number;
  // Section 5: Time Management
  hoursStudying: string;
  hoursAssignments: string;
  hoursTv: string;
  hoursMobile: string;
  hoursSocialMedia: string;
  hoursGames: string;
  hoursSleep: string;
  // Section 6: Counselling Suggestions
  recommendations: string;
  actionPlan: string;
  goalsNextMeeting: string;
  // Section 7: Social & Personal
  bestFriends: string;
  disturbanceFactors: string;
  familySupport: string;
  facultyEncouragement: string;
  healthIssues: string;
  financialIssues: string;
  mentalWellbeing: string;
  // Section 8: Counsellor Comments
  comments: CounsellorComment[];
  // Section 9: Follow-up
  nextCounsellingDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  // Section 10: Documents
  documents: string[];
  // Meta
  status: 'Draft' | 'Submitted';
  summary?: string;
}

// ─── Persistence Helper ──────────────────────────────────────────────────────

const STORAGE_KEY = 'cms_counselling_records_v1';

function loadRecords(): CounsellingRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);

    const demoRecords: CounsellingRecord[] = [
      {
        id: 'CR-DEMO-1',
        studentRoll: 'CS2026101',
        facultyId: 'FACCSE1',
        date: new Date().toISOString().slice(0, 10),
        hostelInfo: 'Hosteller',
        transport: 'College Bus',
        journeyTime: '25 mins',
        hasTextbooks: 'Yes',
        difficultSubjects: 'Data Structures & Algorithms',
        difficultReason: 'Finding recursion and pointers logic hard to trace.',
        easySubjects: 'Full Stack Web Development',
        easyReason: 'Enjoys building UI and APIs.',
        subjectMarks: [
          { subject: 'Data Structures', marks: '16/25' },
          { subject: 'Operating Systems', marks: '21/25' },
        ],
        monthlyAttendance: [
          { month: 'June 2026', percentage: '90' },
          { month: 'July 2026', percentage: '94' },
        ],
        behaviourInClass: 4,
        discipline: 5,
        communicationSkills: 4,
        participation: 4,
        learningAbility: 4,
        concentration: 4,
        confidenceLevel: 4,
        hoursStudying: '3',
        hoursAssignments: '2',
        hoursTv: '1',
        hoursMobile: '2',
        hoursSocialMedia: '1',
        hoursGames: '0',
        hoursSleep: '7',
        recommendations: 'Recommended practicing daily coding exercises and attending peer discussion groups.',
        actionPlan: 'Solve 2 recursion problems daily. Check progress in next meeting.',
        goalsNextMeeting: 'Understand graph traversal algorithms completely.',
        bestFriends: 'Ramesh, Sai Kiran',
        disturbanceFactors: 'Social media notifications',
        familySupport: 'Very Supportive',
        facultyEncouragement: 'Offered extra lab assistance.',
        healthIssues: 'None',
        financialIssues: 'None',
        mentalWellbeing: 'Good but slightly anxious about upcoming midterm exams.',
        comments: [
          { comment: 'Shows keen interest during web development labs.', date: new Date().toISOString().slice(0, 10), faculty: 'Kambhampati Harish' },
        ],
        nextCounsellingDate: '2026-08-15',
        priority: 'Medium',
        documents: ['Progress Report: sem5_midterm.pdf'],
        status: 'Submitted',
        summary: 'Requires practice on graph algorithms.',
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoRecords));
    return demoRecords;
  } catch {
    return [];
  }
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
    transport: 'College Bus',
    journeyTime: '30 mins',
    hasTextbooks: 'Yes',
    difficultSubjects: '',
    difficultReason: '',
    easySubjects: '',
    easyReason: '',
    subjectMarks: [{ subject: '', marks: '' }],
    monthlyAttendance: [{ month: '', percentage: '' }],
    behaviourInClass: 4,
    discipline: 4,
    communicationSkills: 4,
    participation: 4,
    learningAbility: 4,
    concentration: 4,
    confidenceLevel: 4,
    hoursStudying: '3',
    hoursAssignments: '2',
    hoursTv: '1',
    hoursMobile: '2',
    hoursSocialMedia: '1',
    hoursGames: '0',
    hoursSleep: '7',
    recommendations: '',
    actionPlan: '',
    goalsNextMeeting: '',
    bestFriends: '',
    disturbanceFactors: '',
    familySupport: 'Strong',
    facultyEncouragement: 'High',
    healthIssues: 'None',
    financialIssues: 'None',
    mentalWellbeing: 'Good',
    comments: [{ comment: '', date: new Date().toISOString().slice(0, 10), faculty: facultyName }],
    nextCounsellingDate: '',
    priority: 'Medium',
    documents: [],
    status: 'Draft',
    summary: '',
  };
}

// Generate realistic mock students for department if API returns fewer items
function generateMockStudentsForDept(deptCode: string): StudentRecord[] {
  const sampleFirstNames = [
    'Aarav', 'Ananya', 'Rohan', 'Priya', 'Karthik', 'Bhavya', 'Vikram', 'Divya',
    'Siddharth', 'Kavya', 'Rahul', 'Sneha', 'Nitin', 'Meera', 'Aditya', 'Pooja',
    'Varun', 'Neha', 'Manish', 'Ritu', 'Tarun', 'Swati', 'Harish', 'Deepa',
    'Akash', 'Shruti', 'Suresh', 'Monika', 'Gautam', 'Anjali', 'Vijay', 'Shreya',
    'Naveen', 'Preeti', 'Rajesh', 'Vandana', 'Sunil', 'Kiran', 'Deepak', 'Nisha',
  ];

  const sampleLastNames = [
    'Sharma', 'Verma', 'Kumar', 'Reddy', 'Patel', 'Rao', 'Naidu', 'Gupta',
    'Singh', 'Joshi', 'Mehra', 'Iyer', 'Nair', 'Deshmukh', 'Kulkarni', 'Chowdary',
    'Vavilapalli', 'Suvarna', 'Bhatt', 'Thakur', 'Chandra', 'Prasad', 'Srinivas',
  ];

  const sections = ['A', 'B', 'C'];
  const years = [2, 3, 4];
  const list: StudentRecord[] = [];

  for (let i = 1; i <= 60; i++) {
    const fn = sampleFirstNames[(i * 3 + deptCode.charCodeAt(0)) % sampleFirstNames.length];
    const ln = sampleLastNames[(i * 7 + deptCode.length) % sampleLastNames.length];
    const fullName = `${fn} ${ln}`;
    const numStr = String(i).padStart(3, '0');
    const rollNumber = `${deptCode}2026${numStr}`;
    const sec = sections[i % sections.length];
    const yr = years[i % years.length];
    const sem = yr * 2 - (i % 2);
    const att = Math.min(100, Math.max(55, Math.floor(65 + ((i * 17) % 35))));

    list.push({
      id: `std_${deptCode.toLowerCase()}_${numStr}`,
      fullName,
      rollNumber,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@college.com`,
      department: deptCode,
      year: yr,
      semester: sem,
      section: sec,
      attendancePercentage: att,
      parentName: `${sampleFirstNames[(i + 5) % sampleFirstNames.length]} ${ln}`,
      parentPhone: `98765${String(10000 + i).slice(1)}`,
      parentEmail: `${ln.toLowerCase()}.parent@gmail.com`,
      gender: i % 2 === 0 ? 'Female' : 'Male',
      phoneNumber: `98480${String(10000 + i).slice(1)}`,
      admissionNumber: `ADM-${deptCode}-${2023000 + i}`,
    });
  }

  return list;
}

function getAttendanceColor(pct: number) {
  if (pct >= 90) return 'text-emerald-600 dark:text-emerald-400';
  if (pct >= 75) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

function getAttendanceBg(pct: number) {
  if (pct >= 90) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200';
  if (pct >= 75) return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200';
  return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200';
}

function getPriorityColor(p: string) {
  switch (p) {
    case 'Critical': return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300';
    case 'High':     return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300';
    case 'Medium':   return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300';
    case 'Low':      return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300';
    default:         return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
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
    case 'Counselled':     return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200';
    case 'Needs Attention': return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200';
    case 'In Progress':    return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200';
    default:               return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200';
  }
}

function getLastCounsellingDate(records: CounsellingRecord[], roll: string) {
  const recs = records.filter(r => r.studentRoll === roll && r.status === 'Submitted');
  if (recs.length === 0) return null;
  return recs[recs.length - 1].date;
}

// Rating widget
function RatingStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`size-8 rounded-lg transition font-bold text-xs ${
            n <= value ? 'bg-indigo-600 text-white shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {n}
        </button>
      ))}
      <span className="ml-2 text-xs font-medium text-muted-foreground">
        {['', 'Poor', 'Needs Improvement', 'Average', 'Good', 'Excellent'][value]}
      </span>
    </div>
  );
}

// Accordion Form Section
function FormSection({ title, children, defaultOpen = false }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-muted/40 hover:bg-muted/70 transition text-left"
      >
        <span className="font-bold text-sm text-foreground">{title}</span>
        {open ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  );
}

// Field Wrapper
function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground/80 mb-1.5">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition";
const textareaCls = `${inputCls} min-h-[90px] resize-y`;

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

  // Drawer / View states
  const [view, setView] = useState<'grid' | 'student'>('grid');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CounsellingRecord | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // ── Load students from API or Mock, then slice for logged-in faculty ──────
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get('/api/students?limit=1000');
        const raw: any[] = res.data?.data?.students || res.data?.students || res.data?.data || [];

        let mapped: StudentRecord[] = raw.map((s: any) => {
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

        // Fallback: If fewer than 10 students returned for this department, use mock generator
        if (mapped.length < 10) {
          mapped = generateMockStudentsForDept(profile.department || 'CSE');
        }

        // Sort by roll number for consistent deterministic splitting
        mapped.sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));

        // Faculty Allocation: Automatically split students in this department among department faculty members
        const deptFaculty = ALL_FACULTY_MEMBERS.filter(f => f.department === profile.department);
        const myIndex = deptFaculty.findIndex(f => f.employeeId === profile.employeeId);
        const idx = myIndex < 0 ? 0 : myIndex;
        const chunkSize = Math.ceil(mapped.length / Math.max(1, deptFaculty.length));
        const mine = mapped.slice(idx * chunkSize, (idx + 1) * chunkSize);

        setStudents(mine);
      } catch (err) {
        console.error('Failed to load students:', err);
        setStudents(generateMockStudentsForDept(profile.department || 'CSE').slice(0, 20));
      }
      setLoading(false);
    }
    load();
  }, [profile.employeeId, profile.department]);

  // Persist records
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

  // ── Actions ──────────────────────────────────────────────────────────────
  const openAddDrawer = (student: StudentRecord) => {
    const blank = makeBlankRecord(student.rollNumber, profile.employeeId, profile.name);
    setEditingRecord(blank);
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (student: StudentRecord, record: CounsellingRecord) => {
    setEditingRecord({ ...record });
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  };

  const saveForm = (asDraft: boolean) => {
    if (!editingRecord || !selectedStudent) return;
    const updated: CounsellingRecord = {
      ...editingRecord,
      status: asDraft ? 'Draft' : 'Submitted',
      summary: editingRecord.recommendations || `Counselling session for ${selectedStudent.fullName}`,
      date: editingRecord.date || new Date().toISOString().slice(0, 10),
    };
    const existing = records.filter(r => r.id !== updated.id);
    persistRecords([...existing, updated]);
    toast.success(asDraft ? 'Counselling draft saved successfully!' : 'Counselling session submitted successfully!');
    setIsDrawerOpen(false);
  };

  // Generate printable PDF report
  const generatePDFReport = (student: StudentRecord) => {
    const studentRecords = records.filter(r => r.studentRoll === student.rollNumber);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocked! Please allow pop-ups to print/download PDF.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student Counselling Report - ${student.fullName} (${student.rollNumber})</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 30px; color: #1e293b; background: #fff; }
          .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { margin: 0; color: #4f46e5; font-size: 24px; }
          .header h3 { margin: 5px 0 0 0; color: #64748b; font-size: 14px; font-weight: 500; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 8px; }
          .box h4 { margin: 0 0 6px 0; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
          .box p { margin: 0; font-size: 14px; font-weight: 600; color: #0f172a; }
          .section-title { background: #4f46e5; color: white; padding: 8px 12px; font-size: 13px; font-weight: bold; border-radius: 6px; margin-top: 25px; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 12px; text-align: left; }
          th { background: #f1f5f9; font-weight: bold; color: #334155; }
          .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>COLLEGE MANAGEMENT SYSTEM</h1>
          <h3>OFFICIAL STUDENT COUNSELLING REPORT</h3>
        </div>

        <div class="grid">
          <div class="box">
            <h4>Student Name</h4>
            <p>${student.fullName}</p>
          </div>
          <div class="box">
            <h4>Roll Number</h4>
            <p>${student.rollNumber}</p>
          </div>
          <div class="box">
            <h4>Department</h4>
            <p>${student.department} (Year ${student.year}, Sem ${student.semester}, Sec ${student.section})</p>
          </div>
          <div class="box">
            <h4>Attendance Percentage</h4>
            <p>${student.attendancePercentage}%</p>
          </div>
          <div class="box">
            <h4>Assigned Counsellor</h4>
            <p>${profile.name} (${profile.employeeId})</p>
          </div>
          <div class="box">
            <h4>Generated On</h4>
            <p>${new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        <div class="section-title">COUNSELLING SESSIONS HISTORY (${studentRecords.length})</div>
        ${studentRecords.length === 0 ? '<p style="font-size:13px; color:#64748b;">No formal counselling records submitted yet.</p>' : `
          <table>
            <thead>
              <tr>
                <th>Session Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Recommendations & Action Plan</th>
                <th>Next Date</th>
              </tr>
            </thead>
            <tbody>
              ${studentRecords.map(r => `
                <tr>
                  <td>${r.date}</td>
                  <td>${r.priority}</td>
                  <td>${r.status}</td>
                  <td><strong>Rec:</strong> ${r.recommendations || '-'}<br/><strong>Plan:</strong> ${r.actionPlan || '-'}</td>
                  <td>${r.nextCounsellingDate || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}

        <div class="footer">
          <div>
            <p><strong>Counsellor Signature:</strong> _______________________</p>
            <p>${profile.name}</p>
          </div>
          <div style="text-align:right;">
            <p><strong>HOD Approval:</strong> _______________________</p>
            <p>Head of Department (${student.department})</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success(`PDF Report generated for ${student.fullName}`);
  };

  // ── Views ─────────────────────────────────────────────────────────────────
  if (view === 'student' && selectedStudent) {
    return (
      <StudentDetailView
        student={selectedStudent}
        records={records.filter(r => r.studentRoll === selectedStudent.rollNumber)}
        profile={profile}
        onBack={() => { setView('grid'); setSelectedStudent(null); }}
        onAddCounselling={() => openAddDrawer(selectedStudent)}
        onEditRecord={(rec) => openEditDrawer(selectedStudent, rec)}
        onDownload={() => generatePDFReport(selectedStudent)}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Student Counselling"
        desc={`Manage counselling records, academic guidance, attendance analysis and student progress assigned to you. · ${profile.department} Department`}
      />

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <Users className="size-5 text-indigo-600 dark:text-indigo-400" />, bg: 'bg-indigo-50 dark:bg-indigo-950/40', label: 'Assigned Students', value: students.length, color: 'text-indigo-700 dark:text-indigo-300' },
          { icon: <HeartHandshake className="size-5 text-emerald-600 dark:text-emerald-400" />, bg: 'bg-emerald-50 dark:bg-emerald-950/40', label: 'Counselling Sessions', value: records.filter(r => r.facultyId === profile.employeeId && r.status === 'Submitted').length, color: 'text-emerald-700 dark:text-emerald-300' },
          { icon: <AlertTriangle className="size-5 text-rose-600 dark:text-rose-400" />, bg: 'bg-rose-50 dark:bg-rose-950/40', label: 'Students Requiring Attention', value: needsAttentionCount, color: 'text-rose-700 dark:text-rose-300' },
          { icon: <Percent className="size-5 text-amber-600 dark:text-amber-400" />, bg: 'bg-amber-50 dark:bg-amber-950/40', label: 'Average Attendance', value: `${avgAtt}%`, color: 'text-amber-700 dark:text-amber-300' },
        ].map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="p-4.5 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${c.bg}`}>{c.icon}</div>
              <p className="text-xs text-muted-foreground font-medium">{c.label}</p>
              <p className={`text-2xl font-extrabold mt-0.5 ${c.color}`}>{loading ? '—' : c.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Search & Filters Bar ── */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by student name or roll number…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition cursor-pointer ${
              showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300' : 'border-border text-foreground hover:bg-muted'
            }`}
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
                  { label: 'Attendance', value: attFilter, options: [{ v: 'All', l: 'All Attendance' }, { v: 'high', l: '≥90% (High)' }, { v: 'medium', l: '75-90% (Average)' }, { v: 'low', l: '<75% (Low)' }], onChange: setAttFilter },
                  { label: 'Counselling Status', value: statusFilter, options: [{ v: 'All', l: 'All Statuses' }, { v: 'Not Started', l: 'Not Started' }, { v: 'In Progress', l: 'In Progress' }, { v: 'Counselled', l: 'Counselled' }, { v: 'Needs Attention', l: 'Needs Attention' }], onChange: setStatusFilter },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{f.label}</label>
                    <select
                      value={f.value}
                      onChange={e => f.onChange(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
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

      {/* ── Student List count header ── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-medium">
          Showing <span className="font-bold text-foreground">{filtered.length}</span> of {students.length} assigned students in <span className="font-bold text-indigo-600 dark:text-indigo-400">{profile.department}</span>
        </p>
      </div>

      {/* ── Student Cards Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border rounded-2xl p-8">
          <HeartHandshake className="size-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold text-base text-foreground">No assigned students found</h3>
          <p className="text-muted-foreground text-sm mt-1">Try adjusting your search query or reset active filters.</p>
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
                <Card
                  className="p-4.5 hover:shadow-md transition-all group cursor-pointer border border-border hover:border-indigo-400/60"
                  onClick={() => { setSelectedStudent(student); setView('student'); }}
                >
                  {/* Avatar & Header */}
                  <div className="flex items-start gap-3 mb-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 shadow-md">
                      {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-foreground truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {student.fullName}
                      </h4>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{student.rollNumber}</p>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold flex-shrink-0 ${getStatusBadgeClass(cStatus)}`}>
                      {cStatus}
                    </span>
                  </div>

                  {/* Student Specs Grid */}
                  <div className="grid grid-cols-3 gap-1.5 mb-3.5 text-xs">
                    <div className="text-center p-2 rounded-xl bg-muted/40">
                      <p className="text-[10px] text-muted-foreground font-medium">Dept</p>
                      <p className="font-bold text-foreground mt-0.5">{student.department}</p>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-muted/40">
                      <p className="text-[10px] text-muted-foreground font-medium">Year / Sem</p>
                      <p className="font-bold text-foreground mt-0.5">Y{student.year} S{student.semester}</p>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-muted/40">
                      <p className="text-[10px] text-muted-foreground font-medium">Section</p>
                      <p className="font-bold text-foreground mt-0.5">Sec {student.section}</p>
                    </div>
                  </div>

                  {/* Attendance Bar */}
                  <div className="mb-3.5">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground font-medium">Attendance %</span>
                      <span className={`font-extrabold ${attColor}`}>{student.attendancePercentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          student.attendancePercentage >= 90 ? 'bg-emerald-500' : student.attendancePercentage >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${student.attendancePercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Last session date */}
                  {lastDate ? (
                    <p className="text-[11px] text-muted-foreground mb-3.5 flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-indigo-500" /> Last Counselling: <span className="font-semibold text-foreground">{new Date(lastDate).toLocaleDateString('en-IN')}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground mb-3.5 flex items-center gap-1.5">
                      <Clock className="size-3.5 text-slate-400" /> No counselling recorded yet
                    </p>
                  )}

                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-3 gap-1.5" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => { setSelectedStudent(student); setView('student'); }}
                      className="flex items-center justify-center gap-1 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-bold text-foreground transition cursor-pointer"
                    >
                      <Eye className="size-3.5 text-muted-foreground" /> View
                    </button>
                    <button
                      onClick={() => openAddDrawer(student)}
                      className="flex items-center justify-center gap-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition cursor-pointer shadow-sm"
                    >
                      <Plus className="size-3.5" /> Add
                    </button>
                    <button
                      onClick={() => generatePDFReport(student)}
                      className="flex items-center justify-center gap-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
                      title="Download PDF Report"
                    >
                      <Download className="size-3.5" /> Report
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── 10-SECTION RIGHT-SIDE DRAWER MODAL FOR ADD/EDIT COUNSELLING ── */}
      <AnimatePresence>
        {isDrawerOpen && editingRecord && selectedStudent && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            />

            {/* Slide-Over Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-3xl bg-background border-l border-border shadow-2xl flex flex-col h-full z-10 overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                    <HeartHandshake className="size-5" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-foreground">
                      {editingRecord.status === 'Submitted' ? 'Edit Counselling Record' : 'Add Student Counselling'}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedStudent.fullName} · {selectedStudent.rollNumber} · {selectedStudent.department}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Drawer Scrollable Body (10 Sections) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">

                {/* Section 1: Basic Details */}
                <FormSection title="Section 1: Basic Details" defaultOpen>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Student Name"><input readOnly value={selectedStudent.fullName} className={`${inputCls} opacity-70`} /></Field>
                    <Field label="Roll Number"><input readOnly value={selectedStudent.rollNumber} className={`${inputCls} opacity-70`} /></Field>
                    <Field label="Department"><input readOnly value={selectedStudent.department} className={`${inputCls} opacity-70`} /></Field>
                    <Field label="Year"><input readOnly value={`Year ${selectedStudent.year}`} className={`${inputCls} opacity-70`} /></Field>
                    <Field label="Semester"><input readOnly value={`Semester ${selectedStudent.semester}`} className={`${inputCls} opacity-70`} /></Field>
                    <Field label="Section"><input readOnly value={selectedStudent.section} className={`${inputCls} opacity-70`} /></Field>

                    <Field label="Hostel Information">
                      <select value={editingRecord.hostelInfo} onChange={e => setEditingRecord({ ...editingRecord, hostelInfo: e.target.value })} className={inputCls}>
                        {['Day Scholar', 'Hosteller'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label="Mode of Transport">
                      <select value={editingRecord.transport} onChange={e => setEditingRecord({ ...editingRecord, transport: e.target.value })} className={inputCls}>
                        {['College Bus', 'Private Vehicle', 'Public Bus / Train', 'Walking / Other'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label="Time of Journey">
                      <input value={editingRecord.journeyTime} onChange={e => setEditingRecord({ ...editingRecord, journeyTime: e.target.value })} placeholder="e.g. 30 minutes" className={inputCls} />
                    </Field>
                    <Field label="Do you have all textbooks?">
                      <select value={editingRecord.hasTextbooks} onChange={e => setEditingRecord({ ...editingRecord, hasTextbooks: e.target.value })} className={inputCls}>
                        {['Yes', 'Partial', 'No'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                  </div>
                </FormSection>

                {/* Section 2: Academic Status */}
                <FormSection title="Section 2: Academic Status">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Most Difficult Subjects">
                      <input value={editingRecord.difficultSubjects} onChange={e => setEditingRecord({ ...editingRecord, difficultSubjects: e.target.value })} placeholder="e.g. Data Structures, Math III" className={inputCls} />
                    </Field>
                    <Field label="Reason for Difficulty">
                      <textarea value={editingRecord.difficultReason} onChange={e => setEditingRecord({ ...editingRecord, difficultReason: e.target.value })} placeholder="Explain reasons…" className={textareaCls} />
                    </Field>
                    <Field label="Most Easy Subjects">
                      <input value={editingRecord.easySubjects} onChange={e => setEditingRecord({ ...editingRecord, easySubjects: e.target.value })} placeholder="e.g. Web Development, DBMS" className={inputCls} />
                    </Field>
                    <Field label="Reason for Ease">
                      <textarea value={editingRecord.easyReason} onChange={e => setEditingRecord({ ...editingRecord, easyReason: e.target.value })} placeholder="Explain reasons…" className={textareaCls} />
                    </Field>
                  </div>
                </FormSection>

                {/* Section 3: Attendance & Internal Marks */}
                <FormSection title="Section 3: Attendance & Internal Marks">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subjects & Internal Marks</p>
                      <button
                        type="button"
                        onClick={() => setEditingRecord({ ...editingRecord, subjectMarks: [...editingRecord.subjectMarks, { subject: '', marks: '' }] })}
                        className="flex items-center gap-1 text-xs text-indigo-600 font-bold hover:text-indigo-700 cursor-pointer"
                      >
                        <Plus className="size-3.5" /> Add Another Subject
                      </button>
                    </div>
                    {editingRecord.subjectMarks.map((sm, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          value={sm.subject}
                          onChange={e => { const a = [...editingRecord.subjectMarks]; a[i] = { ...a[i], subject: e.target.value }; setEditingRecord({ ...editingRecord, subjectMarks: a }); }}
                          placeholder="Subject Name"
                          className={`${inputCls} flex-1`}
                        />
                        <input
                          value={sm.marks}
                          onChange={e => { const a = [...editingRecord.subjectMarks]; a[i] = { ...a[i], marks: e.target.value }; setEditingRecord({ ...editingRecord, subjectMarks: a }); }}
                          placeholder="Marks (e.g. 21/25)"
                          className={`${inputCls} w-32`}
                        />
                        {editingRecord.subjectMarks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setEditingRecord({ ...editingRecord, subjectMarks: editingRecord.subjectMarks.filter((_, j) => j !== i) })}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 mt-6 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Monthly Attendance Breakdown</p>
                      <button
                        type="button"
                        onClick={() => setEditingRecord({ ...editingRecord, monthlyAttendance: [...editingRecord.monthlyAttendance, { month: '', percentage: '' }] })}
                        className="flex items-center gap-1 text-xs text-indigo-600 font-bold hover:text-indigo-700 cursor-pointer"
                      >
                        <Plus className="size-3.5" /> Add Another Month
                      </button>
                    </div>
                    {editingRecord.monthlyAttendance.map((ma, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          value={ma.month}
                          onChange={e => { const a = [...editingRecord.monthlyAttendance]; a[i] = { ...a[i], month: e.target.value }; setEditingRecord({ ...editingRecord, monthlyAttendance: a }); }}
                          placeholder="Month Name (e.g. July 2026)"
                          className={`${inputCls} flex-1`}
                        />
                        <input
                          value={ma.percentage}
                          onChange={e => { const a = [...editingRecord.monthlyAttendance]; a[i] = { ...a[i], percentage: e.target.value }; setEditingRecord({ ...editingRecord, monthlyAttendance: a }); }}
                          placeholder="Att % (e.g. 88%)"
                          className={`${inputCls} w-32`}
                        />
                        {editingRecord.monthlyAttendance.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setEditingRecord({ ...editingRecord, monthlyAttendance: editingRecord.monthlyAttendance.filter((_, j) => j !== i) })}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </FormSection>

                {/* Section 4: Behaviour & Discipline */}
                <FormSection title="Section 4: Behaviour & Discipline">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Behaviour in Class', key: 'behaviourInClass' },
                      { label: 'Discipline', key: 'discipline' },
                      { label: 'Communication Skills', key: 'communicationSkills' },
                      { label: 'Participation', key: 'participation' },
                      { label: 'Learning Ability', key: 'learningAbility' },
                      { label: 'Concentration Level', key: 'concentration' },
                      { label: 'Confidence Level', key: 'confidenceLevel' },
                    ].map(({ label, key }) => (
                      <div key={key} className="p-3 rounded-xl border bg-muted/20">
                        <p className="text-xs font-semibold text-foreground mb-2">{label}</p>
                        <RatingStars value={(editingRecord as any)[key]} onChange={v => setEditingRecord({ ...editingRecord, [key]: v })} />
                      </div>
                    ))}
                  </div>
                </FormSection>

                {/* Section 5: Time Management */}
                <FormSection title="Section 5: Time Management (Daily Hours)">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Hours Studying', key: 'hoursStudying' },
                      { label: 'Hours Assignments', key: 'hoursAssignments' },
                      { label: 'Hours TV', key: 'hoursTv' },
                      { label: 'Hours Mobile', key: 'hoursMobile' },
                      { label: 'Hours Social Media', key: 'hoursSocialMedia' },
                      { label: 'Hours Games', key: 'hoursGames' },
                      { label: 'Hours Sleep', key: 'hoursSleep' },
                    ].map(({ label, key }) => (
                      <Field key={key} label={label}>
                        <input
                          type="number"
                          min="0"
                          max="24"
                          value={(editingRecord as any)[key]}
                          onChange={e => setEditingRecord({ ...editingRecord, [key]: e.target.value })}
                          placeholder="hrs"
                          className={inputCls}
                        />
                      </Field>
                    ))}
                  </div>
                </FormSection>

                {/* Section 6: Counselling Suggestions */}
                <FormSection title="Section 6: Counselling Suggestions">
                  <Field label="Faculty Recommendations">
                    <textarea
                      value={editingRecord.recommendations}
                      onChange={e => setEditingRecord({ ...editingRecord, recommendations: e.target.value })}
                      placeholder="Write detailed recommendations and guidance…"
                      className={`${textareaCls} min-h-[110px]`}
                    />
                  </Field>
                  <Field label="Action Plan">
                    <textarea
                      value={editingRecord.actionPlan}
                      onChange={e => setEditingRecord({ ...editingRecord, actionPlan: e.target.value })}
                      placeholder="Action plan for the student…"
                      className={textareaCls}
                    />
                  </Field>
                  <Field label="Goals for Next Meeting">
                    <textarea
                      value={editingRecord.goalsNextMeeting}
                      onChange={e => setEditingRecord({ ...editingRecord, goalsNextMeeting: e.target.value })}
                      placeholder="Goals to be achieved by next session…"
                      className={textareaCls}
                    />
                  </Field>
                </FormSection>

                {/* Section 7: Social & Personal */}
                <FormSection title="Section 7: Social & Personal">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Best Friends', key: 'bestFriends', ph: 'Names of peer friends…' },
                      { label: 'Disturbance Factors', key: 'disturbanceFactors', ph: 'Factors disturbing studies…' },
                      { label: 'Family Support', key: 'familySupport', ph: 'Support level at home…' },
                      { label: 'Faculty Encouragement', key: 'facultyEncouragement', ph: 'Faculty mentorship notes…' },
                      { label: 'Health Issues', key: 'healthIssues', ph: 'Ongoing health issues if any…' },
                      { label: 'Financial Issues', key: 'financialIssues', ph: 'Financial difficulties if any…' },
                      { label: 'Mental Well-being', key: 'mentalWellbeing', ph: 'Mental health and stress state…' },
                    ].map(({ label, key, ph }) => (
                      <Field key={key} label={label}>
                        <textarea
                          value={(editingRecord as any)[key]}
                          onChange={e => setEditingRecord({ ...editingRecord, [key]: e.target.value })}
                          placeholder={ph}
                          className={textareaCls}
                        />
                      </Field>
                    ))}
                  </div>
                </FormSection>

                {/* Section 8: Counsellor Comments */}
                <FormSection title="Section 8: Counsellor Comments">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Comments History</p>
                      <button
                        type="button"
                        onClick={() => setEditingRecord({
                          ...editingRecord,
                          comments: [...editingRecord.comments, { comment: '', date: new Date().toISOString().slice(0, 10), faculty: profile.name }]
                        })}
                        className="flex items-center gap-1 text-xs text-indigo-600 font-bold hover:text-indigo-700 cursor-pointer"
                      >
                        <Plus className="size-3.5" /> Add Another Comment
                      </button>
                    </div>

                    {editingRecord.comments.map((c, i) => (
                      <div key={i} className="border border-border rounded-xl p-4 bg-muted/20 space-y-3">
                        <Field label="Comment">
                          <textarea
                            value={c.comment}
                            onChange={e => {
                              const a = [...editingRecord.comments];
                              a[i] = { ...a[i], comment: e.target.value };
                              setEditingRecord({ ...editingRecord, comments: a });
                            }}
                            placeholder="Enter comment…"
                            className={textareaCls}
                          />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Date">
                            <input
                              type="date"
                              value={c.date}
                              onChange={e => {
                                const a = [...editingRecord.comments];
                                a[i] = { ...a[i], date: e.target.value };
                                setEditingRecord({ ...editingRecord, comments: a });
                              }}
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Faculty Name">
                            <input readOnly value={c.faculty || profile.name} className={`${inputCls} opacity-70`} />
                          </Field>
                        </div>
                      </div>
                    ))}
                  </div>
                </FormSection>

                {/* Section 9: Follow-up */}
                <FormSection title="Section 9: Follow-up">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Next Counselling Date">
                      <input
                        type="date"
                        value={editingRecord.nextCounsellingDate}
                        onChange={e => setEditingRecord({ ...editingRecord, nextCounsellingDate: e.target.value })}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Priority Level">
                      <select
                        value={editingRecord.priority}
                        onChange={e => setEditingRecord({ ...editingRecord, priority: e.target.value as any })}
                        className={inputCls}
                      >
                        {['Low', 'Medium', 'High', 'Critical'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                  </div>
                </FormSection>

                {/* Section 10: Documents */}
                <FormSection title="Section 10: Supporting Documents">
                  <p className="text-xs text-muted-foreground mb-3">Attach supporting documents (Medical certificates, grade cards, recommendation letters)</p>
                  <div className="space-y-3">
                    {['Medical Certificate', 'Progress Report', 'Supporting Documents'].map(docType => (
                      <label key={docType} className="flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-border hover:border-indigo-400 transition cursor-pointer bg-muted/10">
                        <Paperclip className="size-5 text-indigo-500" />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-foreground">{docType}</p>
                          <p className="text-[11px] text-muted-foreground">Click to select PDF or image file</p>
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.png,.doc,.docx"
                          className="hidden"
                          onChange={e => {
                            if (e.target.files?.[0]) {
                              const fileName = `${docType}: ${e.target.files[0].name}`;
                              setEditingRecord({
                                ...editingRecord,
                                documents: [...(editingRecord.documents || []), fileName],
                              });
                              toast.success(`${docType} attached`);
                            }
                          }}
                        />
                      </label>
                    ))}

                    {editingRecord.documents?.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle className="size-4" /> {d}
                        <button
                          type="button"
                          onClick={() => setEditingRecord({
                            ...editingRecord,
                            documents: editingRecord.documents.filter((_, j) => j !== i)
                          })}
                          className="ml-auto text-rose-500 hover:text-rose-700"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </FormSection>

              </div>

              {/* Drawer Footer Action Buttons */}
              <div className="px-6 py-4 border-t border-border bg-background flex items-center justify-between gap-3 sticky bottom-0 z-10 shadow-lg">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted transition cursor-pointer"
                >
                  Cancel
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveForm(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold text-foreground hover:bg-muted transition cursor-pointer"
                  >
                    <Save className="size-4" /> Save Draft
                  </button>
                  <button
                    onClick={() => saveForm(false)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition cursor-pointer shadow-md"
                  >
                    <Send className="size-4" /> Submit Counselling
                  </button>
                  <button
                    onClick={() => generatePDFReport(selectedStudent)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition cursor-pointer shadow-md"
                  >
                    <Printer className="size-4" /> Generate PDF
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Student Detail View Component ───────────────────────────────────────────

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
      {/* Back button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
        >
          <ArrowLeft className="size-4" /> Back to Counselling Roster
        </button>
      </div>

      {/* Student Profile Banner */}
      <Card className="overflow-hidden border border-border">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-6 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-18 h-18 rounded-2xl bg-white/20 border-4 border-white/30 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl">
              {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold">{student.fullName}</h2>
              <p className="text-indigo-100 text-sm font-mono mt-0.5">
                {student.rollNumber} · {student.department} · Year {student.year} (Sem {student.semester}, Sec {student.section})
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  Section {student.section}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${getAttendanceBg(student.attendancePercentage)}`}>
                  {student.attendancePercentage}% Attendance
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onAddCounselling}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-indigo-700 text-sm font-bold hover:bg-indigo-50 transition shadow-md cursor-pointer"
              >
                <Plus className="size-4" /> Add Counselling
              </button>
              <button
                onClick={onDownload}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/20 text-white text-sm font-bold hover:bg-white/30 transition cursor-pointer"
                title="Download PDF Report"
              >
                <Download className="size-4" /> PDF Report
              </button>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x border-t bg-card">
          {[
            { label: 'Department', value: student.department },
            { label: 'Email Address', value: student.email || '—' },
            { label: 'Phone Number', value: student.phoneNumber || '—' },
            { label: 'Admission Number', value: student.admissionNumber || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="px-5 py-3.5 text-center">
              <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
              <p className="text-xs font-bold text-foreground truncate mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Parent Details Card */}
      {(student.parentName || student.parentPhone) && (
        <Card className="p-5">
          <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
            <User className="size-4 text-indigo-500" /> Parent & Guardian Information
          </h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            {student.parentName && <div><p className="text-muted-foreground text-xs font-medium">Guardian Name</p><p className="font-semibold text-foreground mt-0.5">{student.parentName}</p></div>}
            {student.parentPhone && <div><p className="text-muted-foreground text-xs font-medium">Guardian Phone</p><p className="font-semibold text-foreground mt-0.5">{student.parentPhone}</p></div>}
            {student.parentEmail && <div><p className="text-muted-foreground text-xs font-medium">Guardian Email</p><p className="font-semibold text-foreground mt-0.5">{student.parentEmail}</p></div>}
          </div>
        </Card>
      )}

      {/* Counselling Session History */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <HeartHandshake className="size-4.5 text-indigo-600 dark:text-indigo-400" /> Counselling Sessions History ({submittedRecords.length} completed)
          </h3>
          {draftRecords.length > 0 && (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200">
              {draftRecords.length} Draft Session(s) Saved
            </span>
          )}
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12">
            <HeartHandshake className="size-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">No counselling sessions recorded yet</p>
            <p className="text-xs text-muted-foreground mt-1">Click "Add Counselling" above to conduct a session for this student.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {records.map((rec, i) => (
              <div key={rec.id} className="p-6 hover:bg-muted/10 transition">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-extrabold text-foreground">Session #{records.length - i}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                        <Calendar className="size-3.5 text-indigo-500" /> {new Date(rec.date).toLocaleDateString('en-IN')}
                      </span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${getPriorityColor(rec.priority)}`}>
                        Priority: {rec.priority}
                      </span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${rec.status === 'Submitted' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                        {rec.status}
                      </span>
                    </div>

                    {rec.recommendations && (
                      <div className="text-xs text-foreground bg-muted/30 p-3 rounded-xl border">
                        <p className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">Faculty Recommendations:</p>
                        <p className="text-muted-foreground leading-relaxed">{rec.recommendations}</p>
                      </div>
                    )}

                    {rec.actionPlan && (
                      <div className="text-xs text-foreground bg-muted/30 p-3 rounded-xl border">
                        <p className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">Action Plan:</p>
                        <p className="text-muted-foreground leading-relaxed">{rec.actionPlan}</p>
                      </div>
                    )}

                    {rec.nextCounsellingDate && (
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1.5">
                        <Clock className="size-3.5" /> Next Follow-up Scheduled: {new Date(rec.nextCounsellingDate).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => onEditRecord(rec)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-background hover:bg-muted text-xs font-bold text-foreground transition cursor-pointer"
                    >
                      <Edit3 className="size-3.5 text-indigo-500" /> Edit Record
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
