import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  BookOpen,
  Wallet,
  Library,
  Building2,
  Bus,
  Sparkles,
  Bell,
  Settings,
  Shield,
  Briefcase,
  Heart,
  ClipboardList,
  FileText,
  Activity,
  Database,
  Award,
  FileSpreadsheet,
  UserPlus,
  MessageSquare,
  ShieldAlert,
  FolderLock,
  Clock,
  Search,
  Plus,
  Star,
  DollarSign,
  Send,
  HelpCircle,
  ShieldCheck,
  Image,
  FlaskConical,
} from 'lucide-react';

export type RoleId =
  | 'super_admin'
  | 'admin'
  | 'faculty'
  | 'lms'
  | 'student'
  | 'parent'
  | 'librarian'
  | 'placement'
  | 'warden'
  | 'transport'
  | 'principal'
  | 'dean'
  | 'hod'
  | 'exam_cell'
  | 'accounts'
  | 'alumni_coordinator'
  | 'alumni';

export type NavItem = {
  to: string;
  label: string;
  icon: any;
  exact?: boolean;
  children?: NavItem[];
};

export type Role = {
  id: RoleId;
  name: string;
  short: string;
  description: string;
  icon: any;
  gradient: string; // tailwind gradient classes
  accent: string; // dot color
  nav: NavItem[];
};

const base: NavItem = { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true };
const settings: NavItem = { to: '/dashboard/settings', label: 'Settings', icon: Settings };
const notif: NavItem = { to: '/dashboard/notifications', label: 'Notifications', icon: Bell };

// ── Full grouped alumni workspace nav (ERPNext-style) ──
const alumniWorkspaceNav: NavItem[] = [
  { to: '/dashboard/admin/alumni', label: 'Dashboard', icon: LayoutDashboard, exact: true },

  // Alumni Management group
  {
    to: '/dashboard/admin/alumni/directory',
    label: 'Alumni Management',
    icon: Users,
    children: [
      { to: '/dashboard/admin/alumni/directory', label: 'Alumni Directory', icon: Search },
      { to: '/dashboard/admin/alumni/registration', label: 'Alumni Registration', icon: Plus },
      { to: '/dashboard/admin/alumni/profile', label: 'Alumni Profiles', icon: Award },
      {
        to: '/dashboard/admin/alumni/verification',
        label: 'Alumni Verification',
        icon: ShieldCheck,
      },
    ],
  },

  // Career group
  {
    to: '/dashboard/admin/alumni/jobs',
    label: 'Career',
    icon: Briefcase,
    children: [
      { to: '/dashboard/admin/alumni/jobs', label: 'Job Portal', icon: Briefcase },
      { to: '/dashboard/admin/alumni/internships', label: 'Internship Portal', icon: BookOpen },
      { to: '/dashboard/admin/alumni/placement', label: 'Placement Portal', icon: Star },
    ],
  },

  // Community group
  {
    to: '/dashboard/admin/alumni/mentorship',
    label: 'Community',
    icon: Heart,
    children: [
      { to: '/dashboard/admin/alumni/mentorship', label: 'Mentorship', icon: Star },
      { to: '/dashboard/admin/alumni/networking', label: 'Professional Network', icon: Users },
      { to: '/dashboard/admin/alumni/messaging', label: 'Messages', icon: MessageSquare },
    ],
  },

  // Events group
  {
    to: '/dashboard/admin/alumni/events',
    label: 'Events',
    icon: CalendarCheck,
    children: [
      { to: '/dashboard/admin/alumni/events', label: 'Events & Reunions', icon: CalendarCheck },
      {
        to: '/dashboard/admin/alumni/events?section=registration',
        label: 'Event Registration',
        icon: Plus,
      },
      { to: '/dashboard/admin/alumni/gallery', label: 'Event Gallery', icon: Image },
    ],
  },

  // Contributions group
  {
    to: '/dashboard/admin/alumni/donations',
    label: 'Contributions',
    icon: DollarSign,
    children: [
      { to: '/dashboard/admin/alumni/donations', label: 'Donations', icon: DollarSign },
      { to: '/dashboard/admin/alumni/stories', label: 'Success Stories', icon: BookOpen },
    ],
  },

  // Communication group
  {
    to: '/dashboard/admin/alumni/announcements',
    label: 'Communication',
    icon: Send,
    children: [
      { to: '/dashboard/admin/alumni/announcements', label: 'Announcements', icon: Send },
      { to: '/dashboard/admin/alumni/notifications', label: 'Notifications', icon: Bell },
    ],
  },

  { to: '/dashboard/admin/alumni/reports', label: 'Reports & Analytics', icon: Activity },
  { to: '/dashboard/admin/alumni/settings', label: 'Settings', icon: Settings },
  { to: '/dashboard/admin/alumni/help', label: 'Help', icon: HelpCircle },
];

export const ROLES: Record<RoleId, Role> = {
  super_admin: {
    id: 'super_admin',
    name: 'Super Admin',
    short: 'Full system control',
    description: 'Manage admins, automations, global analytics & security.',
    icon: Shield,
    gradient: 'from-slate-900 to-blue-600',
    accent: 'bg-blue-500',
    nav: [
      {
        to: '/dashboard/super-admin',
        label: 'Super Admin Dashboard',
        icon: LayoutDashboard,
        exact: true,
      },
      { to: '/dashboard/super-admin/users', label: 'User Management', icon: Users },
      { to: '/dashboard/super-admin/admins', label: 'Admin Management', icon: Users },
      { to: '/dashboard/super-admin/departments', label: 'Departments', icon: Building2 },
      { to: '/dashboard/super-admin/courses', label: 'Courses', icon: BookOpen },
      { to: '/dashboard/admin/admissions', label: 'Admissions', icon: UserPlus },
      { to: '/dashboard/admin/finance', label: 'Finance & Accounts', icon: Wallet },
      { to: '/dashboard/admin/hrms', label: 'HRMS / Payroll', icon: ClipboardList },
      { to: '/dashboard/admin/inventory', label: 'Inventory Management', icon: Database },
      { to: '/dashboard/admin/accreditation', label: 'Accreditation (NAAC)', icon: Award },
      { to: '/dashboard/admin/grievance', label: 'Grievances Cell', icon: ShieldAlert },
      { to: '/dashboard/super-admin/configuration', label: 'System Configuration', icon: Settings },
      { to: '/dashboard/super-admin/automation', label: 'AI Automation Control', icon: Sparkles },
      { to: '/dashboard/super-admin/reports', label: 'Global Reports', icon: Activity },
      { to: '/dashboard/super-admin/security', label: 'Security & Logs', icon: Shield },
      { to: '/dashboard/super-admin/backups', label: 'Backup Management', icon: Database },
      { to: '/dashboard/super-admin/notifications', label: 'Notifications', icon: Bell },
      { to: '/dashboard/super-admin/settings', label: 'Settings', icon: Settings },
    ],
  },
  admin: {
    id: 'admin',
    name: 'Admin',
    short: 'Operations & approvals',
    description: 'Run students, faculty, timetables, fees and reports.',
    icon: Briefcase,
    gradient: 'from-blue-600 to-cyan-500',
    accent: 'bg-cyan-500',
    nav: [
      base,
      { to: '/dashboard/admin/students', label: 'Students Roster', icon: Users },
      { to: '/dashboard/admin/faculty', label: 'Faculty Roster', icon: GraduationCap, exact: true },
      { to: '/dashboard/admin/admissions', label: 'Admission Desk', icon: UserPlus },
      { to: '/dashboard/admin/assignments', label: 'Faculty Assignments', icon: ClipboardList },
      { to: '/dashboard/admin/timetable', label: 'Class Timetable', icon: CalendarCheck },
      { to: '/dashboard/admin/attendance', label: 'Attendance Control', icon: CalendarCheck },
      {
        to: '/dashboard/admin/faculty/attendance',
        label: 'Faculty Attendance',
        icon: CalendarCheck,
      },
      { to: '/dashboard/admin/exams/schedule', label: 'Exam Cell Manager', icon: BookOpen },
      { to: '/dashboard/admin/lms', label: 'LMS Curriculum', icon: FileText },
      { to: '/dashboard/admin/fees', label: 'Fee Collection', icon: Wallet },
      { to: '/dashboard/admin/finance', label: 'Finance & GST', icon: FileSpreadsheet },
      { to: '/dashboard/admin/hrms', label: 'HRMS & Payroll', icon: ClipboardList },
      { to: '/dashboard/admin/inventory', label: 'Inventory Stock', icon: Database },
      { to: '/dashboard/admin/accreditation', label: 'NAAC/NBA Portal', icon: Award },
      { to: '/dashboard/admin/communication', label: 'Communication Hub', icon: MessageSquare },
      { to: '/dashboard/admin/grievance', label: 'Grievances Cell', icon: ShieldAlert },
      { to: '/dashboard/admin/events', label: 'Campus Events', icon: Sparkles },
      { to: '/dashboard/admin/research', label: 'Research (R&D)', icon: Sparkles },
      { to: '/dashboard/admin/clubs', label: 'Student Clubs', icon: Users },
      { to: '/dashboard/admin/health', label: 'Health & Wellness', icon: Heart },
      { to: '/dashboard/admin/notifications', label: 'Notifications', icon: Bell },
      { to: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
  faculty: {
    id: 'faculty',
    name: 'Faculty',
    short: 'Teaching workspace',
    description: 'Mark attendance, post materials, track students.',
    icon: GraduationCap,
    gradient: 'from-violet-600 to-blue-600',
    accent: 'bg-violet-500',
    nav: [
      base,
      { to: '/dashboard/faculty/attendance', label: 'Attendance', icon: CalendarCheck },
      { to: '/dashboard/faculty/materials', label: 'Materials', icon: BookOpen },
      { to: '/dashboard/faculty/research', label: 'Research', icon: FlaskConical },
      { to: '/dashboard/faculty/publications', label: 'Publications', icon: FileText },
      { to: '/dashboard/admin/lms', label: 'LMS Portal', icon: FileText },
      { to: '/dashboard/faculty/students', label: 'My Students', icon: Users },
      { to: '/dashboard/faculty/communication', label: 'Message Hub', icon: MessageSquare },
      { to: '/dashboard/faculty/notifications', label: 'Notifications', icon: Bell },
      { to: '/dashboard/faculty/settings', label: 'Settings', icon: Settings },
    ],
  },
  lms: {
    id: 'lms',
    name: 'LMS Coordinator',
    short: 'Digital learning hub',
    description: 'Manage notes, video lectures, quizzes, assignments, forum, and online classes.',
    icon: BookOpen,
    gradient: 'from-emerald-500 to-teal-600',
    accent: 'bg-emerald-500',
    nav: [
      { to: '/dashboard/admin/lms', label: 'LMS Home', icon: LayoutDashboard, exact: true },
      { to: '/dashboard/faculty/materials', label: 'Study Materials', icon: FileText },
      { to: '/dashboard/faculty/attendance', label: 'Attendance', icon: CalendarCheck },
      { to: '/dashboard/faculty/students', label: 'My Students', icon: Users },
      { to: '/dashboard/faculty/communication', label: 'Message Hub', icon: MessageSquare },
      notif,
      settings,
    ],
  },
  student: {
    id: 'student',
    name: 'Student',
    short: 'Your academic hub',
    description: 'GPA, attendance, fees, assignments and placements.',
    icon: Users,
    gradient: 'from-cyan-500 to-indigo-600',
    accent: 'bg-indigo-500',
    nav: [
      base,
      { to: '/dashboard/student/attendance', label: 'Attendance', icon: CalendarCheck },
      { to: '/dashboard/student/timetable', label: 'Class Timetable', icon: Clock },
      { to: '/dashboard/student/results', label: 'Results & GPA', icon: BookOpen },
      { to: '/dashboard/student/fees', label: 'Fees Registry', icon: Wallet },
      { to: '/dashboard/library', label: 'Library Catalog', icon: Library },
      { to: '/dashboard/student/materials', label: 'Study Materials', icon: FileText },
      { to: '/dashboard/admin/lms', label: 'LMS Classroom', icon: BookOpen },
      { to: '/dashboard/student/complaints', label: 'Grievances Box', icon: ShieldAlert },
      { to: '/dashboard/student/events', label: 'Events', icon: Sparkles },
      notif,
      settings,
    ],
  },
  parent: {
    id: 'parent',
    name: 'Parent',
    short: 'Track your child',
    description: 'Performance, attendance and fee status at a glance.',
    icon: Heart,
    gradient: 'from-emerald-500 to-cyan-500',
    accent: 'bg-emerald-500',
    nav: [
      base,
      { to: '/dashboard/parent/attendance', label: 'Attendance', icon: CalendarCheck },
      { to: '/dashboard/parent/marks', label: 'Performance', icon: Activity },
      { to: '/dashboard/parent/fees', label: 'Fees Status', icon: Wallet },
      { to: '/dashboard/admin/grievance', label: 'Report Grievance', icon: ShieldAlert },
      { to: '/dashboard/parent/notifications', label: 'Notifications', icon: Bell },
      settings,
    ],
  },
  librarian: {
    id: 'librarian',
    name: 'Librarian',
    short: 'Library operations',
    description: 'Books, fines, digital catalog and reports.',
    icon: Library,
    gradient: 'from-amber-500 to-blue-600',
    accent: 'bg-amber-500',
    nav: [
      { to: '/dashboard/librarian', label: 'Library Overview', icon: Library, exact: true },
      { to: '/dashboard/librarian/books', label: 'Book Management', icon: BookOpen },
      { to: '/dashboard/librarian/issue', label: 'Issue Books', icon: ClipboardList },
      { to: '/dashboard/librarian/return', label: 'Return Books', icon: Activity },
      { to: '/dashboard/librarian/members', label: 'Members', icon: Users },
      { to: '/dashboard/librarian/digital', label: 'Digital Library', icon: FileText },
      { to: '/dashboard/librarian/fines', label: 'Fines', icon: Wallet },
      { to: '/dashboard/librarian/reports', label: 'Reports', icon: Activity },
      { to: '/dashboard/librarian/notifications', label: 'Notifications', icon: Bell },
      { to: '/dashboard/librarian/settings', label: 'Settings', icon: Settings },
    ],
  },
  placement: {
    id: 'placement',
    name: 'Placement Officer',
    short: 'Hiring & companies',
    description:
      'Companies, drives, eligibility, applications, interviews, offers, training and reports.',
    icon: FileText,
    gradient: 'from-purple-600 to-cyan-500',
    accent: 'bg-purple-500',
    nav: [
      {
        to: '/dashboard/placement',
        label: 'Placement Overview',
        icon: LayoutDashboard,
        exact: true,
      },
      { to: '/dashboard/placement/companies', label: 'Companies', icon: Briefcase },
      { to: '/dashboard/placement/drives', label: 'Drives', icon: Sparkles },
      { to: '/dashboard/placement/eligibility', label: 'Eligibility', icon: ClipboardList },
      { to: '/dashboard/placement/applications', label: 'Applications', icon: FileText },
      { to: '/dashboard/placement/interviews', label: 'Interview Scheduling', icon: CalendarCheck },
    ],
  },
  warden: {
    id: 'warden',
    name: 'Hostel Warden',
    short: 'Hostel management',
    description: 'Rooms, visitors, complaints and hostel fees.',
    icon: Building2,
    gradient: 'from-teal-500 to-blue-600',
    accent: 'bg-teal-500',
    nav: [
      base,
      {
        to: '/dashboard/hostel',
        label: 'Hostel',
        icon: Building2,
        children: [
          { to: '/dashboard/hostel/attendance', label: 'Attendance', icon: CalendarCheck },
          { to: '/dashboard/hostel/visitors', label: 'Visitors', icon: ClipboardList },
          { to: '/dashboard/hostel/complaints', label: 'Complaints', icon: FileText },
          { to: '/dashboard/hostel/mess/menus', label: 'Mess Menus', icon: FileText },
          { to: '/dashboard/hostel/mess/fees', label: 'Mess Fees', icon: Wallet },
        ],
      },
      { to: '/dashboard/hostel/students', label: 'Residents', icon: Users },
      { to: '/dashboard/hostel/fees', label: 'Fees', icon: Wallet },
      notif,
      { to: '/dashboard/hostel/settings', label: 'Settings', icon: Settings },
    ],
  },
  transport: {
    id: 'transport',
    name: 'Transport Manager',
    short: 'Routes & vehicles',
    description: 'Buses, routes, drivers and live tracking.',
    icon: Bus,
    gradient: 'from-orange-500 to-blue-600',
    accent: 'bg-orange-500',
    nav: [
      base,
      { to: '/dashboard/transport', label: 'Transport', icon: Bus },
      { to: '/dashboard/students', label: 'Passengers', icon: Users },
      { to: '/dashboard/admin/fees', label: 'Fee Collection', icon: Wallet },
      notif,
      settings,
    ],
  },
  principal: {
    id: 'principal',
    name: 'Principal',
    short: 'Executive Board',
    description: 'Institution-wide reports, budget approvals, and NAAC accreditation.',
    icon: Shield,
    gradient: 'from-amber-600 to-rose-600',
    accent: 'bg-rose-500',
    nav: [
      base,
      { to: '/dashboard/admin/admissions', label: 'Admissions Desk', icon: UserPlus },
      { to: '/dashboard/admin/finance', label: 'Finance & Accounts', icon: FileSpreadsheet },
      { to: '/dashboard/admin/accreditation', label: 'NAAC/NBA Dashboard', icon: Award },
      { to: '/dashboard/admin/grievance', label: 'Grievances Desk', icon: ShieldAlert },
      { to: '/dashboard/admin/communication', label: 'Communication Center', icon: MessageSquare },
      { to: '/dashboard/admin/reports', label: 'Academic Audit Reports', icon: Activity },
      settings,
    ],
  },
  dean: {
    id: 'dean',
    name: 'Dean Academics',
    short: 'Curriculum & Exams',
    description: 'Semester schedules, R20/R23 curricula, and Exam Cell liaison.',
    icon: GraduationCap,
    gradient: 'from-violet-700 to-indigo-800',
    accent: 'bg-indigo-600',
    nav: [
      base,
      { to: '/dashboard/admin/timetable', label: 'Academic Timetable', icon: CalendarCheck },
      { to: '/dashboard/admin/exams/schedule', label: 'Exams Portal', icon: BookOpen },
      { to: '/dashboard/admin/lms', label: 'LMS Curriculum', icon: FileText },
      { to: '/dashboard/admin/academics', label: 'Academic Management', icon: BookOpen },
      { to: '/dashboard/admin/reports', label: 'Grade Audit Reports', icon: Activity },
      settings,
    ],
  },
  hod: {
    id: 'hod',
    name: 'HOD CSE',
    short: 'Department Head',
    description: 'Department workloads, staff logs, and student performance monitoring.',
    icon: Building2,
    gradient: 'from-emerald-600 to-teal-700',
    accent: 'bg-teal-600',
    nav: [
      base,
      { to: '/dashboard/admin/students', label: 'Dept Students', icon: Users },
      {
        to: '/dashboard/admin/faculty',
        label: 'Faculty Workloads',
        icon: GraduationCap,
        exact: true,
      },
      { to: '/dashboard/admin/timetable', label: 'Dept Timetable', icon: CalendarCheck },
      { to: '/dashboard/admin/academics', label: 'Academic Management', icon: BookOpen },
      { to: '/dashboard/admin/attendance', label: 'Attendance Audit', icon: CalendarCheck },
      {
        to: '/dashboard/admin/faculty/attendance',
        label: 'Faculty Attendance',
        icon: CalendarCheck,
      },
      { to: '/dashboard/admin/exams/schedule', label: 'Dept Exams & Marks', icon: BookOpen },
      settings,
    ],
  },
  exam_cell: {
    id: 'exam_cell',
    name: 'Exam Cell Officer',
    short: 'Testing & Grades',
    description: 'Exam registers, Hall Tickets, Seating charts, CGPA and Grade Cards.',
    icon: Award,
    gradient: 'from-rose-600 to-violet-600',
    accent: 'bg-rose-500',
    nav: [
      base,
      { to: '/dashboard/admin/exams/schedule', label: 'Schedule Exam', icon: ClipboardList },
      { to: '/dashboard/admin/exams/timetable', label: 'Timetable Builder', icon: CalendarCheck },
      { to: '/dashboard/admin/exams/questions', label: 'Question Bank', icon: Database },
      {
        to: '/dashboard/admin/exams/invigilation',
        label: 'Invigilation Duty',
        icon: ClipboardList,
      },
      { to: '/dashboard/admin/exams/hall-tickets', label: 'Hall Ticket Control', icon: Users },
      { to: '/dashboard/admin/exams/results', label: 'Results Publisher', icon: Award },
      { to: '/dashboard/admin/exams/analytics', label: 'Exam Analytics', icon: Activity },
      notif,
      settings,
    ],
  },
  accounts: {
    id: 'accounts',
    name: 'Accounts Manager',
    short: 'Finance & Payroll',
    description: 'Fee structure collection, vendor logs, GST filing, and staff payroll ledger.',
    icon: Wallet,
    gradient: 'from-cyan-600 to-blue-700',
    accent: 'bg-blue-600',
    nav: [
      base,
      { to: '/dashboard/admin/fees', label: 'Tuition Fees', icon: Wallet },
      { to: '/dashboard/admin/finance', label: 'Finance Ledger', icon: FileSpreadsheet },
      { to: '/dashboard/admin/hrms', label: 'HRMS Staff Payroll', icon: ClipboardList },
      settings,
    ],
  },
  alumni_coordinator: {
    id: 'alumni_coordinator',
    name: 'Alumni Coordinator',
    short: 'Alumni & Reunions',
    description: 'Manage alumni registrations, events, mentorship, and donations.',
    icon: Heart,
    gradient: 'from-pink-500 to-rose-600',
    accent: 'bg-rose-500',
    nav: [...alumniWorkspaceNav],
  },
  alumni: {
    id: 'alumni',
    name: 'Alumni',
    short: 'Alumni Workspace',
    description: 'Access job board, networking events, mentorship, and donations.',
    icon: Award,
    gradient: 'from-indigo-600 to-pink-500',
    accent: 'bg-indigo-500',
    nav: [...alumniWorkspaceNav],
  },
};

export const ROLE_LIST = Object.values(ROLES);

const KEY = 'campusly.role';

export function setActiveRole(id: RoleId) {
  if (typeof window !== 'undefined') localStorage.setItem(KEY, id);
}
export function getActiveRole(): Role {
  if (typeof window === 'undefined') return ROLES.super_admin;
  const id = (localStorage.getItem(KEY) as RoleId) || 'super_admin';
  return ROLES[id] ?? ROLES.super_admin;
}
