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
  HeartHandshake,
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
  User,
  Fingerprint,
  Video,
  CreditCard
} from "lucide-react";

export type RoleId =
  | "super_admin"
  | "admin"
  | "faculty"
  | "lms"
  | "student"
  | "parent"
  | "librarian"
  | "placement"
  | "warden"
  | "transport"
  | "principal"
  | "dean"
  | "hod"
  | "exam_cell"
  | "accounts"
  | "alumni_coordinator"
  | "alumni";

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

const base: NavItem = { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true };
const settings: NavItem = { to: "/settings", label: "Settings", icon: Settings };
const notif: NavItem = { to: "/notifications", label: "Notifications", icon: Bell };

// ── Full grouped alumni workspace nav (ERPNext-style) ──
const alumniWorkspaceNav: NavItem[] = [
  { to: "/admin/alumni", label: "Dashboard", icon: LayoutDashboard, exact: true },

  // Alumni Management group
  {
    to: "/admin/alumni/directory",
    label: "Alumni Management",
    icon: Users,
    children: [
      { to: "/admin/alumni/directory",    label: "Alumni Directory",    icon: Search },
      { to: "/admin/alumni/registration", label: "Alumni Registration", icon: Plus },
      { to: "/admin/alumni/profile",      label: "Alumni Profiles",     icon: Award },
      { to: "/admin/alumni/verification", label: "Alumni Verification", icon: ShieldCheck },
    ],
  },

  // Career group
  {
    to: "/admin/alumni/jobs",
    label: "Career",
    icon: Briefcase,
    children: [
      { to: "/admin/alumni/jobs",        label: "Job Portal",              icon: Briefcase },
      { to: "/admin/alumni/internships", label: "Internship Portal", icon: BookOpen },
      { to: "/admin/alumni/placement",   label: "Placement Portal",        icon: Star },
    ],
  },

  // Community group
  {
    to: "/admin/alumni/mentorship",
    label: "Community",
    icon: Heart,
    children: [
      { to: "/admin/alumni/mentorship",  label: "Mentorship",          icon: Star },
      { to: "/admin/alumni/networking",  label: "Professional Network", icon: Users },
      { to: "/admin/alumni/messaging",   label: "Messages",             icon: MessageSquare },
    ],
  },

  // Events group
  {
    to: "/admin/alumni/events",
    label: "Events",
    icon: CalendarCheck,
    children: [
      { to: "/admin/alumni/events",      label: "Events & Reunions",    icon: CalendarCheck },
      { to: "/admin/alumni/events?section=registration", label: "Event Registration", icon: Plus },
      { to: "/admin/alumni/gallery",     label: "Event Gallery",        icon: Image },
    ],
  },

  // Contributions group
  {
    to: "/admin/alumni/donations",
    label: "Contributions",
    icon: DollarSign,
    children: [
      { to: "/admin/alumni/donations", label: "Donations",       icon: DollarSign },
      { to: "/admin/alumni/stories",   label: "Success Stories", icon: BookOpen },
    ],
  },

  // Communication group
  {
    to: "/admin/alumni/announcements",
    label: "Communication",
    icon: Send,
    children: [
      { to: "/admin/alumni/announcements", label: "Announcements", icon: Send },
      { to: "/admin/alumni/notifications", label: "Notifications",  icon: Bell },
    ],
  },

  { to: "/admin/alumni/reports",    label: "Reports & Analytics", icon: Activity },
  { to: "/admin/alumni/settings",   label: "Settings",            icon: Settings },
  { to: "/admin/alumni/help",        label: "Help",                icon: HelpCircle },
];

export const ROLES: Record<RoleId, Role> = {
  super_admin: {
    id: "super_admin",
    name: "Super Admin",
    short: "Full system control",
    description: "Manage admins, automations, global analytics & security.",
    icon: Shield,
    gradient: "from-slate-900 to-blue-600",
    accent: "bg-blue-500",
    nav: [
      {
        to: "/super-admin",
        label: "Super Admin Dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      { to: "/super-admin/users", label: "User Management", icon: Users },
      { to: "/super-admin/admins", label: "Admin Management", icon: Users },
      { to: "/super-admin/departments", label: "Departments", icon: Building2 },
      { to: "/super-admin/courses", label: "Courses", icon: BookOpen },
      { to: "/admin/admissions", label: "Admissions", icon: UserPlus },
      { to: "/admin/finance", label: "Finance & Accounts", icon: Wallet },
      { to: "/admin/hrms", label: "HRMS / Payroll", icon: ClipboardList },
      { to: "/admin/inventory", label: "Inventory Management", icon: Database },
      { to: "/admin/accreditation", label: "Accreditation (NAAC)", icon: Award },
      { to: "/admin/grievance", label: "Grievances Cell", icon: ShieldAlert },
      { to: "/super-admin/configuration", label: "System Configuration", icon: Settings },
      { to: "/super-admin/automation", label: "AI Automation Control", icon: Sparkles },
      { to: "/super-admin/reports", label: "Global Reports", icon: Activity },
      { to: "/super-admin/security", label: "Security & Logs", icon: Shield },
      { to: "/super-admin/backups", label: "Backup Management", icon: Database },
      { to: "/super-admin/notifications", label: "Notifications", icon: Bell },
      { to: "/super-admin/settings", label: "Settings", icon: Settings },
    ],
  },
  admin: {
    id: "admin",
    name: "Admin",
    short: "Operations & approvals",
    description: "Run students, faculty, timetables, fees and reports.",
    icon: Briefcase,
    gradient: "from-blue-600 to-cyan-500",
    accent: "bg-cyan-500",
    nav: [
      base,
      { to: "/admin/students", label: "Students Roster", icon: Users },
      { to: "/admin/faculty", label: "Faculty Roster", icon: GraduationCap, exact: true },
      { to: "/admin/admissions", label: "Admission Desk", icon: UserPlus },
      { to: "/admin/assignments", label: "Faculty Assignments", icon: ClipboardList },
      { to: "/admin/timetable", label: "Class Timetable", icon: CalendarCheck },
      { to: "/admin/attendance", label: "Attendance Control", icon: CalendarCheck },
      { to: "/admin/faculty/attendance", label: "Faculty Attendance", icon: CalendarCheck },
      { to: "/admin/exams/analytics", label: "Exam Analytics", icon: Activity },
      { to: "/admin/lms", label: "LMS Curriculum", icon: FileText },
      { to: "/admin/fees", label: "Fee Collection", icon: Wallet },
      { to: "/admin/finance", label: "Finance & GST", icon: FileSpreadsheet },
      { to: "/admin/hrms", label: "HRMS & Payroll", icon: ClipboardList },
      { to: "/admin/inventory", label: "Inventory Stock", icon: Database },
      { to: "/admin/accreditation", label: "NAAC/NBA Portal", icon: Award },
      { to: "/admin/communication", label: "Communication Hub", icon: MessageSquare },
      { to: "/admin/grievance", label: "Grievances Cell", icon: ShieldAlert },
      { to: "/admin/events", label: "Campus Events", icon: Sparkles },
      { to: "/admin/research", label: "Research (R&D)", icon: Sparkles },
      { to: "/admin/clubs", label: "Student Clubs", icon: Users },
      { to: "/admin/health", label: "Health & Wellness", icon: Heart },
      { to: "/admin/notifications", label: "Notifications", icon: Bell },
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
  faculty: {
    id: "faculty",
    name: "Faculty",
    short: "Teaching workspace",
    description: "Mark attendance, post materials, track students.",
    icon: GraduationCap,
    gradient: "from-violet-600 to-blue-600",
    accent: "bg-violet-500",
    nav: [
      base,
      { to: "/faculty/attendance", label: "Attendance", icon: CalendarCheck },
      { to: "/faculty/marks", label: "Enter Marks", icon: Award },
      { to: "/faculty/classes", label: "Class Management", icon: CalendarCheck },
      { to: "/faculty/materials", label: "Materials", icon: BookOpen },
      { to: "/faculty/evaluations", label: "Evaluations", icon: FileSpreadsheet },
      { to: "/faculty/leave", label: "Leave Requests", icon: ClipboardList },
      { to: "/faculty/payroll", label: "My Payroll", icon: Wallet },
      { to: "/faculty/performance", label: "Performance", icon: Activity },
      { to: "/faculty/research", label: "Research", icon: FlaskConical },
      { to: "/faculty/publications", label: "Publications", icon: FileText },
      { to: "/admin/lms", label: "LMS Portal", icon: FileText },
      { to: "/faculty/students", label: "Counselling", icon: HeartHandshake },
      { to: "/faculty/communication", label: "Message Hub", icon: MessageSquare },
      { to: "/faculty/notifications", label: "Notifications", icon: Bell },
      { to: "/faculty/settings", label: "Settings", icon: Settings },
    ],
  },
  lms: {
    id: "lms",
    name: "LMS Coordinator",
    short: "Digital learning hub",
    description: "Manage notes, video lectures, quizzes, assignments, forum, and online classes.",
    icon: BookOpen,
    gradient: "from-emerald-500 to-teal-600",
    accent: "bg-emerald-500",
    nav: [
      { to: "/admin/lms", label: "LMS Home", icon: LayoutDashboard, exact: true },
      { to: "/faculty/materials", label: "Study Materials", icon: FileText },
      { to: "/faculty/attendance", label: "Attendance", icon: CalendarCheck },
      { to: "/faculty/students", label: "Counselling", icon: HeartHandshake },
      { to: "/faculty/communication", label: "Message Hub", icon: MessageSquare },
      notif,
      settings,
    ],
  },
  student: {
    id: "student",
    name: "Student",
    short: "Your academic portal",
    description: "Notice board, profile, LMS, timetable, course registration, exam tickets, fees & results.",
    icon: Users,
    gradient: "from-cyan-500 to-indigo-600",
    accent: "bg-indigo-500",
    nav: [
      { to: "/student/notices", label: "Digital Notice Board", icon: Bell },
      { to: "/student/profile", label: "My Profile", icon: User },
      { to: "/student/lms", label: "Learning Management", icon: BookOpen },
      { to: "/student/assignments", label: "Integrated Assignments", icon: FileText },
      { to: "/student/timetable", label: "Timetable", icon: Clock },
      { to: "/student/complaints", label: "Feedbacks", icon: MessageSquare },
      { to: "/student/services", label: "Student Services", icon: ClipboardList },
      { to: "/student/course-registration", label: "Course Registrations", icon: GraduationCap },
      { to: "/student/hall-ticket", label: "Exam Hall tickets", icon: Award },
      { to: "/student/leave", label: "Hostel", icon: Building2 },
      { to: "/student/id-card", label: "My ID Card", icon: CreditCard },
      { to: "/student/events", label: "Discussion Forum", icon: Users },
      { to: "/student/fees", label: "Payments", icon: Wallet },
      { to: "/student/results", label: "Exam Results", icon: Activity },
      { to: "/student/notifications", label: "Notifications", icon: Bell },
      { to: "/student/webinars", label: "Webinars", icon: Video },
    ],
  },
  parent: {
    id: "parent",
    name: "Parent",
    short: "Track your child",
    description: "Performance, attendance and fee status at a glance.",
    icon: Heart,
    gradient: "from-emerald-500 to-cyan-500",
    accent: "bg-emerald-500",
    nav: [
      base,
      { to: "/parent/attendance", label: "Attendance", icon: CalendarCheck },
      { to: "/parent/marks", label: "Performance", icon: Activity },
      { to: "/parent/fees", label: "Fees Status", icon: Wallet },
      { to: "/admin/grievance", label: "Report Grievance", icon: ShieldAlert },
      { to: "/parent/notifications", label: "Notifications", icon: Bell },
      settings,
    ],
  },
  librarian: {
    id: "librarian",
    name: "Librarian",
    short: "Library operations",
    description: "Books, fines, digital catalog and reports.",
    icon: Library,
    gradient: "from-amber-500 to-blue-600",
    accent: "bg-amber-500",
    nav: [
      { to: "/librarian", label: "Library Overview", icon: Library, exact: true },
      { to: "/librarian/books", label: "Book Management", icon: BookOpen },
      { to: "/librarian/issue", label: "Issue Books", icon: ClipboardList },
      { to: "/librarian/return", label: "Return Books", icon: Activity },
      { to: "/librarian/id-cards", label: "ID Card Generation", icon: CreditCard },
      { to: "/librarian/members", label: "Members", icon: Users },
      { to: "/librarian/digital", label: "Digital Library", icon: FileText },
      { to: "/librarian/fines", label: "Fines", icon: Wallet },
      { to: "/librarian/reports", label: "Reports", icon: Activity },
      { to: "/librarian/notifications", label: "Notifications", icon: Bell },
      { to: "/librarian/settings", label: "Settings", icon: Settings },
    ],
  },
  placement: {
    id: "placement",
    name: "Placement Officer",
    short: "Hiring & companies",
    description: "Companies, drives, eligibility, applications, interviews, offers, training and reports.",
    icon: FileText,
    gradient: "from-purple-600 to-cyan-500",
    accent: "bg-purple-500",
    nav: [
      {
        to: "/placement",
        label: "Placement Overview",
        icon: LayoutDashboard,
        exact: true,
      },
      { to: "/placement/companies", label: "Companies", icon: Briefcase },
      { to: "/placement/drives", label: "Drives", icon: Sparkles },
      { to: "/placement/eligibility", label: "Eligibility", icon: ClipboardList },
      { to: "/placement/applications", label: "Applications", icon: FileText },
      { to: "/placement/interviews", label: "Interview Scheduling", icon: CalendarCheck },
    ],
  },
  warden: {
    id: "warden",
    name: "Hostel Warden",
    short: "Hostel management",
    description: "Rooms, visitors, complaints and hostel fees.",
    icon: Building2,
    gradient: "from-teal-500 to-blue-600",
    accent: "bg-teal-500",
    nav: [
      base,
      {
        to: "/hostel",
        label: "Hostel",
        icon: Building2,
        children: [
          { to: "/hostel/attendance", label: "Attendance", icon: CalendarCheck },
          { to: "/hostel/visitors", label: "Visitors", icon: ClipboardList },
          { to: "/hostel/complaints", label: "Complaints", icon: FileText },
          { to: "/hostel/mess/menus", label: "Mess Menus", icon: FileText },
          { to: "/hostel/mess/fees", label: "Mess Fees", icon: Wallet },
        ],
      },
      { to: "/hostel/students", label: "Residents", icon: Users },
      { to: "/hostel/fees", label: "Fees", icon: Wallet },
      notif,
      { to: "/hostel/settings", label: "Settings", icon: Settings },
    ],
  },
  transport: {
    id: "transport",
    name: "Transport Manager",
    short: "Routes & vehicles",
    description: "Buses, routes, drivers and live tracking.",
    icon: Bus,
    gradient: "from-orange-500 to-blue-600",
    accent: "bg-orange-500",
    nav: [
      base,
      { to: "/transport", label: "Transport", icon: Bus },
      { to: "/students", label: "Passengers", icon: Users },
      { to: "/admin/fees", label: "Fee Collection", icon: Wallet },
      notif,
      settings,
    ],
  },
  principal: {
    id: "principal",
    name: "Principal",
    short: "Executive Board",
    description: "Institution-wide reports, budget approvals, and NAAC accreditation.",
    icon: Shield,
    gradient: "from-amber-600 to-rose-600",
    accent: "bg-rose-500",
    nav: [
      base,
      { to: "/admin/admissions", label: "Admissions Desk", icon: UserPlus },
      { to: "/admin/finance", label: "Finance & Accounts", icon: FileSpreadsheet },
      { to: "/admin/accreditation", label: "NAAC/NBA Dashboard", icon: Award },
      { to: "/admin/grievance", label: "Grievances Desk", icon: ShieldAlert },
      { to: "/admin/communication", label: "Communication Center", icon: MessageSquare },
      { to: "/admin/reports", label: "Academic Audit Reports", icon: Activity },
      settings,
    ],
  },
  dean: {
    id: "dean",
    name: "Dean Academics",
    short: "Curriculum & Exams",
    description: "Semester schedules, R20/R23 curricula, and Exam Cell liaison.",
    icon: GraduationCap,
    gradient: "from-violet-700 to-indigo-800",
    accent: "bg-indigo-600",
    nav: [
      base,
      { to: "/admin/timetable", label: "Academic Timetable", icon: CalendarCheck },
      { to: "/admin/exams/schedule", label: "Exams Portal", icon: BookOpen },
      { to: "/admin/lms", label: "LMS Curriculum", icon: FileText },
      { to: "/admin/academics", label: "Academic Management", icon: BookOpen },
      { to: "/admin/reports", label: "Grade Audit Reports", icon: Activity },
      settings,
    ],
  },
  hod: {
    id: "hod",
    name: "HOD Workspace",
    short: "Department Head",
    description: "Department workloads, staff logs, and student performance monitoring.",
    icon: Building2,
    gradient: "from-emerald-600 to-teal-700",
    accent: "bg-teal-600",
    nav: [
      { to: "/hod/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { to: "/hod/students", label: "Dept Students", icon: Users },
      { to: "/hod/faculty", label: "Faculty Workloads", icon: GraduationCap },
      { to: "/hod/academics", label: "Academic Management", icon: BookOpen },
      { to: "/hod/attendance", label: "Attendance Audit", icon: CalendarCheck },
      { to: "/hod/examinations", label: "Dept Exams & Marks", icon: Award },
      { to: "/hod/timetable", label: "Dept Timetable", icon: Clock },
      { to: "/hod/mentoring", label: "Mentoring", icon: Heart },
      { to: "/hod/research", label: "Research & Grants", icon: FlaskConical },
      { to: "/hod/resources", label: "Resources & Labs", icon: Database },
      { to: "/hod/approvals", label: "Approvals Workbench", icon: ClipboardList },
      { to: "/hod/events", label: "Events & FDPs", icon: Sparkles },
      { to: "/hod/reports", label: "Reports & Analytics", icon: Activity },
      { to: "/hod/communication", label: "Communication", icon: MessageSquare },
      { to: "/hod/documents", label: "BOS Documents", icon: FileText },
      { to: "/hod/notifications", label: "Notifications", icon: Bell },
      { to: "/hod/settings", label: "Settings", icon: Settings },
    ],
  },
  exam_cell: {
    id: "exam_cell",
    name: "Exam Cell Officer",
    short: "Testing & Grades",
    description: "Exam registers, Hall Tickets, Seating charts, CGPA and Grade Cards.",
    icon: Award,
    gradient: "from-rose-600 to-violet-600",
    accent: "bg-rose-500",
    nav: [
      base,
      { to: "/admin/exams/schedule", label: "Schedule Exam", icon: ClipboardList },
      { to: "/admin/exams/course-registration", label: "Course & Exam Enroll", icon: BookOpen },
      { to: "/admin/exams/timetable", label: "Timetable Builder", icon: CalendarCheck },
      { to: "/admin/exams/questions", label: "Question Bank", icon: Database },
      { to: "/admin/exams/hall-tickets", label: "Hall Ticket Control", icon: Users },
      { to: "/admin/exams/results", label: "Results Publisher", icon: Award },
      { to: "/admin/exams/corrections", label: "Correction Requests", icon: ClipboardList },
      { to: "/admin/exams/supplementary", label: "Supplementary Exams", icon: Clock },
      { to: "/admin/exams/analytics", label: "Exam Analytics", icon: Activity },
      notif,
      settings,
    ],
  },
  accounts: {
    id: "accounts",
    name: "Accounts Manager",
    short: "Finance & Payroll",
    description: "Fee structure collection, vendor logs, GST filing, and staff payroll ledger.",
    icon: Wallet,
    gradient: "from-cyan-600 to-blue-700",
    accent: "bg-blue-600",
    nav: [
      base,
      { to: "/admin/fees", label: "Tuition Fees", icon: Wallet },
      { to: "/admin/finance", label: "Finance Ledger", icon: FileSpreadsheet },
      { to: "/admin/hrms", label: "HRMS Staff Payroll", icon: ClipboardList },
      settings,
    ],
  },
  alumni_coordinator: {
    id: "alumni_coordinator",
    name: "Alumni Coordinator",
    short: "Alumni & Reunions",
    description: "Manage alumni registrations, events, mentorship, and donations.",
    icon: Heart,
    gradient: "from-pink-500 to-rose-600",
    accent: "bg-rose-500",
    nav: [...alumniWorkspaceNav],
  },
  alumni: {
    id: "alumni",
    name: "Alumni",
    short: "Alumni Workspace",
    description: "Access job board, networking events, mentorship, and donations.",
    icon: Award,
    gradient: "from-indigo-600 to-pink-500",
    accent: "bg-indigo-500",
    nav: [...alumniWorkspaceNav],
  },
};

export const ROLE_LIST = Object.values(ROLES);

const KEY = "campusly.role";

export function setActiveRole(id: RoleId) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, id);
}
export function getActiveRole(): Role {
  if (typeof window === "undefined") return ROLES.super_admin;
  const id = (localStorage.getItem(KEY) as RoleId) || "super_admin";
  return ROLES[id] ?? ROLES.super_admin;
}
