export const superAdminStats = [
  { label: "Total Colleges/Departments", value: "18", change: "+2.4%" },
  { label: "Total Students", value: "12,480", change: "+8.2%" },
  { label: "Total Faculty", value: "684", change: "+2.1%" },
  { label: "Total Admins", value: "42", change: "+4.8%" },
  { label: "Active Users", value: "8,934", change: "+11.3%" },
  { label: "System Health", value: "99.8%", change: "+0.3%" },
  { label: "Revenue Overview", value: "$1.24M", change: "+12.5%" },
  { label: "Pending Approvals", value: "27", change: "-6.1%" },
];

export const systemAnalytics = [
  { month: "Jan", users: 6200, revenue: 820, tickets: 42 },
  { month: "Feb", users: 6800, revenue: 910, tickets: 38 },
  { month: "Mar", users: 7350, revenue: 1040, tickets: 45 },
  { month: "Apr", users: 7900, revenue: 1120, tickets: 31 },
  { month: "May", users: 8450, revenue: 1240, tickets: 26 },
  { month: "Jun", users: 8934, revenue: 1320, tickets: 22 },
];

export const userActivityData = [
  { day: "Mon", logins: 1240, actions: 4860 },
  { day: "Tue", logins: 1380, actions: 5120 },
  { day: "Wed", logins: 1315, actions: 4980 },
  { day: "Thu", logins: 1490, actions: 5460 },
  { day: "Fri", logins: 1425, actions: 5310 },
  { day: "Sat", logins: 930, actions: 3180 },
];

export const departmentDistribution = [
  { name: "Engineering", value: 4200, color: "#4F46E5" },
  { name: "Business", value: 2800, color: "#9333EA" },
  { name: "Science", value: 3580, color: "#06B6D4" },
  { name: "Arts", value: 1900, color: "#2563EB" },
];

export const superAdminActivities = [
  {
    actor: "System",
    action: "completed nightly backup",
    target: "Institution database",
    time: "12m ago",
    type: "Backup",
  },
  {
    actor: "Dr. Mehra",
    action: "approved role access for",
    target: "Finance Admin",
    time: "42m ago",
    type: "Approval",
  },
  {
    actor: "Security",
    action: "flagged failed login attempts from",
    target: "Unknown device",
    time: "1h ago",
    type: "Security",
  },
  {
    actor: "Automation",
    action: "sent fee reminder batch to",
    target: "342 students",
    time: "2h ago",
    type: "Automation",
  },
];

export const superAdminNotifications = [
  {
    id: "SAN-001",
    title: "Backup completed successfully",
    type: "System",
    time: "10m ago",
    unread: true,
  },
  {
    id: "SAN-002",
    title: "7 admin approvals pending review",
    type: "Approval",
    time: "1h ago",
    unread: true,
  },
  {
    id: "SAN-003",
    title: "Security scan found no critical risks",
    type: "Security",
    time: "3h ago",
    unread: false,
  },
  {
    id: "SAN-004",
    title: "Maintenance window scheduled Friday",
    type: "Maintenance",
    time: "1d ago",
    unread: false,
  },
];

export const adminUsers = [
  {
    id: "ADM001",
    name: "Rohan Verma",
    role: "Academic Admin",
    department: "Administration",
    status: "Active",
    lastLogin: "2026-05-24 09:35 AM",
    permissions: ["Students", "Attendance", "Reports"],
  },
  {
    id: "ADM002",
    name: "Neha Gupta",
    role: "Finance Admin",
    department: "Finance",
    status: "Active",
    lastLogin: "2026-05-24 08:10 AM",
    permissions: ["Fees", "Reports"],
  },
  {
    id: "ADM003",
    name: "Amit Kumar",
    role: "Exam Admin",
    department: "Examination",
    status: "Review",
    lastLogin: "2026-05-23 05:45 PM",
    permissions: ["Exams", "Results"],
  },
  {
    id: "ADM004",
    name: "Priya Sharma",
    role: "HR Admin",
    department: "Human Resources",
    status: "Inactive",
    lastLogin: "2026-05-20 02:20 PM",
    permissions: ["Faculty", "Payroll"],
  },
  {
    id: "ADM005",
    name: "Sanjay Iyer",
    role: "Operations Admin",
    department: "Campus Operations",
    status: "Active",
    lastLogin: "2026-05-24 10:05 AM",
    permissions: ["Hostel", "Transport"],
  },
];

export const departmentsManaged = [
  {
    id: "DEP001",
    name: "Computer Science",
    faculty: 86,
    students: 2140,
    status: "Active",
    head: "Dr. Anjali Mehra",
    budget: "$320K",
  },
  {
    id: "DEP002",
    name: "Electronics",
    faculty: 64,
    students: 1580,
    status: "Active",
    head: "Prof. Rajesh Kumar",
    budget: "$240K",
  },
  {
    id: "DEP003",
    name: "Mechanical",
    faculty: 72,
    students: 1720,
    status: "Active",
    head: "Dr. Vikram Rao",
    budget: "$260K",
  },
  {
    id: "DEP004",
    name: "Business",
    faculty: 48,
    students: 1120,
    status: "Review",
    head: "Prof. Sarah Lin",
    budget: "$180K",
  },
  {
    id: "DEP005",
    name: "Biotechnology",
    faculty: 39,
    students: 860,
    status: "Active",
    head: "Dr. Aisha Khan",
    budget: "$150K",
  },
  {
    id: "DEP006",
    name: "Design",
    faculty: 28,
    students: 620,
    status: "Inactive",
    head: "Prof. Marco Rossi",
    budget: "$95K",
  },
];

export const coursesManaged = [
  {
    code: "CS301",
    name: "Data Structures",
    department: "Computer Science",
    semester: "Semester 3",
    credits: 4,
    status: "Active",
  },
  {
    code: "CS404",
    name: "Artificial Intelligence",
    department: "Computer Science",
    semester: "Semester 6",
    credits: 4,
    status: "Active",
  },
  {
    code: "EC202",
    name: "Digital Signal Processing",
    department: "Electronics",
    semester: "Semester 4",
    credits: 3,
    status: "Active",
  },
  {
    code: "ME401",
    name: "Thermodynamics",
    department: "Mechanical",
    semester: "Semester 5",
    credits: 4,
    status: "Review",
  },
  {
    code: "BA102",
    name: "Marketing Principles",
    department: "Business",
    semester: "Semester 2",
    credits: 3,
    status: "Active",
  },
  {
    code: "BT310",
    name: "Genetics",
    department: "Biotechnology",
    semester: "Semester 5",
    credits: 4,
    status: "Inactive",
  },
];

export const automationCards = [
  {
    name: "Notification Automation",
    trigger: "New circular published",
    enabled: true,
    runs: 184,
    success: 98,
  },
  {
    name: "Attendance Alerts",
    trigger: "Attendance below 75%",
    enabled: true,
    runs: 426,
    success: 94,
  },
  {
    name: "Fee Reminder Controls",
    trigger: "Payment due in 3 days",
    enabled: true,
    runs: 342,
    success: 96,
  },
  {
    name: "Approval Escalation",
    trigger: "Pending beyond 48 hours",
    enabled: false,
    runs: 28,
    success: 89,
  },
];

export const automationLogs = [
  { event: "Fee reminders delivered", result: "342 sent", time: "20m ago", status: "Success" },
  {
    event: "Low attendance alerts queued",
    result: "86 students",
    time: "1h ago",
    status: "Success",
  },
  {
    event: "Admin approval escalation paused",
    result: "Manual review",
    time: "3h ago",
    status: "Review",
  },
  {
    event: "Daily report digest generated",
    result: "12 recipients",
    time: "6h ago",
    status: "Success",
  },
];

export const reportFilters = ["This Month", "This Quarter", "Academic Year", "Custom Range"];

export const securityLogs = [
  {
    id: "LOG001",
    user: "Rohan Verma",
    event: "Successful login",
    ip: "103.24.18.11",
    time: "2026-05-24 10:12 AM",
    status: "Success",
  },
  {
    id: "LOG002",
    user: "Unknown",
    event: "Failed login attempt",
    ip: "185.19.22.90",
    time: "2026-05-24 09:48 AM",
    status: "Failed",
  },
  {
    id: "LOG003",
    user: "Neha Gupta",
    event: "Permission updated",
    ip: "103.24.18.16",
    time: "2026-05-24 09:22 AM",
    status: "Review",
  },
  {
    id: "LOG004",
    user: "System",
    event: "Security scan completed",
    ip: "Internal",
    time: "2026-05-24 08:00 AM",
    status: "Success",
  },
  {
    id: "LOG005",
    user: "Amit Kumar",
    event: "Report exported",
    ip: "103.24.18.19",
    time: "2026-05-23 05:12 PM",
    status: "Success",
  },
];

export const backups = [
  {
    id: "BKP-2026-0524",
    type: "Full Backup",
    size: "8.4 GB",
    date: "2026-05-24 02:00 AM",
    status: "Completed",
    cloud: "Synced",
  },
  {
    id: "BKP-2026-0523",
    type: "Incremental",
    size: "1.2 GB",
    date: "2026-05-23 02:00 AM",
    status: "Completed",
    cloud: "Synced",
  },
  {
    id: "BKP-2026-0522",
    type: "Incremental",
    size: "1.1 GB",
    date: "2026-05-22 02:00 AM",
    status: "Completed",
    cloud: "Synced",
  },
  {
    id: "BKP-2026-0521",
    type: "Full Backup",
    size: "8.1 GB",
    date: "2026-05-21 02:00 AM",
    status: "Review",
    cloud: "Pending",
  },
];

export const settingsGroups = [
  { title: "Email Configuration", items: ["SMTP server", "Sender identity", "Bounce handling"] },
  { title: "Notification Settings", items: ["Email alerts", "SMS alerts", "Dashboard alerts"] },
  { title: "Academic Year Settings", items: ["Term calendar", "Exam windows", "Holidays"] },
  { title: "Backup Settings", items: ["Daily backup", "Cloud sync", "Retention policy"] },
  { title: "Theme Preferences", items: ["Default theme", "Brand logo", "Display density"] },
];
