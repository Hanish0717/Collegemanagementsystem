export const facultyStats = [
  { label: "Total Classes", value: "24", change: "+2" },
  { label: "Today's Attendance", value: "89.2%", change: "+3.1%" },
  { label: "Pending Assignments", value: "12", change: "-4" },
  { label: "Upcoming Classes", value: "4", change: "+1" },
  { label: "Student Performance", value: "85.4%", change: "+2.3%" },
  { label: "Notifications", value: "8", change: "+2" },
  { label: "Leave Status", value: "Available", change: "12 days" },
  { label: "Online Classes", value: "6", change: "+1" },
];

export const weeklyAttendance = [
  { day: "Mon", present: 42, absent: 3, percentage: 93 },
  { day: "Tue", present: 40, absent: 5, percentage: 89 },
  { day: "Wed", present: 44, absent: 1, percentage: 98 },
  { day: "Thu", present: 41, absent: 4, percentage: 91 },
  { day: "Fri", present: 43, absent: 2, percentage: 96 },
];

export const assignmentSubmissions = [
  { week: "Week 1", submitted: 38, pending: 7, late: 2 },
  { week: "Week 2", submitted: 42, pending: 3, late: 1 },
  { week: "Week 3", submitted: 40, pending: 5, late: 3 },
  { week: "Week 4", submitted: 44, pending: 1, late: 0 },
];

export const studentPerformance = [
  { student: "Rahul Sharma", attendance: 92, marks: 88 },
  { student: "Priya Patel", attendance: 95, marks: 91 },
  { student: "Amit Kumar", attendance: 76, marks: 72 },
  { student: "Sneha Reddy", attendance: 89, marks: 85 },
  { student: "Vikram Singh", attendance: 82, marks: 79 },
];

export const facultyActivities = [
  {
    actor: "You",
    action: "marked attendance for",
    target: "Data Structures",
    time: "10m ago",
    type: "Attendance",
  },
  {
    actor: "You",
    action: "uploaded assignment for",
    target: "Algorithms",
    time: "1h ago",
    type: "Assignment",
  },
  {
    actor: "System",
    action: "reminded about",
    target: "Internal marks deadline",
    time: "2h ago",
    type: "Reminder",
  },
  {
    actor: "Student",
    action: "submitted assignment for",
    target: "Data Structures",
    time: "3h ago",
    type: "Submission",
  },
];

export const facultyNotifications = [
  {
    id: "FN-001",
    title: "Internal marks submission deadline tomorrow",
    type: "Alert",
    time: "30m ago",
    unread: true,
  },
  {
    id: "FN-002",
    title: "3 students absent in today's class",
    type: "Attendance",
    time: "2h ago",
    unread: true,
  },
  {
    id: "FN-003",
    title: "New assignment request from department",
    type: "Request",
    time: "4h ago",
    unread: false,
  },
  {
    id: "FN-004",
    title: "Online class scheduled for Friday",
    type: "Class",
    time: "1d ago",
    unread: false,
  },
];

export const attendanceStudents = [
  {
    id: "STU001",
    name: "Rahul Sharma",
    department: "Computer Science",
    status: "Present",
    remarks: "",
  },
  {
    id: "STU002",
    name: "Priya Patel",
    department: "Computer Science",
    status: "Present",
    remarks: "",
  },
  {
    id: "STU003",
    name: "Amit Kumar",
    department: "Computer Science",
    status: "Absent",
    remarks: "Medical leave",
  },
  {
    id: "STU004",
    name: "Sneha Reddy",
    department: "Computer Science",
    status: "Present",
    remarks: "",
  },
  {
    id: "STU005",
    name: "Vikram Singh",
    department: "Computer Science",
    status: "Late",
    remarks: "Arrived 15 min late",
  },
];

export const assignments = [
  {
    id: "ASN001",
    title: "Data Structures Assignment",
    subject: "Data Structures",
    dueDate: "2026-05-30",
    submissions: 38,
    status: "Active",
  },
  {
    id: "ASN002",
    title: "Algorithm Analysis",
    subject: "Algorithms",
    dueDate: "2026-06-05",
    submissions: 42,
    status: "Active",
  },
  {
    id: "ASN003",
    title: "Database Design Project",
    subject: "Database Systems",
    dueDate: "2026-05-25",
    submissions: 40,
    status: "Review",
  },
  {
    id: "ASN004",
    title: "Web Development Task",
    subject: "Web Technologies",
    dueDate: "2026-06-10",
    submissions: 35,
    status: "Active",
  },
];

export const studyMaterials = [
  {
    id: "MAT001",
    title: "Data Structures Notes",
    subject: "Data Structures",
    type: "PDF",
    uploads: "2026-05-20",
    downloads: 156,
  },
  {
    id: "MAT002",
    title: "Algorithm Video Lecture",
    subject: "Algorithms",
    type: "Video",
    uploads: "2026-05-18",
    downloads: 234,
  },
  {
    id: "MAT003",
    title: "Database Schema Examples",
    subject: "Database Systems",
    type: "Document",
    uploads: "2026-05-15",
    downloads: 89,
  },
  {
    id: "MAT004",
    title: "Web Development Tutorial",
    subject: "Web Technologies",
    type: "PDF",
    uploads: "2026-05-22",
    downloads: 112,
  },
];

export const internalMarks = [
  {
    id: "STU001",
    name: "Rahul Sharma",
    subject: "Data Structures",
    marks: 88,
    grade: "A",
    status: "Submitted",
  },
  {
    id: "STU002",
    name: "Priya Patel",
    subject: "Data Structures",
    marks: 91,
    grade: "A+",
    status: "Submitted",
  },
  {
    id: "STU003",
    name: "Amit Kumar",
    subject: "Data Structures",
    marks: 72,
    grade: "B",
    status: "Pending",
  },
  {
    id: "STU004",
    name: "Sneha Reddy",
    subject: "Data Structures",
    marks: 85,
    grade: "A",
    status: "Submitted",
  },
  {
    id: "STU005",
    name: "Vikram Singh",
    subject: "Data Structures",
    marks: 79,
    grade: "B+",
    status: "Pending",
  },
];

export const onlineClasses = [
  {
    id: "CLS001",
    title: "Data Structures Live Session",
    subject: "Data Structures",
    date: "2026-05-26",
    time: "10:00 AM",
    link: "zoom.us/j/123456",
    status: "Scheduled",
  },
  {
    id: "CLS002",
    title: "Algorithm Discussion",
    subject: "Algorithms",
    date: "2026-05-28",
    time: "02:00 PM",
    link: "meet.google.com/abc",
    status: "Scheduled",
  },
  {
    id: "CLS003",
    title: "Database Q&A",
    subject: "Database Systems",
    date: "2026-05-30",
    time: "11:00 AM",
    link: "teams.microsoft.com/xyz",
    status: "Scheduled",
  },
];

export const performanceData = [
  { student: "Rahul Sharma", attendance: 92, assignments: 88, quizzes: 85, overall: 88 },
  { student: "Priya Patel", attendance: 95, assignments: 91, quizzes: 89, overall: 91 },
  { student: "Amit Kumar", attendance: 76, assignments: 72, quizzes: 68, overall: 72 },
  { student: "Sneha Reddy", attendance: 89, assignments: 85, quizzes: 82, overall: 85 },
  { student: "Vikram Singh", attendance: 82, assignments: 79, quizzes: 76, overall: 79 },
];

export const communications = [
  {
    id: "COM001",
    student: "Rahul Sharma",
    subject: "Assignment doubt",
    message: "Need help with question 3",
    time: "2h ago",
    unread: true,
  },
  {
    id: "COM002",
    student: "Priya Patel",
    subject: "Project update",
    message: "Submitted project files",
    time: "5h ago",
    unread: false,
  },
  {
    id: "COM003",
    student: "Amit Kumar",
    subject: "Leave request",
    message: "Medical leave for 2 days",
    time: "1d ago",
    unread: false,
  },
];

export const leaveApplications = [
  {
    id: "LV001",
    type: "Sick Leave",
    from: "2026-05-20",
    to: "2026-05-21",
    days: 2,
    status: "Approved",
  },
  {
    id: "LV002",
    type: "Casual Leave",
    from: "2026-06-10",
    to: "2026-06-10",
    days: 1,
    status: "Pending",
  },
  {
    id: "LV003",
    type: "Earned Leave",
    from: "2026-07-15",
    to: "2026-07-20",
    days: 5,
    status: "Pending",
  },
];

export const facultyNotificationItems = [
  { title: "Assignment submission reminder", type: "Assignment", priority: "High", time: "1h ago" },
  { title: "Class schedule change", type: "Schedule", priority: "Medium", time: "3h ago" },
  { title: "Department meeting tomorrow", type: "Meeting", priority: "High", time: "5h ago" },
  { title: "Student performance review", type: "Review", priority: "Low", time: "1d ago" },
];
