export const studentStats = [
  { label: "Overall Attendance", value: "87.3%", change: "+2.1%" },
  { label: "Current GPA", value: "3.7", change: "+0.2" },
  { label: "Pending Assignments", value: "3", change: "-1" },
  { label: "Upcoming Classes", value: "4", change: "Today" },
  { label: "Fee Balance", value: "₹45,000", change: "Due" },
  { label: "Leave Balance", value: "5 days", change: "Available" },
  { label: "Events Registered", value: "2", change: "Upcoming" },
  { label: "Placement Status", value: "Active", change: "Eligible" },
];

export const attendanceHistory = [
  { month: "Jan", present: 22, absent: 2, percentage: 92 },
  { month: "Feb", present: 20, absent: 4, percentage: 83 },
  { month: "Mar", present: 21, absent: 3, percentage: 88 },
  { month: "Apr", present: 23, absent: 1, percentage: 96 },
  { month: "May", present: 22, absent: 2, percentage: 92 },
];

export const gpaHistory = [
  { semester: "Sem 1", gpa: 3.4, credits: 24 },
  { semester: "Sem 2", gpa: 3.6, credits: 26 },
  { semester: "Sem 3", gpa: 3.5, credits: 28 },
  { semester: "Sem 4", gpa: 3.7, credits: 30 },
  { semester: "Sem 5", gpa: 3.8, credits: 32 },
];

export const studentActivities = [
  {
    actor: "You",
    action: "submitted assignment for",
    target: "Data Structures",
    time: "2h ago",
    type: "Assignment",
  },
  {
    actor: "Faculty",
    action: "graded your assignment in",
    target: "Algorithms",
    time: "5h ago",
    type: "Grade",
  },
  {
    actor: "System",
    action: "reminded about",
    target: "Fee payment due date",
    time: "1d ago",
    type: "Reminder",
  },
  {
    actor: "Admin",
    action: "approved your leave request for",
    target: "May 25-26",
    time: "2d ago",
    type: "Leave",
  },
];

export const studentNotifications = [
  {
    id: "SN-001",
    title: "Assignment due tomorrow: Database Systems",
    type: "Assignment",
    time: "1h ago",
    unread: true,
  },
  {
    id: "SN-002",
    title: "Fee payment deadline approaching",
    type: "Alert",
    time: "4h ago",
    unread: true,
  },
  {
    id: "SN-003",
    title: "Mid-term exam schedule released",
    type: "Exam",
    time: "1d ago",
    unread: false,
  },
  {
    id: "SN-004",
    title: "Placement drive registration open",
    type: "Placement",
    time: "2d ago",
    unread: false,
  },
];

export const attendanceRecords = [
  { date: "2026-05-24", subject: "Data Structures", status: "Present", time: "09:00 AM" },
  { date: "2026-05-24", subject: "Algorithms", status: "Present", time: "11:00 AM" },
  { date: "2026-05-23", subject: "Database Systems", status: "Absent", time: "02:00 PM" },
  { date: "2026-05-23", subject: "Web Technologies", status: "Present", time: "04:00 PM" },
  { date: "2026-05-22", subject: "Data Structures", status: "Present", time: "09:00 AM" },
];

export const timetableSlots = [
  {
    day: "Monday",
    time: "09:00 AM",
    subject: "Data Structures",
    faculty: "Dr. Rajesh Kumar",
    room: "Room 101",
  },
  {
    day: "Monday",
    time: "11:00 AM",
    subject: "Algorithms",
    faculty: "Prof. Emily Chen",
    room: "Room 102",
  },
  {
    day: "Monday",
    time: "02:00 PM",
    subject: "Database Systems",
    faculty: "Dr. Marco Rossi",
    room: "Room 201",
  },
  {
    day: "Tuesday",
    time: "09:00 AM",
    subject: "Web Technologies",
    faculty: "Prof. Sarah Lin",
    room: "Room 301",
  },
  {
    day: "Tuesday",
    time: "11:00 AM",
    subject: "Data Structures Lab",
    faculty: "Dr. Rajesh Kumar",
    room: "Lab 1",
  },
  {
    day: "Tuesday",
    time: "02:00 PM",
    subject: "Algorithms Lab",
    faculty: "Prof. Emily Chen",
    room: "Lab 2",
  },
];

export const results = [
  { subject: "Data Structures", credits: 4, grade: "A", marks: 88, semester: "Sem 5" },
  { subject: "Algorithms", credits: 4, grade: "A+", marks: 92, semester: "Sem 5" },
  { subject: "Database Systems", credits: 3, grade: "A", marks: 89, semester: "Sem 5" },
  { subject: "Web Technologies", credits: 3, grade: "B+", marks: 82, semester: "Sem 5" },
  { subject: "Operating Systems", credits: 4, grade: "A", marks: 87, semester: "Sem 4" },
];

export const assignments = [
  {
    id: "ASN001",
    title: "Binary Tree Implementation",
    subject: "Data Structures",
    dueDate: "2026-05-25",
    status: "Pending",
    submitted: false,
  },
  {
    id: "ASN002",
    title: "Graph Algorithms",
    subject: "Algorithms",
    dueDate: "2026-05-28",
    status: "Pending",
    submitted: false,
  },
  {
    id: "ASN003",
    title: "ER Diagram Design",
    subject: "Database Systems",
    dueDate: "2026-05-20",
    status: "Submitted",
    submitted: true,
  },
  {
    id: "ASN004",
    title: "React Project",
    subject: "Web Technologies",
    dueDate: "2026-05-30",
    status: "Pending",
    submitted: false,
  },
];

export const studyMaterials = [
  {
    id: "MAT001",
    title: "Data Structures Notes",
    subject: "Data Structures",
    type: "PDF",
    uploaded: "2026-05-15",
    downloads: 234,
  },
  {
    id: "MAT002",
    title: "Algorithm Video Lecture",
    subject: "Algorithms",
    type: "Video",
    uploaded: "2026-05-18",
    downloads: 456,
  },
  {
    id: "MAT003",
    title: "Database SQL Tutorial",
    subject: "Database Systems",
    type: "Document",
    uploaded: "2026-05-20",
    downloads: 178,
  },
  {
    id: "MAT004",
    title: "Web Development Guide",
    subject: "Web Technologies",
    type: "PDF",
    uploaded: "2026-05-22",
    downloads: 312,
  },
];

export const feeRecords = [
  { feeType: "Tuition Fee", amount: "₹45,000", dueDate: "2026-06-01", status: "Pending" },
  { feeType: "Hostel Fee", amount: "₹35,000", dueDate: "2026-05-25", status: "Overdue" },
  { feeType: "Lab Fee", amount: "₹8,500", dueDate: "2026-06-15", status: "Pending" },
  { feeType: "Library Fee", amount: "₹1,500", dueDate: "2026-05-30", status: "Pending" },
];

export const leaveRequests = [
  {
    id: "LV001",
    type: "Sick Leave",
    from: "2026-05-25",
    to: "2026-05-26",
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

export const events = [
  {
    id: "EVT001",
    title: "Tech Fest 2026",
    date: "2026-07-20",
    type: "Event",
    status: "Registered",
  },
  {
    id: "EVT002",
    title: "Hackathon",
    date: "2026-06-15",
    type: "Competition",
    status: "Not Registered",
  },
  {
    id: "EVT003",
    title: "Guest Lecture: AI in Healthcare",
    date: "2026-06-05",
    type: "Lecture",
    status: "Registered",
  },
];

export const complaints = [
  {
    id: "CMP001",
    category: "Infrastructure",
    subject: "Lab equipment not working",
    status: "Resolved",
    date: "2026-05-15",
  },
  {
    id: "CMP002",
    category: "Academic",
    subject: "Grade dispute in Algorithms",
    status: "Pending",
    date: "2026-05-20",
  },
  {
    id: "CMP003",
    category: "Hostel",
    subject: "Room maintenance issue",
    status: "In Progress",
    date: "2026-05-22",
  },
];

export const placements = [
  {
    company: "Google",
    position: "Software Engineer",
    status: "Applied",
    appliedDate: "2026-05-15",
  },
  {
    company: "Microsoft",
    position: "Full Stack Developer",
    status: "Shortlisted",
    appliedDate: "2026-05-10",
  },
  {
    company: "Amazon",
    position: "Data Analyst",
    status: "Interview Scheduled",
    appliedDate: "2026-05-08",
  },
  { company: "Meta", position: "Frontend Developer", status: "Not Applied", appliedDate: "-" },
];
