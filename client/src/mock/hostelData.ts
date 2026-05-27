export const hostelStats = [
  { label: "Total Rooms", value: "250", tone: "info" as const },
  { label: "Occupied Rooms", value: "198", tone: "success" as const },
  { label: "Available Rooms", value: "52", tone: "warn" as const },
  { label: "Hostel Students", value: "396", tone: "info" as const },
  { label: "Pending Complaints", value: "24", tone: "danger" as const },
  { label: "Fee Collection", value: "$89.5K", tone: "success" as const },
  { label: "Visitors Today", value: "18", tone: "info" as const },
  { label: "Mess Attendance", value: "94%", tone: "success" as const },
];

export const roomOccupancyData = [
  { month: "Jan", occupied: 180, available: 70 },
  { month: "Feb", occupied: 185, available: 65 },
  { month: "Mar", occupied: 190, available: 60 },
  { month: "Apr", occupied: 195, available: 55 },
  { month: "May", occupied: 198, available: 52 },
  { month: "Jun", occupied: 200, available: 50 },
];

export const feeCollectionData = [
  { month: "Jan", collected: 75000, pending: 15000 },
  { month: "Feb", collected: 78000, pending: 12000 },
  { month: "Mar", collected: 82000, pending: 8000 },
  { month: "Apr", collected: 85000, pending: 5000 },
  { month: "May", collected: 89500, pending: 500 },
];

export const complaintStatusData = [
  { status: "Resolved", count: 156 },
  { status: "In Progress", count: 45 },
  { status: "Pending", count: 24 },
  { status: "Escalated", count: 8 },
];

export const hostelActivities = [
  {
    actor: "Warden",
    action: "approved room allocation for",
    target: "Rahul Sharma",
    time: "15m ago",
    type: "Allocation",
  },
  {
    actor: "System",
    action: "generated mess attendance report for",
    target: "Block A",
    time: "1h ago",
    type: "Report",
  },
  {
    actor: "Warden",
    action: "resolved complaint from",
    target: "Priya Patel",
    time: "2h ago",
    type: "Complaint",
  },
  {
    actor: "Security",
    action: "registered visitor for",
    target: "Amit Kumar",
    time: "3h ago",
    type: "Visitor",
  },
];

export const hostelNotifications = [
  {
    id: "HN-001",
    title: "Room cleaning scheduled for Block B",
    type: "Maintenance",
    time: "10m ago",
    unread: true,
  },
  {
    id: "HN-002",
    title: "Mess menu updated for next week",
    type: "Mess",
    time: "1h ago",
    unread: true,
  },
  {
    id: "HN-003",
    title: "Fee payment deadline approaching",
    type: "Alert",
    time: "2h ago",
    unread: false,
  },
  {
    id: "HN-004",
    title: "New visitor policy effective from Monday",
    type: "Policy",
    time: "3h ago",
    unread: false,
  },
];

export const roomAllocations = [
  {
    roomNumber: "A-101",
    studentName: "Rahul Sharma",
    department: "Computer Science",
    floor: "1st Floor",
    roomType: "Single",
    occupancyStatus: "Occupied",
  },
  {
    roomNumber: "A-102",
    studentName: "Priya Patel",
    department: "Electronics",
    floor: "1st Floor",
    roomType: "Double",
    occupancyStatus: "Occupied",
  },
  {
    roomNumber: "A-103",
    studentName: "Amit Kumar",
    department: "Mechanical",
    floor: "1st Floor",
    roomType: "Single",
    occupancyStatus: "Occupied",
  },
  {
    roomNumber: "A-104",
    studentName: "",
    department: "",
    floor: "1st Floor",
    roomType: "Double",
    occupancyStatus: "Available",
  },
  {
    roomNumber: "A-105",
    studentName: "Sneha Reddy",
    department: "Business",
    floor: "1st Floor",
    roomType: "Single",
    occupancyStatus: "Occupied",
  },
  {
    roomNumber: "B-201",
    studentName: "Vikram Singh",
    department: "Computer Science",
    floor: "2nd Floor",
    roomType: "Double",
    occupancyStatus: "Occupied",
  },
  {
    roomNumber: "B-202",
    studentName: "Anjali Gupta",
    department: "Biotechnology",
    floor: "2nd Floor",
    roomType: "Double",
    occupancyStatus: "Occupied",
  },
  {
    roomNumber: "B-203",
    studentName: "",
    department: "",
    floor: "2nd Floor",
    roomType: "Single",
    occupancyStatus: "Available",
  },
];

export const availableRooms = [
  { roomNumber: "A-104", floor: "1st Floor", roomType: "Double", capacity: 2 },
  { roomNumber: "B-203", floor: "2nd Floor", roomType: "Single", capacity: 1 },
  { roomNumber: "C-301", floor: "3rd Floor", roomType: "Double", capacity: 2 },
  { roomNumber: "C-302", floor: "3rd Floor", roomType: "Single", capacity: 1 },
  { roomNumber: "D-401", floor: "4th Floor", roomType: "Double", capacity: 2 },
];

export const messMenu = {
  breakfast: [
    { item: "Idli Sambar", time: "7:00 AM - 9:00 AM", calories: "350 kcal" },
    { item: "Poha with Peanuts", time: "7:00 AM - 9:00 AM", calories: "280 kcal" },
    { item: "Bread Butter & Eggs", time: "7:00 AM - 9:00 AM", calories: "320 kcal" },
    { item: "Upma", time: "7:00 AM - 9:00 AM", calories: "250 kcal" },
  ],
  lunch: [
    { item: "Rice, Dal, Sabzi", time: "12:00 PM - 2:00 PM", calories: "550 kcal" },
    { item: "Chole Bhature", time: "12:00 PM - 2:00 PM", calories: "600 kcal" },
    { item: "Thali (4 items)", time: "12:00 PM - 2:00 PM", calories: "650 kcal" },
    { item: "Veg Biryani", time: "12:00 PM - 2:00 PM", calories: "580 kcal" },
  ],
  dinner: [
    { item: "Roti, Paneer, Rice", time: "7:00 PM - 9:00 PM", calories: "620 kcal" },
    { item: "Dal Makhani with Rice", time: "7:00 PM - 9:00 PM", calories: "580 kcal" },
    { item: "Mixed Veg Curry", time: "7:00 PM - 9:00 PM", calories: "450 kcal" },
    { item: "Soup & Salad", time: "7:00 PM - 9:00 PM", calories: "200 kcal" },
  ],
};

export const messAttendanceData = [
  { day: "Mon", breakfast: 380, lunch: 390, dinner: 375 },
  { day: "Tue", breakfast: 375, lunch: 385, dinner: 380 },
  { day: "Wed", breakfast: 382, lunch: 392, dinner: 378 },
  { day: "Thu", breakfast: 378, lunch: 388, dinner: 382 },
  { day: "Fri", breakfast: 370, lunch: 380, dinner: 375 },
  { day: "Sat", breakfast: 350, lunch: 360, dinner: 355 },
  { day: "Sun", breakfast: 340, lunch: 350, dinner: 345 },
];

export const visitorLogs = [
  {
    visitorName: "Ramesh Gupta",
    studentName: "Rahul Sharma",
    entryTime: "09:30 AM",
    exitTime: "11:45 AM",
    contactNumber: "+91 98765 43210",
    status: "Checked Out",
  },
  {
    visitorName: "Sunita Devi",
    studentName: "Priya Patel",
    entryTime: "10:15 AM",
    exitTime: "",
    contactNumber: "+91 98765 43211",
    status: "Inside",
  },
  {
    visitorName: "Mohan Singh",
    studentName: "Amit Kumar",
    entryTime: "11:00 AM",
    exitTime: "01:30 PM",
    contactNumber: "+91 98765 43212",
    status: "Checked Out",
  },
  {
    visitorName: "Kavita Sharma",
    studentName: "Sneha Reddy",
    entryTime: "02:00 PM",
    exitTime: "",
    contactNumber: "+91 98765 43213",
    status: "Inside",
  },
  {
    visitorName: "Rajesh Verma",
    studentName: "Vikram Singh",
    entryTime: "03:30 PM",
    exitTime: "05:00 PM",
    contactNumber: "+91 98765 43214",
    status: "Checked Out",
  },
];

export const complaints = [
  {
    id: "CMP-001",
    studentName: "Rahul Sharma",
    category: "Maintenance",
    title: "Fan not working",
    priority: "High",
    status: "In Progress",
  },
  {
    id: "CMP-002",
    studentName: "Priya Patel",
    category: "Mess",
    title: "Food quality issue",
    priority: "Medium",
    status: "Pending",
  },
  {
    id: "CMP-003",
    studentName: "Amit Kumar",
    category: "Security",
    title: "Unauthorized entry",
    priority: "High",
    status: "Resolved",
  },
  {
    id: "CMP-004",
    studentName: "Sneha Reddy",
    category: "Maintenance",
    title: "Water leakage",
    priority: "High",
    status: "Escalated",
  },
  {
    id: "CMP-005",
    studentName: "Vikram Singh",
    category: "Mess",
    title: "Late dinner service",
    priority: "Low",
    status: "Pending",
  },
  {
    id: "CMP-006",
    studentName: "Anjali Gupta",
    category: "Electrical",
    title: "Light not working",
    priority: "Medium",
    status: "In Progress",
  },
];

export const hostelFees = [
  {
    studentName: "Rahul Sharma",
    roomNumber: "A-101",
    feeAmount: "$8,000",
    dueDate: "2026-06-01",
    paymentStatus: "Paid",
  },
  {
    studentName: "Priya Patel",
    roomNumber: "A-102",
    feeAmount: "$8,000",
    dueDate: "2026-06-01",
    paymentStatus: "Pending",
  },
  {
    studentName: "Amit Kumar",
    roomNumber: "A-103",
    feeAmount: "$8,000",
    dueDate: "2026-05-25",
    paymentStatus: "Overdue",
  },
  {
    studentName: "Sneha Reddy",
    roomNumber: "A-105",
    feeAmount: "$8,000",
    dueDate: "2026-06-01",
    paymentStatus: "Paid",
  },
  {
    studentName: "Vikram Singh",
    roomNumber: "B-201",
    feeAmount: "$8,000",
    dueDate: "2026-05-30",
    paymentStatus: "Pending",
  },
  {
    studentName: "Anjali Gupta",
    roomNumber: "B-202",
    feeAmount: "$8,000",
    dueDate: "2026-06-01",
    paymentStatus: "Paid",
  },
];

export const hostelStudents = [
  {
    id: "HS-001",
    name: "Rahul Sharma",
    department: "Computer Science",
    roomNumber: "A-101",
    floor: "1st Floor",
    attendance: "95%",
    status: "Active",
    emergencyContact: "+91 98765 43210",
  },
  {
    id: "HS-002",
    name: "Priya Patel",
    department: "Electronics",
    roomNumber: "A-102",
    floor: "1st Floor",
    attendance: "88%",
    status: "Active",
    emergencyContact: "+91 98765 43211",
  },
  {
    id: "HS-003",
    name: "Amit Kumar",
    department: "Mechanical",
    roomNumber: "A-103",
    floor: "1st Floor",
    attendance: "76%",
    status: "Warning",
    emergencyContact: "+91 98765 43212",
  },
  {
    id: "HS-004",
    name: "Sneha Reddy",
    department: "Business",
    roomNumber: "A-105",
    floor: "1st Floor",
    attendance: "92%",
    status: "Active",
    emergencyContact: "+91 98765 43213",
  },
  {
    id: "HS-005",
    name: "Vikram Singh",
    department: "Computer Science",
    roomNumber: "B-201",
    floor: "2nd Floor",
    attendance: "85%",
    status: "Active",
    emergencyContact: "+91 98765 43214",
  },
  {
    id: "HS-006",
    name: "Anjali Gupta",
    department: "Biotechnology",
    roomNumber: "B-202",
    floor: "2nd Floor",
    attendance: "71%",
    status: "Warning",
    emergencyContact: "+91 98765 43215",
  },
];

export const hostelNotificationsList = [
  {
    id: "NOT-001",
    title: "Hostel fee payment reminder",
    type: "Fee",
    priority: "High",
    time: "10m ago",
    read: false,
  },
  {
    id: "NOT-002",
    title: "Complaint resolved: Fan not working",
    type: "Complaint",
    priority: "Medium",
    time: "1h ago",
    read: false,
  },
  {
    id: "NOT-003",
    title: "Visitor policy update",
    type: "Policy",
    priority: "Low",
    time: "2h ago",
    read: true,
  },
  {
    id: "NOT-004",
    title: "Mess menu change for Sunday",
    type: "Mess",
    priority: "Medium",
    time: "3h ago",
    read: true,
  },
  {
    id: "NOT-005",
    title: "Emergency drill scheduled",
    type: "Emergency",
    priority: "High",
    time: "5h ago",
    read: false,
  },
];
