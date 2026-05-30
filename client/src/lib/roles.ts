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
} from "lucide-react";

export type RoleId =
  | "super_admin"
  | "admin"
  | "faculty"
  | "student"
  | "parent"
  | "librarian"
  | "placement"
  | "warden"
  | "transport";

export type NavItem = {
  to: string;
  label: string;
  icon: any;
  exact?: boolean;
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
const settings: NavItem = { to: "/dashboard/settings", label: "Settings", icon: Settings };
const notif: NavItem = { to: "/dashboard/notifications", label: "Notifications", icon: Bell };

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
        to: "/dashboard/super-admin",
        label: "Super Admin Dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      { to: "/dashboard/super-admin/admins", label: "Admin Management", icon: Users },
      { to: "/dashboard/super-admin/departments", label: "Departments", icon: Building2 },
      { to: "/dashboard/super-admin/courses", label: "Courses", icon: BookOpen },
      { to: "/dashboard/super-admin/configuration", label: "System Configuration", icon: Settings },
      { to: "/dashboard/super-admin/automation", label: "AI Automation Control", icon: Sparkles },
      { to: "/dashboard/super-admin/reports", label: "Global Reports", icon: Activity },
      { to: "/dashboard/super-admin/security", label: "Security & Logs", icon: Shield },
      { to: "/dashboard/super-admin/backups", label: "Backup Management", icon: Database },
      { to: "/dashboard/super-admin/notifications", label: "Notifications", icon: Bell },
      { to: "/dashboard/super-admin/settings", label: "Settings", icon: Settings },
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
      { to: "/dashboard/admin/students", label: "Students", icon: Users },
      { to: "/dashboard/admin/faculty", label: "Faculty", icon: GraduationCap },
      { to: "/dashboard/admin/assignments", label: "Faculty Assignments", icon: ClipboardList },
      { to: "/dashboard/admin/attendance", label: "Attendance", icon: CalendarCheck },
      { to: "/dashboard/admin/exams", label: "Exams", icon: BookOpen },
      { to: "/dashboard/admin/fees", label: "Fees", icon: Wallet },
      { to: "/dashboard/admin/events", label: "Events", icon: Sparkles },
      notif,
      { to: "/dashboard/admin/settings", label: "Settings", icon: Settings },
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
      { to: "/dashboard/faculty/attendance", label: "Attendance", icon: CalendarCheck },
      { to: "/dashboard/faculty/assignments", label: "Assignments", icon: ClipboardList },
      { to: "/dashboard/faculty/materials", label: "Materials", icon: BookOpen },
      { to: "/dashboard/faculty/students", label: "Students", icon: Users },
      { to: "/dashboard/faculty/notifications", label: "Notifications", icon: Bell },
      { to: "/dashboard/faculty/settings", label: "Settings", icon: Settings },
    ],
  },
  student: {
    id: "student",
    name: "Student",
    short: "Your academic hub",
    description: "GPA, attendance, fees, assignments and placements.",
    icon: Users,
    gradient: "from-cyan-500 to-indigo-600",
    accent: "bg-indigo-500",
    nav: [
      base,
      { to: "/dashboard/student/attendance", label: "Attendance", icon: CalendarCheck },
      { to: "/dashboard/student/results", label: "Results", icon: BookOpen },
      { to: "/dashboard/student/fees", label: "Fees", icon: Wallet },
      { to: "/dashboard/student/materials", label: "Library", icon: Library },
      { to: "/dashboard/student/events", label: "Events", icon: Sparkles },
      notif,
      settings,
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
      { to: "/dashboard/parent/attendance", label: "Attendance", icon: CalendarCheck },
      { to: "/dashboard/parent/marks", label: "Performance", icon: Activity },
      { to: "/dashboard/parent/fees", label: "Fees", icon: Wallet },
      { to: "/dashboard/parent/notifications", label: "Notifications", icon: Bell },
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
      { to: "/dashboard/librarian", label: "Library Overview", icon: Library, exact: true },
      { to: "/dashboard/librarian/books", label: "Book Management", icon: BookOpen },
      { to: "/dashboard/librarian/issue", label: "Issue Books", icon: ClipboardList },
      { to: "/dashboard/librarian/return", label: "Return Books", icon: Activity },
      { to: "/dashboard/librarian/members", label: "Members", icon: Users },
      { to: "/dashboard/librarian/digital", label: "Digital Library", icon: FileText },
      { to: "/dashboard/librarian/fines", label: "Fines", icon: Wallet },
      { to: "/dashboard/librarian/reports", label: "Reports", icon: Activity },
      { to: "/dashboard/librarian/notifications", label: "Notifications", icon: Bell },
      { to: "/dashboard/librarian/settings", label: "Settings", icon: Settings },
    ],
  },
  placement: {
    id: "placement",
    name: "Placement Officer",
    short: "Hiring & companies",
    description: "Companies, interviews, eligibility and resumes.",
    icon: FileText,
    gradient: "from-purple-600 to-cyan-500",
    accent: "bg-purple-500",
    nav: [
      {
        to: "/dashboard/placement",
        label: "Placement Overview",
        icon: LayoutDashboard,
        exact: true,
      },
      { to: "/dashboard/placement/companies", label: "Companies", icon: Briefcase },
      { to: "/dashboard/placement/drives", label: "Drives", icon: Sparkles },
      { to: "/dashboard/placement/eligibility", label: "Eligibility", icon: ClipboardList },
      { to: "/dashboard/placement/applications", label: "Applications", icon: FileText },
      { to: "/dashboard/placement/resume", label: "Resume Management", icon: BookOpen },
      { to: "/dashboard/placement/interviews", label: "Interview Scheduling", icon: CalendarCheck },
      { to: "/dashboard/placement/offers", label: "Offers", icon: Wallet },
      { to: "/dashboard/placement/training", label: "Training & Assessments", icon: Users },
      { to: "/dashboard/placement/reports", label: "Reports", icon: Activity },
      { to: "/dashboard/placement/notifications", label: "Notifications", icon: Bell },
      { to: "/dashboard/placement/settings", label: "Settings", icon: Settings },
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
      { to: "/dashboard/hostel", label: "Hostel", icon: Building2 },
      { to: "/dashboard/students", label: "Residents", icon: Users },
      { to: "/dashboard/fees", label: "Fees", icon: Wallet },
      notif,
      { to: "/dashboard/hostel/settings", label: "Settings", icon: Settings },
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
      { to: "/dashboard/transport", label: "Transport", icon: Bus },
      { to: "/dashboard/students", label: "Passengers", icon: Users },
      notif,
      settings,
    ],
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
