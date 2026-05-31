/*
Build ONLY the Hostel Management Module pages for the existing College Management System UI.

IMPORTANT:
- DO NOT change existing UI design
- DO NOT change colors
- DO NOT change sidebar style
- DO NOT change navbar
- DO NOT change spacing system
- DO NOT change typography
- DO NOT change gradients
- DO NOT create a new theme

Use EXACTLY the same:
- layout
- card design
- buttons
- border radius
- shadows
- colors
- hover effects
- gradients
- component structure

Match the current UI perfectly.

TECH STACK:
- React
- Tailwind CSS
- shadcn/ui
- lucide-react
- Recharts

CURRENT UI STYLE:
- Clean enterprise ERP dashboard
- Soft gray background
- White cards
- Blue-purple gradient buttons
- Rounded cards
- Minimal shadows
- Professional spacing
- Sidebar navigation
- Top navbar with search

BUILD THESE HOSTEL MANAGEMENT PAGES:

1. HOSTEL DASHBOARD (dashboard.hostel.tsx)
Create dashboard matching existing design.

Include:
- Total Rooms
- Occupied Rooms
- Available Rooms
- Hostel Students
- Pending Complaints
- Fee Collection
- Visitors Today
- Mess Attendance

Add:
- Room occupancy analytics chart
- Hostel fee collection graph
- Complaint status chart
- Recent hostel activities
- Notifications panel
- Quick action cards

Use same analytics card style already existing.

2. ROOM ALLOCATION PAGE (dashboard.hostel.rooms.tsx)
Create:
- Room allocation table
- Student room assignment cards
- Room availability status
- Floor/Block filters
- Add allocation button

TABLE COLUMNS:
- Room Number
- Student Name
- Department
- Floor
- Room Type
- Occupancy Status
- Actions

Include:
- Search/filter
- Room occupancy analytics
- Available rooms section
- Allocation history

3. MESS MANAGEMENT PAGE (dashboard.hostel.mess.tsx)
Create:
- Daily mess menu cards
- Meal attendance tracking
- Mess payment status
- Food schedule calendar
- Mess analytics chart

Include:
- Breakfast/Lunch/Dinner tabs
- Monthly meal statistics
- Mess feedback section
- Special meal requests

4. VISITOR LOGS PAGE (dashboard.hostel.visitors.tsx)
Create:
- Visitor entry table
- Visitor registration form
- Entry/exit tracking
- Visitor badges
- Security verification cards

TABLE COLUMNS:
- Visitor Name
- Student Name
- Entry Time
- Exit Time
- Contact Number
- Status

Include:
- Visitor analytics
- Search/filter
- Visitor approval section
- Recent visitor logs

5. COMPLAINT MANAGEMENT PAGE (dashboard.hostel.complaints.tsx)
Create:
- Complaint cards
- Complaint status tracking
- Complaint categories
- Resolution timeline
- Priority badges

TABLE COLUMNS:
- Complaint ID
- Student Name
- Category
- Complaint Title
- Priority
- Status
- Actions

Include:
- Resolve complaint modal
- Complaint analytics
- Pending complaints section
- Escalation alerts

6. HOSTEL FEE TRACKING PAGE (dashboard.hostel.fees.tsx)
Create:
- Hostel fee summary cards
- Pending dues
- Payment history table
- Fee reminder alerts
- Fee analytics chart

TABLE COLUMNS:
- Student Name
- Room Number
- Fee Amount
- Due Date
- Payment Status
- Receipt

Include:
- Download receipt button
- Payment reminders
- Fee collection analytics
- Scholarship details

7. HOSTEL STUDENTS PAGE (dashboard.hostel.students.tsx)
Create:
- Hostel student cards
- Student profile details
- Room allocation info
- Attendance status
- Emergency contacts

Include:
- Search/filter
- Student analytics
- Active/inactive badges
- Student activity section

8. NOTIFICATIONS PAGE (dashboard.hostel.notifications.tsx)
Create:
- Hostel announcements
- Fee reminders
- Complaint updates
- Visitor alerts
- Emergency notifications

Include:
- Notification cards
- Priority badges
- Mark as read buttons
- Notification filters

9. REPORTS PAGE (dashboard.hostel.reports.tsx)
Create:
- Occupancy reports
- Fee collection reports
- Complaint analytics
- Visitor analytics
- Mess attendance reports

Include:
- Charts
- Download report buttons
- Monthly/yearly filters
- Performance analytics

10. SETTINGS PAGE (dashboard.hostel.settings.tsx)
Create:
- Hostel admin profile
- Notification settings
- Security settings
- Hostel preferences
- Password management

UI REQUIREMENTS:
- Match current design EXACTLY
- Same card sizes
- Same spacing
- Same gradients
- Same buttons
- Same border radius
- Same typography
- Same shadows
- Same navbar
- Same sidebar

IMPORTANT UI RULES:
- Keep existing colors exactly same
- Keep existing sidebar style
- Keep same gradients
- Keep same spacing
- Keep same typography
- Keep same cards
- Keep same navbar
- Keep same shadows
- Keep same responsive layout

DATA:
Use static dummy data only.

NO:
- backend
- database
- API integration
- authentication logic

ANIMATIONS:
Keep same existing animations:
- hover effects
- smooth transitions
- sidebar active states

DO NOT:
- redesign anything
- change theme
- add futuristic effects
- use dark mode
- use neon colors
- create inconsistent layouts

The Hostel Management module should look like a real enterprise College ERP hostel administration dashboard fully integrated into the existing College Management System UI.
*/
/*
Build ONLY the Hostel Management Module pages for the existing College Management System UI.

IMPORTANT:
- DO NOT change existing UI design
- DO NOT change colors
- DO NOT change sidebar style
- DO NOT change navbar
- DO NOT change spacing system
- DO NOT change typography
- DO NOT change gradients
- DO NOT create a new theme

Use EXACTLY the same:
- layout
- card design
- buttons
- border radius
- shadows
- colors
- hover effects
- gradients
- component structure

Match the current UI perfectly.

TECH STACK:
- React
- Tailwind CSS
- shadcn/ui
- lucide-react
- Recharts

CURRENT UI STYLE:
- Clean enterprise ERP dashboard
- Soft gray background
- White cards
- Blue-purple gradient buttons
- Rounded cards
- Minimal shadows
- Professional spacing
- Sidebar navigation
- Top navbar with search

BUILD THESE HOSTEL MANAGEMENT PAGES:

1. HOSTEL DASHBOARD (dashboard.hostel.tsx)
Create dashboard matching existing design.

Include:
- Total Rooms
- Occupied Rooms
- Available Rooms
- Hostel Students
- Pending Complaints
- Fee Collection
- Visitors Today
- Mess Attendance

Add:
- Room occupancy analytics chart
- Hostel fee collection graph
- Complaint status chart
- Recent hostel activities
- Notifications panel
- Quick action cards

Use same analytics card style already existing.

2. ROOM ALLOCATION PAGE (dashboard.hostel.rooms.tsx)
Create:
- Room allocation table
- Student room assignment cards
- Room availability status
- Floor/Block filters
- Add allocation button

TABLE COLUMNS:
- Room Number
- Student Name
- Department
- Floor
- Room Type
- Occupancy Status
- Actions

Include:
- Search/filter
- Room occupancy analytics
- Available rooms section
- Allocation history

3. MESS MANAGEMENT PAGE (dashboard.hostel.mess.tsx)
Create:
- Daily mess menu cards
- Meal attendance tracking
- Mess payment status
- Food schedule calendar
- Mess analytics chart

Include:
- Breakfast/Lunch/Dinner tabs
- Monthly meal statistics
- Mess feedback section
- Special meal requests

4. VISITOR LOGS PAGE (dashboard.hostel.visitors.tsx)
Create:
- Visitor entry table
- Visitor registration form
- Entry/exit tracking
- Visitor badges
- Security verification cards

TABLE COLUMNS:
- Visitor Name
- Student Name
- Entry Time
- Exit Time
- Contact Number
- Status

Include:
- Visitor analytics
- Search/filter
- Visitor approval section
- Recent visitor logs

5. COMPLAINT MANAGEMENT PAGE (dashboard.hostel.complaints.tsx)
Create:
- Complaint cards
- Complaint status tracking
- Complaint categories
- Resolution timeline
- Priority badges

TABLE COLUMNS:
- Complaint ID
- Student Name
- Category
- Complaint Title
- Priority
- Status
- Actions

Include:
- Resolve complaint modal
- Complaint analytics
- Pending complaints section
- Escalation alerts

6. HOSTEL FEE TRACKING PAGE (dashboard.hostel.fees.tsx)
Create:
- Hostel fee summary cards
- Pending dues
- Payment history table
- Fee reminder alerts
- Fee analytics chart

TABLE COLUMNS:
- Student Name
- Room Number
- Fee Amount
- Due Date
- Payment Status
- Receipt

Include:
- Download receipt button
- Payment reminders
- Fee collection analytics
- Scholarship details

7. HOSTEL STUDENTS PAGE (dashboard.hostel.students.tsx)
Create:
- Hostel student cards
- Student profile details
- Room allocation info
- Attendance status
- Emergency contacts

Include:
- Search/filter
- Student analytics
- Active/inactive badges
- Student activity section

8. NOTIFICATIONS PAGE (dashboard.hostel.notifications.tsx)
Create:
- Hostel announcements
- Fee reminders
- Complaint updates
- Visitor alerts
- Emergency notifications

Include:
- Notification cards
- Priority badges
- Mark as read buttons
- Notification filters

9. REPORTS PAGE (dashboard.hostel.reports.tsx)
Create:
- Occupancy reports
- Fee collection reports
- Complaint analytics
- Visitor analytics
- Mess attendance reports

Include:
- Charts
- Download report buttons
- Monthly/yearly filters
- Performance analytics

10. SETTINGS PAGE (dashboard.hostel.settings.tsx)
Create:
- Hostel admin profile
- Notification settings
- Security settings
- Hostel preferences
- Password management

UI REQUIREMENTS:
- Match current design EXACTLY
- Same card sizes
- Same spacing
- Same gradients
- Same buttons
- Same border radius
- Same typography
- Same shadows
- Same navbar
- Same sidebar

IMPORTANT UI RULES:
- Keep existing colors exactly same
- Keep existing sidebar style
- Keep same gradients
- Keep same spacing
- Keep same typography
- Keep same cards
- Keep same navbar
- Keep same shadows
- Keep same responsive layout

DATA:
Use static dummy data only.

NO:
- backend
- database
- API integration
- authentication logic

ANIMATIONS:
Keep same existing animations:
- hover effects
- smooth transitions
- sidebar active states

DO NOT:
- redesign anything
- change theme
- add futuristic effects
- use dark mode
- use neon colors
- create inconsistent layouts

The Hostel Management module should look like a real enterprise College ERP hostel administration dashboard fully integrated into the existing College Management System UI.
*/
export const adminStats = [
  { label: "Total Students", value: "25", change: "+8.3%" },
  { label: "Total Faculty", value: "10", change: "+0%" },
  { label: "Active Departments", value: "5", change: "+0%" },
  { label: "Attendance Percentage", value: "92.0%", change: "+1.5%" },
  { label: "Fee Collection", value: "₹12.5L", change: "+5.4%" },
  { label: "Pending Approvals", value: "3", change: "-25.0%" },
  { label: "Upcoming Events", value: "5", change: "+1" },
  { label: "Notifications", value: "8", change: "+2" },
];

export const studentAnalytics = [
  { month: "Jan", enrolled: 18, attendance: 90, fees: 180 },
  { month: "Feb", enrolled: 20, attendance: 91, fees: 200 },
  { month: "Mar", enrolled: 22, attendance: 89, fees: 220 },
  { month: "Apr", enrolled: 23, attendance: 92, fees: 230 },
  { month: "May", enrolled: 24, attendance: 93, fees: 240 },
  { month: "Jun", enrolled: 25, attendance: 92, fees: 250 },
];

export const attendanceMonitoring = [
  { day: "Mon", present: 23, absent: 2, percentage: 92 },
  { day: "Tue", present: 24, absent: 1, percentage: 96 },
  { day: "Wed", present: 22, absent: 3, percentage: 88 },
  { day: "Thu", present: 25, absent: 0, percentage: 100 },
  { day: "Fri", present: 23, absent: 2, percentage: 92 },
  { day: "Sat", present: 15, absent: 10, percentage: 60 },
];

export const departmentDistributionAdmin = [
  { name: "Computer Science", value: 9, color: "#4F46E5" },
  { name: "Electronics", value: 5, color: "#9333EA" },
  { name: "Mechanical", value: 4, color: "#06B6D4" },
  { name: "Business", value: 4, color: "#2563EB" },
  { name: "Biotechnology", value: 3, color: "#7C3AED" },
];

export const adminActivities = [
  {
    actor: "Admin",
    action: "approved admission for",
    target: "Rahul Sharma",
    time: "15m ago",
    type: "Approval",
  },
  {
    actor: "System",
    action: "generated attendance report for",
    target: "Semester 5",
    time: "1h ago",
    type: "Report",
  },
  {
    actor: "Admin",
    action: "updated fee status for",
    target: "Priya Patel",
    time: "2h ago",
    type: "Update",
  },
  {
    actor: "Faculty",
    action: "submitted grades for",
    target: "Data Structures",
    time: "3h ago",
    type: "Grade",
  },
];

export const adminNotifications = [
  {
    id: "AN-001",
    title: "New student registration pending approval",
    type: "Approval",
    time: "10m ago",
    unread: true,
  },
  {
    id: "AN-002",
    title: "Fee collection deadline approaching",
    type: "Alert",
    time: "1h ago",
    unread: true,
  },
  {
    id: "AN-003",
    title: "Attendance below 75% for 42 students",
    type: "Warning",
    time: "2h ago",
    unread: false,
  },
  {
    id: "AN-004",
    title: "Event approval request: Tech Fest 2026",
    type: "Event",
    time: "3h ago",
    unread: false,
  },
];

export const students = [
  {
    id: "STU001",
    name: "Rahul Sharma",
    department: "Computer Science",
    year: "Year 3",
    attendance: "92%",
    status: "Active",
  },
  {
    id: "STU002",
    name: "Priya Patel",
    department: "Electronics",
    year: "Year 2",
    attendance: "88%",
    status: "Active",
  },
  {
    id: "STU003",
    name: "Amit Kumar",
    department: "Mechanical",
    year: "Year 4",
    attendance: "76%",
    status: "Warning",
  },
  {
    id: "STU004",
    name: "Sneha Reddy",
    department: "Business",
    year: "Year 1",
    attendance: "95%",
    status: "Active",
  },
  {
    id: "STU005",
    name: "Vikram Singh",
    department: "Computer Science",
    year: "Year 3",
    attendance: "82%",
    status: "Active",
  },
  {
    id: "STU006",
    name: "Anjali Gupta",
    department: "Biotechnology",
    year: "Year 2",
    attendance: "71%",
    status: "Warning",
  },
  {
    id: "STU007",
    name: "Rajesh Verma",
    department: "Mechanical",
    year: "Year 4",
    attendance: "89%",
    status: "Active",
  },
  {
    id: "STU008",
    name: "Kavita Nair",
    department: "Electronics",
    year: "Year 2",
    attendance: "94%",
    status: "Active",
  },
];

export const faculty = [
  {
    id: "FAC001",
    name: "Dr. Rajesh Kumar",
    department: "Computer Science",
    subject: "Data Structures",
    experience: "12 years",
    status: "Active",
  },
  {
    id: "FAC002",
    name: "Prof. Sarah Lin",
    department: "Business",
    subject: "Marketing",
    experience: "8 years",
    status: "Active",
  },
  {
    id: "FAC003",
    name: "Dr. Vikram Rao",
    department: "Mechanical",
    subject: "Thermodynamics",
    experience: "15 years",
    status: "Active",
  },
  {
    id: "FAC004",
    name: "Prof. Aisha Khan",
    department: "Biotechnology",
    subject: "Genetics",
    experience: "10 years",
    status: "Active",
  },
  {
    id: "FAC005",
    name: "Dr. Marco Rossi",
    department: "Electronics",
    subject: "Digital Systems",
    experience: "7 years",
    status: "On Leave",
  },
  {
    id: "FAC006",
    name: "Prof. Emily Chen",
    department: "Computer Science",
    subject: "Algorithms",
    experience: "6 years",
    status: "Active",
  },
];

export const academicEvents = [
  {
    id: "EVT001",
    title: "Mid-Semester Exams",
    date: "2026-06-15",
    type: "Exam",
    status: "Upcoming",
  },
  {
    id: "EVT002",
    title: "Tech Fest 2026",
    date: "2026-07-20",
    type: "Event",
    status: "Pending Approval",
  },
  {
    id: "EVT003",
    title: "Faculty Meeting",
    date: "2026-05-28",
    type: "Meeting",
    status: "Approved",
  },
  { id: "EVT004", title: "Sports Day", date: "2026-08-10", type: "Event", status: "Approved" },
  {
    id: "EVT005",
    title: "Guest Lecture: AI in Healthcare",
    date: "2026-06-05",
    type: "Lecture",
    status: "Upcoming",
  },
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
    subject: "Marketing",
    faculty: "Prof. Sarah Lin",
    room: "Room 201",
  },
  {
    day: "Tuesday",
    time: "09:00 AM",
    subject: "Thermodynamics",
    faculty: "Dr. Vikram Rao",
    room: "Room 301",
  },
  {
    day: "Tuesday",
    time: "11:00 AM",
    subject: "Digital Systems",
    faculty: "Dr. Marco Rossi",
    room: "Room 302",
  },
  {
    day: "Tuesday",
    time: "02:00 PM",
    subject: "Genetics",
    faculty: "Prof. Aisha Khan",
    room: "Room 401",
  },
];

export const feeRecords = [
  {
    student: "Rahul Sharma",
    feeType: "Tuition Fee",
    amount: "₹45,000",
    dueDate: "2026-06-01",
    status: "Paid",
  },
  {
    student: "Priya Patel",
    feeType: "Tuition Fee",
    amount: "₹45,000",
    dueDate: "2026-06-01",
    status: "Pending",
  },
  {
    student: "Amit Kumar",
    feeType: "Hostel Fee",
    amount: "₹35,000",
    dueDate: "2026-05-25",
    status: "Overdue",
  },
  {
    student: "Sneha Reddy",
    feeType: "Tuition Fee",
    amount: "₹45,000",
    dueDate: "2026-06-01",
    status: "Paid",
  },
  {
    student: "Vikram Singh",
    feeType: "Lab Fee",
    amount: "₹8,500",
    dueDate: "2026-05-30",
    status: "Pending",
  },
];

export const attendanceAlerts = [
  { department: "Computer Science", studentsBelow75: 12, totalStudents: 820 },
  { department: "Electronics", studentsBelow75: 8, totalStudents: 640 },
  { department: "Mechanical", studentsBelow75: 15, totalStudents: 580 },
  { department: "Business", studentsBelow75: 5, totalStudents: 420 },
  { department: "Biotechnology", studentsBelow75: 7, totalStudents: 387 },
];

export const notificationTemplates = [
  {
    name: "Fee Reminder",
    type: "Email",
    subject: "Fee Payment Reminder",
    content: "Dear student, your fee payment is due on {date}. Please ensure timely payment.",
  },
  {
    name: "Attendance Warning",
    type: "SMS",
    subject: "Low Attendance Alert",
    content: "Your attendance is below 75%. Please attend classes regularly.",
  },
  {
    name: "Event Announcement",
    type: "WhatsApp",
    subject: "Upcoming Event",
    content: "Join us for {event} on {date}. Register now!",
  },
];

export const reportFilters = ["This Month", "This Semester", "This Year", "Custom Range"];
