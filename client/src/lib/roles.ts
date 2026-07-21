import {
  LayoutDashboard, Users, GraduationCap, CalendarCheck, BookOpen,
  Wallet, Library, Building2, Bus, Sparkles, Bell, Settings, Shield,
  Briefcase, Heart, ClipboardList, FileText, Activity, Database,
  Award, FileSpreadsheet, UserPlus, MessageSquare, ShieldAlert,
  Clock, Search, Plus, Star, DollarSign, Send, HelpCircle,
  ShieldCheck, CheckCircle, Image, FlaskConical, Server, Lock,
  TrendingUp, BarChart2, Phone, Clipboard, Key, Package,
  Map, Fuel, Wrench, CreditCard, BookMarked, AlertTriangle,
} from 'lucide-react';

export type RoleId =
  | 'super_admin' | 'admin' | 'faculty' | 'lms' | 'student'
  | 'parent' | 'librarian' | 'placement' | 'warden' | 'transport'
  | 'principal' | 'vice_principal' | 'dean' | 'hod' | 'exam_cell'
  | 'accounts' | 'alumni_coordinator' | 'alumni' | 'receptionist';

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
  gradient: string;
  accent: string;
  nav: NavItem[];
};

const settings: NavItem = { to: '/dashboard/settings', label: 'Settings', icon: Settings };
const notif: NavItem = { to: '/dashboard/notifications', label: 'Notifications', icon: Bell };

const alumniWorkspaceNav: NavItem[] = [
  { to: '/dashboard/admin/alumni', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/dashboard/admin/alumni/directory', label: 'Alumni Management', icon: Users, children: [
    { to: '/dashboard/admin/alumni/directory', label: 'Alumni Directory', icon: Search },
    { to: '/dashboard/admin/alumni/registration', label: 'Alumni Registration', icon: Plus },
    { to: '/dashboard/admin/alumni/profile', label: 'Alumni Profiles', icon: Award },
    { to: '/dashboard/admin/alumni/verification', label: 'Alumni Verification', icon: ShieldCheck },
  ]},
  { to: '/dashboard/admin/alumni/jobs', label: 'Career', icon: Briefcase, children: [
    { to: '/dashboard/admin/alumni/jobs', label: 'Job Portal', icon: Briefcase },
    { to: '/dashboard/admin/alumni/internships', label: 'Internship Portal', icon: BookOpen },
    { to: '/dashboard/admin/alumni/placement', label: 'Placement Portal', icon: Star },
  ]},
  { to: '/dashboard/admin/alumni/mentorship', label: 'Community', icon: Heart, children: [
    { to: '/dashboard/admin/alumni/mentorship', label: 'Mentorship', icon: Star },
    { to: '/dashboard/admin/alumni/networking', label: 'Professional Network', icon: Users },
    { to: '/dashboard/admin/alumni/messaging', label: 'Messages', icon: MessageSquare },
  ]},
  { to: '/dashboard/admin/alumni/events', label: 'Events', icon: CalendarCheck, children: [
    { to: '/dashboard/admin/alumni/events', label: 'Events & Reunions', icon: CalendarCheck },
    { to: '/dashboard/admin/alumni/events?section=registration', label: 'Event Registration', icon: Plus },
    { to: '/dashboard/admin/alumni/gallery', label: 'Event Gallery', icon: Image },
  ]},
  { to: '/dashboard/admin/alumni/donations', label: 'Contributions', icon: DollarSign, children: [
    { to: '/dashboard/admin/alumni/donations', label: 'Donations', icon: DollarSign },
    { to: '/dashboard/admin/alumni/stories', label: 'Success Stories', icon: BookOpen },
  ]},
  { to: '/dashboard/admin/alumni/announcements', label: 'Communication', icon: Send, children: [
    { to: '/dashboard/admin/alumni/announcements', label: 'Announcements', icon: Send },
    { to: '/dashboard/admin/alumni/notifications', label: 'Notifications', icon: Bell },
  ]},
  { to: '/dashboard/admin/alumni/reports', label: 'Reports & Analytics', icon: Activity },
  { to: '/dashboard/admin/alumni/settings', label: 'Settings', icon: Settings },
  { to: '/dashboard/admin/alumni/help', label: 'Help', icon: HelpCircle },
];

export const ROLES: Record<RoleId, Role> = {

  super_admin: {
    id: 'super_admin', name: 'Super Admin', short: 'Full system control',
    description: 'Manage admins, automations, global analytics & security.',
    icon: Shield, gradient: 'from-blue-600 to-blue-700', accent: 'bg-blue-600',
    nav: [
      { to: '/dashboard/super-admin', label: 'System Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/dashboard/super-admin/users', label: 'User Management', icon: Users },
      { to: '/dashboard/super-admin/departments', label: 'Academic Structure', icon: Building2 },
      { to: '/dashboard/super-admin/configuration', label: 'System Configuration', icon: Settings },
      { to: '/dashboard/super-admin/security', label: 'Security & Logs', icon: Shield },
      { to: '/dashboard/super-admin/backups', label: 'Backup Management', icon: Database },
      { to: '/dashboard/super-admin/automation', label: 'Automation Rules', icon: Sparkles },
      { to: '/dashboard/super-admin/reports', label: 'Global Reports', icon: Activity },
      { to: '/dashboard/super-admin/notifications', label: 'Notifications', icon: Bell },
      { to: '/dashboard/super-admin/settings', label: 'Settings', icon: Settings },
    ],
  },

  admin: {
    id: 'admin', name: 'Admin', short: 'Operations & approvals',
    description: 'Run students, faculty, timetables, fees and reports.',
    icon: Briefcase, gradient: 'from-blue-600 to-blue-700', accent: 'bg-blue-600',
    nav: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/dashboard/admin/admissions', label: 'Admissions', icon: UserPlus },
      { to: '/dashboard/admin/students', label: 'Student Records', icon: Users },
      { to: '/dashboard/admin/faculty', label: 'Employee Records', icon: GraduationCap },
      { to: '/dashboard/super-admin/departments', label: 'Departments', icon: Building2 },
      { to: '/dashboard/admin/fees', label: 'Fees Management', icon: Wallet },
      { to: '/dashboard/admin/timetable', label: 'Timetable', icon: CalendarCheck },
      { to: '/dashboard/admin/academics', label: 'Academics', icon: BookOpen },
      { to: '/dashboard/admin/attendance-approvals', label: 'Approval Queue', icon: ClipboardList },
      { to: '/dashboard/admin/communication', label: 'Communication', icon: MessageSquare },
      { to: '/dashboard/admin/notifications', label: 'Notifications', icon: Bell },
      { to: '/dashboard/admin/reports', label: 'Reports', icon: Activity },
      { to: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
    ],
  },

  principal: {
    id: 'principal', name: 'Principal', short: 'Executive Board',
    description: 'Institution-wide reports, budget approvals, and NAAC accreditation.',
    icon: Shield, gradient: 'from-blue-600 to-blue-700', accent: 'bg-blue-600',
    nav: [
      { to: '/dashboard/principal', label: 'Principal Console', icon: LayoutDashboard, exact: true },
      { to: '/dashboard/admin/students', label: 'All Students', icon: Users },
      { to: '/dashboard/admin/faculty', label: 'All Faculty', icon: GraduationCap },
      { to: '/dashboard/super-admin/departments', label: 'Departments', icon: Building2 },
      { to: '/dashboard/admin/attendance', label: 'Attendance Analytics', icon: CalendarCheck },
      { to: '/dashboard/admin/exams/results', label: 'Exam Performance', icon: Award },
      { to: '/dashboard/admin/finance', label: 'Finance Overview', icon: FileSpreadsheet },
      { to: '/dashboard/admin/accreditation', label: 'NAAC / NBA', icon: ShieldCheck },
      { to: '/dashboard/admin/grievance', label: 'Grievances', icon: ShieldAlert },
      { to: '/dashboard/admin/communication', label: 'Circulars', icon: MessageSquare },
      { to: '/dashboard/admin/reports', label: 'Academic Reports', icon: Activity },
      settings,
    ],
  },

  vice_principal: {
    id: 'vice_principal', name: 'Vice Principal', short: 'Executive Vice Lead',
    description: 'Daily academic operations, faculty monitoring, department oversight.',
    icon: ShieldCheck, gradient: 'from-blue-600 to-blue-700', accent: 'bg-blue-600',
    nav: [
      { to: '/dashboard/vice-principal', label: 'VP Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/dashboard/admin/faculty', label: 'Faculty Monitoring', icon: GraduationCap },
      { to: '/dashboard/admin/attendance', label: 'Attendance Monitor', icon: CalendarCheck },
      { to: '/dashboard/admin/students', label: 'Student Discipline', icon: Users },
      { to: '/dashboard/super-admin/departments', label: 'Departments', icon: Building2 },
      { to: '/dashboard/admin/attendance-approvals', label: 'Approvals', icon: ClipboardList },
      { to: '/dashboard/admin/timetable', label: 'Timetable', icon: Clock },
      { to: '/dashboard/admin/communication', label: 'Communication', icon: MessageSquare },
      { to: '/dashboard/admin/reports', label: 'Reports', icon: Activity },
      settings,
    ],
  },

  dean: {
    id: 'dean', name: 'Dean', short: 'Academic & Executive Leadership',
    description: 'Administrative control over students, faculty, examinations, IQAC, IMA.',
    icon: GraduationCap, gradient: 'from-blue-600 to-blue-700', accent: 'bg-blue-600',
    nav: [
      { to: '/dashboard/dean', label: 'Dean Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/dashboard/admin/faculty', label: 'Faculty Management', icon: Users, exact: true },
      { to: '/dashboard/dean/student', label: 'Student Administration', icon: Users },
      { to: '/dashboard/dean/examination', label: 'Examination', icon: BookOpen },
      { to: '/dashboard/dean/academic', label: 'Academic', icon: Building2 },
      { to: '/dashboard/dean/ima', label: 'IMA', icon: Sparkles },
      { to: '/dashboard/dean/iqac', label: 'IQAC', icon: Award },
      { to: '/dashboard/dean/approvals', label: 'Approvals', icon: CheckCircle },
      { to: '/dashboard/dean/reports', label: 'Reports', icon: FileText },
      notif,
      settings,
    ],
  },

  hod: {
    id: 'hod', name: 'HOD', short: 'Department Head',
    description: 'Department workloads, staff logs, and student performance monitoring.',
    icon: Building2, gradient: 'from-blue-600 to-blue-700', accent: 'bg-blue-600',
    nav: [
      { to: '/dashboard', label: 'Dept Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/dashboard/admin/students', label: 'Dept Students', icon: Users },
      { to: '/dashboard/admin/faculty', label: 'Faculty Workloads', icon: GraduationCap, exact: true },
      { to: '/dashboard/admin/timetable', label: 'Dept Timetable', icon: CalendarCheck },
      { to: '/dashboard/admin/academics', label: 'Academic Management', icon: BookOpen },
      { to: '/dashboard/admin/attendance', label: 'Attendance Audit', icon: CalendarCheck },
      { to: '/dashboard/admin/attendance-approvals', label: 'Attendance Approvals', icon: ClipboardList },
      { to: '/dashboard/admin/faculty/attendance', label: 'Faculty Attendance', icon: CalendarCheck },
      { to: '/dashboard/admin/exams/schedule', label: 'Dept Exams & Marks', icon: BookOpen },
      { to: '/dashboard/admin/research', label: 'Research', icon: FlaskConical },
      settings,
    ],
  },

  faculty: {
    id: 'faculty', name: 'Faculty', short: 'Teaching workspace',
    description: 'Mark attendance, post materials, track students.',
    icon: GraduationCap, gradient: 'from-blue-600 to-blue-700', accent: 'bg-blue-600',
    nav: [
      { to: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/dashboard/faculty/attendance', label: 'Attendance', icon: CalendarCheck },
      { to: '/dashboard/faculty/classes', label: 'My Classes', icon: Clock },
      { to: '/dashboard/faculty/marks', label: 'Marks Entry', icon: Award },
      { to: '/dashboard/faculty/materials', label: 'Course Materials', icon: BookOpen },
      { to: '/dashboard/admin/lms', label: 'LMS Portal', icon: FileText },
      { to: '/dashboard/faculty/students', label: 'My Students', icon: Users },
      { to: '/dashboard/faculty/research', label: 'Research', icon: FlaskConical },
      { to: '/dashboard/faculty/publications', label: 'Publications', icon: FileText },
      { to: '/dashboard/faculty/leave', label: 'Leave Request', icon: ClipboardList },
      { to: '/dashboard/faculty/communication', label: 'Message Hub', icon: MessageSquare },
      { to: '/dashboard/faculty/notifications', label: 'Notifications', icon: Bell },
      { to: '/dashboard/faculty/settings', label: 'Settings', icon: Settings },
    ],
  },

  lms: {
    id: 'lms', name: 'LMS Coordinator', short: 'Digital learning hub',
    description: 'Manage notes, video lectures, quizzes, assignments, forum, and online classes.',
    icon: BookOpen, gradient: 'from-blue-600 to-blue-700', accent: 'bg-blue-600',
    nav: [
      { to: '/dashboard/admin/lms', label: 'LMS Home', icon: LayoutDashboard, exact: true },
      { to: '/dashboard/faculty/materials', label: 'Study Materials', icon: FileText },
      { to: '/dashboard/faculty/attendance', label: 'Attendance', icon: CalendarCheck },
      { to: '/dashboard/faculty/students', label: 'My Students', icon: Users },
      { to: '/dashboard/faculty/communication', label: 'Message Hub', icon: MessageSquare },
      notif, settings,
    ],
  },

  student: {
    id: 'student', name: 'Student', short: 'Your academic hub',
    description: 'GPA, attendance, fees, assignments and placements.',
    icon: Users, gradient: 'from-blue-600 to-blue-700', accent: 'bg-blue-600',
    nav: [
      { to: '/dashboard/student', label: 'My Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/dashboard/student/attendance', label: 'Attendance', icon: CalendarCheck },
      { to: '/dashboard/student/timetable', label: 'Class Timetable', icon: Clock },
      { to: '/dashboard/student/results', label: 'Results & GPA', icon: BookOpen },
      { to: '/dashboard/student/fees', label: 'Fees Registry', icon: Wallet },
      { to: '/dashboard/library', label: 'Library Catalog', icon: Library },
      { to: '/dashboard/student/materials', label: 'Study Materials', icon: FileText },
      { to: '/dashboard/admin/lms', label: 'LMS Classroom', icon: BookOpen },
      { to: '/dashboard/student/assignments', label: 'Assignments', icon: ClipboardList },
      { to: '/dashboard/student/complaints', label: 'Grievances Box', icon: ShieldAlert },
      { to: '/dashboard/student/events', label: 'Events', icon: Sparkles },
      notif, settings,
    ],
  },

  parent: {
    id: 'parent', name: 'Parent', short: 'Track your child',
    description: 'Performance, attendance and fee status at a glance.',
    icon: Heart, gradient: 'from-blue-600 to-blue-700', accent: 'bg-blue-600',
    nav: [
      { to: '/dashboard/parent', label: 'Child Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/dashboard/parent/attendance', label: 'Attendance', icon: CalendarCheck },
      { to: '/dashboard/parent/marks', label: 'Performance', icon: Activity },
      { to: '/dashboard/parent/fees', label: 'Fees Status', icon: Wallet },
      { to: '/dashboard/parent/leave', label: 'Leave Requests', icon: ClipboardList },
      { to: '/dashboard/parent/communication', label: 'Communication', icon: MessageSquare },
      { to: '/dashboard/parent/notifications', label: 'Notifications', icon: Bell },
      settings,
    ],
  },

  librarian: {
    id: 'librarian', name: 'Librarian', short: 'Library operations',
    description: 'Books, fines, digital catalog and reports.',
    icon: Library, gradient: 'from-blue-600 to-blue-700', accent: 'bg-blue-600',
    nav: [
      { to: '/dashboard/librarian', label: 'Library Overview', icon: Library, exact: true },
      { to: '/dashboard/librarian/books', label: 'Book Catalog', icon: BookOpen },
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
    id: 'placement', name: 'Placement Officer', short: 'Hiring & companies',
    description: 'Companies, drives, eligibility, applications, interviews, offers.',
    icon: FileText, gradient: 'from-blue-600 to-blue-700', accent: 'bg-blue-600',
    nav: [
      { to: '/dashboard/placement', label: 'Placement Overview', icon: LayoutDashboard, exact: true },
      { to: '/dashboard/placement/companies', label: 'Companies', icon: Briefcase },
      { to: '/dashboard/placement/drives', label: 'Placement Drives', icon: Sparkles },
      { to: '/dashboard/placement/eligibility', label: 'Eligibility', icon: ClipboardList },
      { to: '/dashboard/placement/applications', label: 'Applications', icon: FileText },
      { to: '/dashboard/placement/interviews', label: 'Interview Schedule', icon: CalendarCheck },
      { to: '/dashboard/placement/reports', label: 'Reports', icon: Activity },
      notif, settings,
    ],
  },

  warden: {
    id: 'warden', name: 'Hostel Warden', short: 'Hostel management',
    description: 'Rooms, visitors, complaints and hostel fees.',
    icon: Building2, gradient: 'from-blue-600 to-blue-700', accent: 'bg-blue-600',
    nav: [
      { to: '/dashboard', label: 'Hostel Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/dashboard/hostel', label: 'Hostel', icon: Building2, children: [
        { to: '/dashboard/hostel/attendance', label: 'Attendance', icon: CalendarCheck },
        { to: '/dashboard/hostel/visitors', label: 'Visitors', icon: ClipboardList },
        { to: '/dashboard/hostel/complaints', label: 'Complaints', icon: FileText },
        { to: '/dashboard/hostel/mess/menus', label: 'Mess Menus', icon: FileText },
        { to: '/dashboard/hostel/mess/fees', label: 'Mess Fees', icon: Wallet },
      ]},
      { to: '/dashboard/hostel/students', label: 'Residents', icon: Users },
      { to: '/dashboard/hostel/rooms', label: 'Room Allocation', icon: Building2 },
      { to: '/dashboard/hostel/fees', label: 'Fees', icon: Wallet },
      { to: '/dashboard/hostel/reports', label: 'Reports', icon: Activity },
      notif,
      { to: '/dashboard/hostel/settings', label: 'Settings', icon: Settings },
    ],
  },

  transport: {
    id: 'transport', name: 'Transport Manager', short: 'Routes & vehicles',
    description: 'Buses, routes, drivers and live tracking.',
    icon: Bus, gradient: 'from-blue-600 to-blue-700', accent: 'bg-blue-600',
    nav: [
      { to: '/dashboard/transport', label: 'Transport Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/dashboard/transport', label: 'Fleet Management', icon: Bus },
      { to: '/dashboard/students', label: 'Passengers', icon: Users },
      { to: '/dashboard/admin/fees', label: 'Fee Collection', icon: Wallet },
      notif, settings,
    ],
  },

  exam_cell: {
    id: 'exam_cell', name: 'Exam Cell Officer', short: 'Testing & Grades',
    description: 'Exam registers, Hall Tickets, Seating charts, CGPA and Grade Cards.',
    icon: Award, gradient: 'from-blue-600 to-blue-700', accent: 'bg-blue-600',
    nav: [
      { to: '/dashboard', label: 'Exam Cell Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/dashboard/admin/exams/schedule', label: 'Schedule Exam', icon: ClipboardList },
      { to: '/dashboard/admin/exams/timetable', label: 'Timetable Builder', icon: CalendarCheck },
      { to: '/dashboard/admin/exams/questions', label: 'Question Bank', icon: Database },
      { to: '/dashboard/admin/exams/invigilation', label: 'Invigilation Duty', icon: ClipboardList },
      { to: '/dashboard/admin/exams/hall-tickets', label: 'Hall Ticket Control', icon: Users },
      { to: '/dashboard/admin/exams/results', label: 'Results Publisher', icon: Award },
      { to: '/dashboard/admin/exams/analytics', label: 'Exam Analytics', icon: Activity },
      notif, settings,
    ],
  },

  accounts: {
    id: 'accounts', name: 'Accountant', short: 'Finance & Payroll',
    description: 'Fee collection, vendor logs, GST filing, and staff payroll ledger.',
    icon: Wallet, gradient: 'from-blue-600 to-blue-700', accent: 'bg-blue-600',
    nav: [
      { to: '/dashboard/accountant', label: 'Finance Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/dashboard/admin/fees', label: 'Tuition Fees', icon: Wallet },
      { to: '/dashboard/admin/finance', label: 'Finance Ledger', icon: FileSpreadsheet },
      { to: '/dashboard/admin/hrms', label: 'Staff Payroll', icon: ClipboardList },
      { to: '/dashboard/admin/reports', label: 'Financial Reports', icon: Activity },
      notif, settings,
    ],
  },

  receptionist: {
    id: 'receptionist', name: 'Receptionist', short: 'Front Office',
    description: 'Visitors, enquiries, appointments and gate management.',
    icon: Phone, gradient: 'from-blue-600 to-blue-700', accent: 'bg-blue-600',
    nav: [
      { to: '/dashboard/receptionist', label: 'Front Office', icon: LayoutDashboard, exact: true },
      { to: '/dashboard/receptionist', label: 'Visitor Log', icon: Users },
      { to: '/dashboard/receptionist', label: 'Enquiries', icon: MessageSquare },
      { to: '/dashboard/receptionist', label: 'Appointments', icon: CalendarCheck },
      { to: '/dashboard/receptionist', label: 'Gate Pass', icon: Key },
      notif, settings,
    ],
  },

  alumni_coordinator: {
    id: 'alumni_coordinator', name: 'Alumni Coordinator', short: 'Alumni & Reunions',
    description: 'Manage alumni registrations, events, mentorship, and donations.',
    icon: Heart, gradient: 'from-blue-600 to-blue-700', accent: 'bg-blue-600',
    nav: [...alumniWorkspaceNav],
  },

  alumni: {
    id: 'alumni', name: 'Alumni', short: 'Alumni Workspace',
    description: 'Access job board, networking events, mentorship, and donations.',
    icon: Award, gradient: 'from-blue-600 to-blue-700', accent: 'bg-blue-600',
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
