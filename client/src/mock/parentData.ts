export const parentStats = [
  { label: "Child Attendance", value: "87.3%", change: "+2.1%" },
  { label: "Average Marks", value: "85.4%", change: "+1.8%" },
  { label: "Pending Fees", value: "$1,250", change: "Due" },
  { label: "Upcoming Exams", value: "2", change: "This Week" },
  { label: "Notifications", value: "5", change: "Unread" },
  { label: "Leave Status", value: "Approved", change: "1 Request" },
];

export const attendanceHistory = [
  { month: "Jan", present: 22, absent: 2, percentage: 92 },
  { month: "Feb", present: 20, absent: 4, percentage: 83 },
  { month: "Mar", present: 21, absent: 3, percentage: 88 },
  { month: "Apr", present: 23, absent: 1, percentage: 96 },
  { month: "May", present: 22, absent: 2, percentage: 92 },
];

export const marksPerformance = [
  { month: "Jan", marks: 82 },
  { month: "Feb", marks: 84 },
  { month: "Mar", marks: 83 },
  { month: "Apr", marks: 87 },
  { month: "May", marks: 85 },
];

export const parentActivities = [
  { actor: "School", action: "sent attendance report for", target: "May 2026", time: "2h ago", type: "Attendance" },
  { actor: "Teacher", action: "graded assignment in", target: "Data Structures", time: "5h ago", type: "Grade" },
  { actor: "System", action: "reminded about", target: "Fee payment due date", time: "1d ago", type: "Reminder" },
  { actor: "Admin", action: "approved leave request for", target: "May 25-26", time: "2d ago", type: "Leave" },
];

export const parentNotifications = [
  { id: "PN-001", title: "Mid-term exam schedule released", type: "Exam", time: "1h ago", unread: true },
  { id: "PN-002", title: "Fee payment deadline approaching", type: "Alert", time: "4h ago", unread: true },
  { id: "PN-003", title: "Parent-teacher meeting scheduled", type: "Meeting", time: "1d ago", unread: false },
  { id: "PN-004", title: "School annual day invitation", type: "Event", time: "2d ago", unread: false },
];

export const subjectAttendance = [
  { subject: "Data Structures", total: 24, attended: 22, percentage: 92, status: "Good" },
  { subject: "Algorithms", total: 22, attended: 19, percentage: 86, status: "Good" },
  { subject: "Database Systems", total: 20, attended: 16, percentage: 80, status: "Average" },
  { subject: "Web Technologies", total: 18, attended: 17, percentage: 94, status: "Excellent" },
  { subject: "Operating Systems", total: 20, attended: 18, percentage: 90, status: "Good" },
];

export const subjectMarks = [
  { subject: "Data Structures", internal: 88, external: 90, total: 89, grade: "A", status: "Excellent" },
  { subject: "Algorithms", internal: 85, external: 88, total: 86, grade: "A", status: "Excellent" },
  { subject: "Database Systems", internal: 82, external: 85, total: 83, grade: "B+", status: "Good" },
  { subject: "Web Technologies", internal: 90, external: 92, total: 91, grade: "A+", status: "Excellent" },
  { subject: "Operating Systems", internal: 84, external: 86, total: 85, grade: "A", status: "Excellent" },
];

export const feeRecords = [
  { feeType: "Tuition Fee", amount: "$2,500", dueDate: "2026-06-01", status: "Pending", receipt: "-" },
  { feeType: "Hostel Fee", amount: "$800", dueDate: "2026-05-25", status: "Overdue", receipt: "-" },
  { feeType: "Lab Fee", amount: "$500", dueDate: "2026-06-15", status: "Pending", receipt: "-" },
  { feeType: "Library Fee", amount: "$200", dueDate: "2026-05-30", status: "Pending", receipt: "-" },
  { feeType: "Transport Fee", amount: "$300", dueDate: "2026-05-20", status: "Paid", receipt: "REC-001" },
];

export const parentNotificationItems = [
  { title: "Exam schedule for mid-term", type: "Exam", priority: "High", time: "1h ago" },
  { title: "Fee payment reminder", type: "Alert", priority: "High", time: "4h ago" },
  { title: "Parent-teacher meeting", type: "Meeting", priority: "Medium", time: "1d ago" },
  { title: "School annual day", type: "Event", priority: "Low", time: "2d ago" },
];

export const leaveHistory = [
  { date: "2026-05-25", reason: "Medical appointment", appliedOn: "2026-05-20", status: "Approved", remarks: "Approved with medical certificate" },
  { date: "2026-06-10", reason: "Family function", appliedOn: "2026-06-05", status: "Pending", remarks: "Awaiting approval" },
  { date: "2026-07-15", reason: "Vacation", appliedOn: "2026-07-10", status: "Pending", remarks: "Awaiting approval" },
];

export const performanceData = [
  { semester: "Sem 1", gpa: 3.4, attendance: 88, rank: 15 },
  { semester: "Sem 2", gpa: 3.6, attendance: 90, rank: 12 },
  { semester: "Sem 3", gpa: 3.5, attendance: 85, rank: 14 },
  { semester: "Sem 4", gpa: 3.7, attendance: 92, rank: 10 },
  { semester: "Sem 5", gpa: 3.8, attendance: 87, rank: 8 },
];

export const communications = [
  { id: "COM001", teacher: "Dr. Rajesh Kumar", subject: "Data Structures", message: "Student performing well in recent tests", time: "2h ago", unread: true },
  { id: "COM002", teacher: "Prof. Emily Chen", subject: "Algorithms", message: "Assignment submission reminder", time: "5h ago", unread: false },
  { id: "COM003", teacher: "Dr. Marco Rossi", subject: "Database Systems", message: "Project update discussion", time: "1d ago", unread: false },
];
