// Pure Frontend Mock Data Engine & LocalStorage Persistence for Student Module

export const INITIAL_STUDENT_PROFILE = {
  id: "std_2023_cse_042",
  _id: "std_2023_cse_042",
  fullName: "Hanish Kumar",
  rollNumber: "2023CSE042",
  admissionNumber: "ADM-2023-8891",
  email: "student@college.com",
  phone: "+91 98765 43210",
  gender: "Male",
  dateOfBirth: "2003-05-15",
  department: "Computer Science & Engineering",
  deptCode: "CSE",
  year: 3,
  semester: 5,
  section: "A",
  cgpa: 8.75,
  attendancePercentage: 88.5,
  profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  address: "123 Campus Residency, Tech Park Road, Bengaluru, Karnataka - 560001",
  bloodGroup: "O+",
  guardianName: "Rajesh Kumar",
  guardianPhone: "+91 98123 45678",
  guardianRelation: "Father",
  guardianEmail: "rajesh.kumar@gmail.com"
};

export const INITIAL_NOTICES = [
  {
    id: "not_1",
    author: "Dr M Sunil Prakash",
    designation: "PROFESSOR & DEAN(TP)",
    avatarInitials: "DM",
    date: "17 Sept 2025",
    category: "Announcement",
    type: "Announcements",
    priority: "High",
    title: "*Upcoming Soft Suave Campus Drive – 20th & 21st September 2025*",
    content: "Dear students, Please be informed that the *Soft Suave campus drive is scheduled for 20th & 21st September 2025.* for all final year students who have already registered on the Placement Portal. Attendance is strictly mandatory for eligible candidates. Detailed interview slot timings have been emailed.",
    pinned: true,
    reactions: { likes: 42, hearts: 18, smiles: 12, questions: 3 },
    userReactions: {}
  },
  {
    id: "not_2",
    author: "Dr M Sunil Prakash",
    designation: "PROFESSOR & DEAN(TP)",
    avatarInitials: "DM",
    date: "06 Sept 2025",
    category: "Announcement",
    type: "Announcements",
    priority: "High",
    title: "Unistring Campus drive for final year students",
    content: "Unistring Campus drive for final year students of ECE, EEE, CSE, IT, CSIT, CSM, CSD & CIC on 9th September, 2025. Venue: Main Auditorium B. Reporting time: 09:00 AM sharp with printed resumes and identity cards.",
    pinned: true,
    reactions: { likes: 31, hearts: 9, smiles: 14, questions: 5 },
    userReactions: {}
  },
  {
    id: "not_3",
    author: "Dr P Rsantosh Naidu",
    designation: "SR ASST. PROFESSOR",
    avatarInitials: "DP",
    date: "03 Jul 2025",
    category: "Announcement",
    type: "Posts",
    priority: "Medium",
    title: "Project Report & GitHub Code Submission",
    content: "hello students, please make sure to upload your 5th Semester Software Project Documentation (PDF) along with active GitHub Repository links to the LMS portal before July 10th. Late submissions will incur grade deductions.",
    pinned: false,
    reactions: { likes: 15, hearts: 4, smiles: 8, questions: 2 },
    userReactions: {}
  },
  {
    id: "not_4",
    author: "Dr V Kulkarni",
    designation: "HOD CSE DEPARTMENT",
    avatarInitials: "VK",
    date: "18 Sept 2025",
    category: "Poll",
    type: "Polls",
    priority: "High",
    title: "Student Preference Survey: Semester VI Professional Electives",
    content: "Please cast your vote for your preferred open elective track for the upcoming Semester VI curriculum. The department will allocate lab capacity accordingly.",
    pinned: true,
    poll: {
      options: [
        { id: "opt_1", text: "Cloud Computing & AWS DevOps Architecture", votes: 142 },
        { id: "opt_2", text: "Generative AI, PyTorch & LLM Engineering", votes: 218 },
        { id: "opt_3", text: "Cyber Security & Forensic Penetration Testing", votes: 95 }
      ],
      userVoted: null
    },
    reactions: { likes: 65, hearts: 24, smiles: 19, questions: 7 },
    userReactions: {}
  },
  {
    id: "not_5",
    author: "Controller of Examinations",
    designation: "EXAM CELL HEAD",
    avatarInitials: "CE",
    date: "20 Sept 2025",
    category: "Urgent",
    type: "Urgent Notices",
    priority: "High",
    title: "URGENT: End-Sem Exam Fee Clearance & Admit Card Download",
    content: "All 3rd and 4th Year B.Tech students must clear pending tuition/exam fee balances by September 25th to ensure Admit Card generation for the upcoming November Regular Exams.",
    pinned: true,
    reactions: { likes: 88, hearts: 12, smiles: 5, questions: 23 },
    userReactions: {}
  }
];

export const INITIAL_TIMETABLE = [
  { day: "Monday", time: "09:00 AM - 10:00 AM", subject: "Data Structures & Algorithms", code: "CS501", room: "Hall 301", faculty: "Dr. A. Sharma", type: "Lecture" },
  { day: "Monday", time: "10:15 AM - 11:15 AM", subject: "Operating Systems", code: "CS502", room: "Hall 301", faculty: "Prof. R. Verma", type: "Lecture" },
  { day: "Monday", time: "11:30 AM - 12:30 PM", subject: "Database Management Systems", code: "CS503", room: "Hall 302", faculty: "Dr. M. Swamy", type: "Lecture" },
  { day: "Monday", time: "01:30 PM - 03:30 PM", subject: "DBMS & Web Dev Lab", code: "CS503L", room: "Advanced Computing Lab 2", faculty: "Prof. S. Gupta", type: "Lab" },

  { day: "Tuesday", time: "09:00 AM - 10:00 AM", subject: "Computer Networks", code: "CS504", room: "Hall 301", faculty: "Dr. P. Nair", type: "Lecture" },
  { day: "Tuesday", time: "10:15 AM - 11:15 AM", subject: "Web Technologies", code: "CS505", room: "Hall 301", faculty: "Prof. S. Gupta", type: "Lecture" },
  { day: "Tuesday", time: "11:30 AM - 12:30 PM", subject: "Operating Systems", code: "CS502", room: "Hall 301", faculty: "Prof. R. Verma", type: "Lecture" },
  { day: "Tuesday", time: "01:30 PM - 03:30 PM", subject: "OS & Systems Lab", code: "CS502L", room: "Systems Lab 1", faculty: "Prof. R. Verma", type: "Lab" },

  { day: "Wednesday", time: "09:00 AM - 10:00 AM", subject: "Database Management Systems", code: "CS503", room: "Hall 302", faculty: "Dr. M. Swamy", type: "Lecture" },
  { day: "Wednesday", time: "10:15 AM - 11:15 AM", subject: "Data Structures & Algorithms", code: "CS501", room: "Hall 301", faculty: "Dr. A. Sharma", type: "Lecture" },
  { day: "Wednesday", time: "11:30 AM - 12:30 PM", subject: "Software Engineering", code: "CS506", room: "Hall 303", faculty: "Dr. K. Patel", type: "Lecture" },

  { day: "Thursday", time: "09:00 AM - 10:00 AM", subject: "Web Technologies", code: "CS505", room: "Hall 301", faculty: "Prof. S. Gupta", type: "Lecture" },
  { day: "Thursday", time: "10:15 AM - 11:15 AM", subject: "Computer Networks", code: "CS504", room: "Hall 301", faculty: "Dr. P. Nair", type: "Lecture" },
  { day: "Thursday", time: "01:30 PM - 04:00 PM", subject: "Software Project Lab", code: "CS506L", room: "Project Lab 4", faculty: "Dr. K. Patel", type: "Lab" },

  { day: "Friday", time: "09:00 AM - 10:00 AM", subject: "Software Engineering", code: "CS506", room: "Hall 303", faculty: "Dr. K. Patel", type: "Lecture" },
  { day: "Friday", time: "10:15 AM - 11:15 AM", subject: "Machine Learning Elective", code: "CSE511", room: "Hall 401", faculty: "Dr. V. Reddy", type: "Elective" },
  { day: "Friday", time: "11:30 AM - 12:30 PM", subject: "T&P Aptitude Training", code: "TP501", room: "Auditorium B", faculty: "Placement Trainers", type: "Soft Skills" }
];

export const INITIAL_LMS_COURSES = [
  {
    id: "lms_wt",
    code: "R23MSCST015",
    name: "Web Technologies",
    faculty: "Dr. A. Sharma",
    progress: 78,
    programName: "B.TECH COMPUTER SCIENCE & ENGINEERING (DATA SCIENCE)",
    semNo: "6",
    type: "Core Theory",
    credits: "3",
    materials: [],
    assignments: []
  },
  {
    id: "lms_ooad",
    code: "R23MSCST016",
    name: "OOAD and Design Patterns",
    faculty: "Prof. R. Verma",
    progress: 82,
    programName: "B.TECH COMPUTER SCIENCE & ENGINEERING (DATA SCIENCE)",
    semNo: "6",
    type: "Core Theory",
    credits: "3",
    materials: [],
    assignments: []
  },
  {
    id: "lms_mpi",
    code: "R23MSCST017",
    name: "Microprocessors and Interfacing",
    faculty: "Dr. M. Swamy",
    progress: 90,
    programName: "B.TECH COMPUTER SCIENCE & ENGINEERING (DATA SCIENCE)",
    semNo: "6",
    type: "Core Theory",
    credits: "3",
    materials: [],
    assignments: []
  },
  {
    id: "lms_ba",
    code: "R23MBMCT006",
    name: "Business Analysis",
    faculty: "Dr. K. Patel",
    progress: 85,
    programName: "B.TECH COMPUTER SCIENCE & ENGINEERING (DATA SCIENCE)",
    semNo: "6",
    type: "Core Theory",
    credits: "3",
    materials: [],
    assignments: []
  },
  {
    id: "lms_spa",
    code: "R23MSCST020",
    name: "Statistical and Predictive Analytics",
    faculty: "Dr. V. Reddy",
    progress: 88,
    programName: "B.TECH COMPUTER SCIENCE & ENGINEERING (DATA SCIENCE)",
    semNo: "6",
    type: "Core Theory",
    credits: "3",
    materials: [],
    assignments: []
  },
  {
    id: "lms_wt_lab",
    code: "R23MSCSL008",
    name: "Web Technologies Lab",
    faculty: "Dr. A. Sharma",
    progress: 95,
    programName: "B.TECH COMPUTER SCIENCE & ENGINEERING (DATA SCIENCE)",
    semNo: "6",
    type: "Core Lab",
    credits: "1.5",
    materials: [],
    assignments: []
  },
  {
    id: "lms_ba_lab",
    code: "R23MBMCL004",
    name: "Business Analytics Lab",
    faculty: "Dr. K. Patel",
    progress: 92,
    programName: "B.TECH COMPUTER SCIENCE & ENGINEERING (DATA SCIENCE)",
    semNo: "6",
    type: "Core Lab",
    credits: "1.5",
    materials: [],
    assignments: []
  },
  {
    id: "lms_dwdm",
    code: "R23MSCST019",
    name: "Data Warehousing and Data Mining",
    faculty: "Prof. N. Kulkarni",
    progress: 80,
    programName: "B.TECH COMPUTER SCIENCE & ENGINEERING (DATA SCIENCE)",
    semNo: "6",
    type: "Core Theory",
    credits: "3",
    materials: [],
    assignments: []
  }
];

export const INITIAL_COURSES = [
  { id: "c_101", code: "CS501", name: "Data Structures & Algorithms", credits: 4, type: "Core", department: "CSE", status: "Enrolled" },
  { id: "c_102", code: "CS502", name: "Operating Systems", credits: 4, type: "Core", department: "CSE", status: "Enrolled" },
  { id: "c_103", code: "CS503", name: "Database Management Systems", credits: 4, type: "Core", department: "CSE", status: "Enrolled" },
  { id: "c_104", code: "CS504", name: "Computer Networks", credits: 3, type: "Core", department: "CSE", status: "Enrolled" },
  { id: "c_105", code: "CS505", name: "Web Technologies", credits: 3, type: "Core", department: "CSE", status: "Enrolled" },
  { id: "c_106", code: "CS506", name: "Software Engineering", credits: 3, type: "Core", department: "CSE", status: "Enrolled" },
  
  // Available Electives for Registration
  { id: "el_201", code: "CSE511", name: "Machine Learning Fundamentals", credits: 3, type: "Elective", department: "CSE", status: "Available", seatsLeft: 14, instructor: "Dr. V. Reddy" },
  { id: "el_202", code: "CSE512", name: "Cloud Computing & DevOps", credits: 3, type: "Elective", department: "CSE", status: "Available", seatsLeft: 8, instructor: "Prof. N. Kulkarni" },
  { id: "el_203", code: "CSE513", name: "Cyber Security & Cryptography", credits: 3, type: "Elective", department: "CSE", status: "Available", seatsLeft: 5, instructor: "Dr. S. Mehta" },
  { id: "el_204", code: "CSE514", name: "Mobile Application Development (Flutter)", credits: 3, type: "Elective", department: "CSE", status: "Available", seatsLeft: 19, instructor: "Prof. A. Pillai" }
];

export const INITIAL_HALL_TICKET = {
  examSession: "Nov - Dec 2026 Regular End-Sem Examinations",
  hallTicketNumber: "HT-2023CSE042-S5",
  studentName: "Hanish Kumar",
  rollNumber: "2023CSE042",
  department: "Computer Science & Engineering",
  semester: "5",
  centerName: "Block B - Central Examination Building, Hall 204",
  issuedDate: "2026-07-20",
  status: "Issued",
  examSchedule: [
    { code: "CS501", subject: "Data Structures & Algorithms", date: "2026-11-15", time: "10:00 AM - 01:00 PM", room: "Hall 204", seatNo: "CSE-42" },
    { code: "CS502", subject: "Operating Systems", date: "2026-11-18", time: "10:00 AM - 01:00 PM", room: "Hall 204", seatNo: "CSE-42" },
    { code: "CS503", subject: "Database Management Systems", date: "2026-11-21", time: "10:00 AM - 01:00 PM", room: "Hall 204", seatNo: "CSE-42" },
    { code: "CS504", subject: "Computer Networks", date: "2026-11-24", time: "10:00 AM - 01:00 PM", room: "Hall 204", seatNo: "CSE-42" },
    { code: "CS505", subject: "Web Technologies", date: "2026-11-27", time: "10:00 AM - 01:00 PM", room: "Hall 204", seatNo: "CSE-42" },
    { code: "CS506", subject: "Software Engineering", date: "2026-11-30", time: "10:00 AM - 01:00 PM", room: "Hall 204", seatNo: "CSE-42" }
  ]
};

export const INITIAL_FEES = [
  { id: "fee_1", feeType: "Tuition Fee (Sem 5)", amount: 45000, paidAmount: 45000, dueDate: "2026-07-15", status: "Paid", receiptNo: "REC-2026-9912" },
  { id: "fee_2", feeType: "Exam Fee (End-Sem)", amount: 2500, paidAmount: 0, dueDate: "2026-08-10", status: "Pending", receiptNo: null },
  { id: "fee_3", feeType: "Hostel & Mess Charges", amount: 32000, paidAmount: 32000, dueDate: "2026-07-10", status: "Paid", receiptNo: "REC-2026-8810" },
  { id: "fee_4", feeType: "Library & Lab Facility Fee", amount: 3500, paidAmount: 3500, dueDate: "2026-07-01", status: "Paid", receiptNo: "REC-2026-7734" }
];

export const INITIAL_RESULTS = {
  cgpa: 8.75,
  totalCreditsEarned: 84,
  semesters: [
    { sem: 1, sgpa: 8.40, credits: 20, status: "Passed" },
    { sem: 2, sgpa: 8.65, credits: 20, status: "Passed" },
    { sem: 3, sgpa: 8.85, credits: 22, status: "Passed" },
    { sem: 4, sgpa: 9.10, credits: 22, status: "Passed" }
  ],
  currentSemesterSubjectMarks: [
    { code: "CS501", name: "Data Structures & Algorithms", credits: 4, internal: 28, midSem: 27, endSem: 42, total: 97, grade: "A+" },
    { code: "CS502", name: "Operating Systems", credits: 4, internal: 26, midSem: 25, endSem: 38, total: 89, grade: "A" },
    { code: "CS503", name: "Database Management Systems", credits: 4, internal: 29, midSem: 28, endSem: 41, total: 98, grade: "A+" },
    { code: "CS504", name: "Computer Networks", credits: 3, internal: 25, midSem: 24, endSem: 36, total: 85, grade: "A" },
    { code: "CS505", name: "Web Technologies", credits: 3, internal: 30, midSem: 29, endSem: 43, total: 102, grade: "O" },
    { code: "CS506", name: "Software Engineering", credits: 3, internal: 27, midSem: 26, endSem: 39, total: 92, grade: "A+" }
  ]
};

export const INITIAL_SERVICES = {
  leaves: [
    { id: "lv_1", type: "Medical Leave", from: "2026-07-04", to: "2026-07-06", days: 3, reason: "Viral fever and doctor advice for rest", status: "Approved", appliedOn: "2026-07-03" },
    { id: "lv_2", type: "Duty Leave", from: "2026-07-18", to: "2026-07-19", days: 2, reason: "Representing college in State Hackathon", status: "Approved", appliedOn: "2026-07-15" }
  ],
  leaveBalance: { casual: 5, medical: 5, duty: 3, usedCasual: 0, usedMedical: 3, usedDuty: 2 },
  certificates: [
    { id: "cert_1", type: "Bonafide Certificate", purpose: "Passport Application", requestedDate: "2026-07-10", status: "Ready for Pickup" },
    { id: "cert_2", type: "Fee Structure Certificate", purpose: "Education Loan", requestedDate: "2026-07-14", status: "In Processing" }
  ],
  hostel: {
    block: "Block B (Newton Hostel)",
    roomNo: "B-304",
    bedNo: "Bed 2",
    warden: "Mr. Suresh Kumar (+91 94444 33221)",
    messType: "Non-Veg Regular",
    status: "Allocated"
  },
  transport: {
    routeNo: "Route 14 (Electronic City - Campus)",
    busNo: "KA-01-F-4421",
    pickupPoint: "Silk Board Junction",
    pickupTime: "07:45 AM",
    status: "Active Pass"
  },
  library: {
    issuedBooks: [
      { title: "Introduction to Algorithms (Cormen)", code: "LIB-CS-991", dueDate: "2026-07-28" },
      { title: "Operating System Concepts (Silberschatz)", code: "LIB-CS-442", dueDate: "2026-08-02" }
    ],
    fineDue: 0
  }
};

export const INITIAL_COMPLAINTS_FEEDBACK = {
  complaints: [
    { id: "cmp_1", category: "Hostel", subject: "Wi-Fi Connectivity speed low in 3rd Floor", description: "Signal is dropping frequently in room B-304.", date: "2026-07-14", status: "Resolved", resolution: "Router reset and AP upgraded." },
    { id: "cmp_2", category: "Infrastructure", subject: "Projector flickering in Hall 301", description: "Display flickers during CS501 lectures.", date: "2026-07-19", status: "In Progress", resolution: "Technician assigned." }
  ],
  feedback: [
    { id: "fb_1", faculty: "Dr. A. Sharma", subject: "Data Structures", rating: 5, comments: "Excellent problem solving examples!" }
  ]
};

export const INITIAL_WEBINARS_EVENTS = [
  {
    id: "web_1",
    title: "Future of Generative AI & Large Language Models in Software Engineering",
    speaker: "Dr. Arvind Rao, Senior AI Researcher at Google DeepMind",
    date: "2026-07-26",
    time: "04:00 PM - 05:30 PM",
    platform: "Google Meet",
    category: "Webinar",
    status: "Registered",
    link: "https://meet.google.com/xyz-demo-link"
  },
  {
    id: "web_2",
    title: "Workshop on Building Cloud-Native Microservices with Docker & Kubernetes",
    speaker: "Karthik Subramanian, Principal Architect at AWS",
    date: "2026-07-29",
    time: "10:00 AM - 01:00 PM",
    platform: "Auditorium A & Live Stream",
    category: "Workshop",
    status: "Open",
    link: "https://youtube.com/live-demo-link"
  },
  {
    id: "web_3",
    title: "Career Masterclass: Cracking Product-Based Tech Interviews",
    speaker: "Sneha Reddy, Staff Engineer at Microsoft",
    date: "2026-08-02",
    time: "05:00 PM - 06:30 PM",
    platform: "Zoom",
    category: "Placement Talk",
    status: "Open",
    link: "https://zoom.us/j/demo-link"
  }
];

// Seed storage safely
export function initMockStudentStorage() {
  if (typeof window === "undefined") return;

  if (!localStorage.getItem("cms_student_profile")) {
    localStorage.setItem("cms_student_profile", JSON.stringify(INITIAL_STUDENT_PROFILE));
  }
  if (!localStorage.getItem("cms_student_notices")) {
    localStorage.setItem("cms_student_notices", JSON.stringify(INITIAL_NOTICES));
  }
  if (!localStorage.getItem("cms_student_timetable")) {
    localStorage.setItem("cms_student_timetable", JSON.stringify(INITIAL_TIMETABLE));
  }
  if (!localStorage.getItem("cms_student_lms")) {
    localStorage.setItem("cms_student_lms", JSON.stringify(INITIAL_LMS_COURSES));
  }
  if (!localStorage.getItem("cms_student_courses")) {
    localStorage.setItem("cms_student_courses", JSON.stringify(INITIAL_COURSES));
  }
  if (!localStorage.getItem("cms_student_hallticket")) {
    localStorage.setItem("cms_student_hallticket", JSON.stringify(INITIAL_HALL_TICKET));
  }
  if (!localStorage.getItem("cms_student_fees")) {
    localStorage.setItem("cms_student_fees", JSON.stringify(INITIAL_FEES));
  }
  if (!localStorage.getItem("cms_student_results")) {
    localStorage.setItem("cms_student_results", JSON.stringify(INITIAL_RESULTS));
  }
  if (!localStorage.getItem("cms_student_services")) {
    localStorage.setItem("cms_student_services", JSON.stringify(INITIAL_SERVICES));
  }
  if (!localStorage.getItem("cms_student_complaints")) {
    localStorage.setItem("cms_student_complaints", JSON.stringify(INITIAL_COMPLAINTS_FEEDBACK));
  }
  if (!localStorage.getItem("cms_student_webinars")) {
    localStorage.setItem("cms_student_webinars", JSON.stringify(INITIAL_WEBINARS_EVENTS));
  }
}

// Helpers to get and set local data
export function getMockData<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

export function setMockData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

// Mock Request Dispatcher for Axios Interceptor
export function processMockStudentRequest(url: string, method: string, data?: any): any {
  initMockStudentStorage();

  const cleanUrl = url.split("?")[0];

  // Auth me & login
  if (cleanUrl.endsWith("/api/auth/login")) {
    const profile = getMockData("cms_student_profile", INITIAL_STUDENT_PROFILE);
    const mockUser = {
      id: profile.id,
      fullName: profile.fullName,
      email: data?.email || profile.email,
      role: "student",
      department: profile.department
    };
    localStorage.setItem("cms_token", "mock_student_token_xyz999");
    localStorage.setItem("cms_user", JSON.stringify(mockUser));
    localStorage.setItem("campusly.role", "student");
    return {
      success: true,
      token: "mock_student_token_xyz999",
      user: mockUser
    };
  }

  if (cleanUrl.endsWith("/api/auth/me")) {
    const profile = getMockData("cms_student_profile", INITIAL_STUDENT_PROFILE);
    return {
      success: true,
      user: {
        id: profile.id,
        fullName: profile.fullName,
        email: profile.email,
        role: "student",
        department: profile.department
      }
    };
  }

  // Dashboard API
  if (cleanUrl.includes("/api/student-module/dashboard")) {
    const profile = getMockData("cms_student_profile", INITIAL_STUDENT_PROFILE);
    const notices = getMockData("cms_student_notices", INITIAL_NOTICES);
    const fees = getMockData("cms_student_fees", INITIAL_FEES);
    const results = getMockData("cms_student_results", INITIAL_RESULTS);

    const pendingFees = fees.filter(f => f.status !== "Paid").reduce((acc, f) => acc + (f.amount - f.paidAmount), 0);

    return {
      success: true,
      data: {
        profile,
        stats: [
          { label: "Overall Attendance", value: `${profile.attendancePercentage}%`, tone: profile.attendancePercentage >= 75 ? "success" : "danger" },
          { label: "Current CGPA", value: String(profile.cgpa), tone: "info" },
          { label: "Earned Credits", value: `${results.totalCreditsEarned}/120`, tone: "info" },
          { label: "Fee Dues", value: `₹${pendingFees.toLocaleString('en-IN')}`, tone: pendingFees > 0 ? "warn" : "success" }
        ],
        notifications: notices,
        activities: [
          { id: "act_1", text: "Submitted DBMS Assignment #4", date: "2 hours ago" },
          { id: "act_2", text: "Paid Semester V Tuition Fee Receipt #REC-9912", date: "1 day ago" },
          { id: "act_3", text: "Registered for Generative AI Webinar", date: "3 days ago" }
        ]
      }
    };
  }

  // Profile API
  if (cleanUrl.includes("/api/student-module/profile")) {
    if (method.toUpperCase() === "PUT" && data) {
      const current = getMockData("cms_student_profile", INITIAL_STUDENT_PROFILE);
      const updated = { ...current, ...data };
      setMockData("cms_student_profile", updated);
      return { success: true, data: updated, message: "Profile updated successfully" };
    }
    return { success: true, data: getMockData("cms_student_profile", INITIAL_STUDENT_PROFILE) };
  }

  // Notices API
  if (cleanUrl.includes("/api/student-module/notices")) {
    return { success: true, data: getMockData("cms_student_notices", INITIAL_NOTICES) };
  }

  // Timetable API
  if (cleanUrl.includes("/api/student-module/timetable")) {
    return { success: true, data: getMockData("cms_student_timetable", INITIAL_TIMETABLE) };
  }

  // LMS & Assignments API
  if (cleanUrl.includes("/api/student-module/assignments/submit/")) {
    const id = cleanUrl.split("/").pop();
    const lms = getMockData("cms_student_lms", INITIAL_LMS_COURSES);
    let found = false;
    lms.forEach(c => {
      c.assignments.forEach(a => {
        if (a.id === id || a.id === `asg_${id}`) {
          a.status = "Submitted";
          found = true;
        }
      });
    });
    if (found) setMockData("cms_student_lms", lms);
    return { success: true, message: "Assignment submitted successfully!" };
  }

  if (cleanUrl.includes("/api/student-module/assignments") || cleanUrl.includes("/api/student-module/lms")) {
    const lms = getMockData("cms_student_lms", INITIAL_LMS_COURSES);
    const allAssignments: any[] = [];
    lms.forEach(c => {
      c.assignments.forEach(a => {
        allAssignments.push({
          ...a,
          subject: c.name,
          courseCode: c.code,
          submitted: a.status === "Submitted" || a.status === "Graded"
        });
      });
    });
    return { success: true, data: allAssignments, courses: lms };
  }

  // Courses API
  if (cleanUrl.includes("/api/student-module/courses") || cleanUrl.includes("/api/exams/courses")) {
    const courses = getMockData("cms_student_courses", INITIAL_COURSES);
    if (method.toUpperCase() === "POST" && data?.courseId) {
      const updated = courses.map(c => {
        if (c.id === data.courseId) return { ...c, status: c.status === "Enrolled" ? "Available" : "Enrolled" };
        return c;
      });
      setMockData("cms_student_courses", updated);
      return { success: true, data: updated, message: "Course status updated successfully" };
    }
    return { success: true, data: courses };
  }

  // Hall Ticket API
  if (cleanUrl.includes("/api/student-module/hall-ticket")) {
    return { success: true, data: getMockData("cms_student_hallticket", INITIAL_HALL_TICKET) };
  }

  // Fees API
  if (cleanUrl.includes("/api/student-module/fees") || cleanUrl.includes("/api/fees/student/")) {
    if (method.toUpperCase() === "POST" && data?.feeId) {
      const fees = getMockData("cms_student_fees", INITIAL_FEES);
      const updated = fees.map(f => {
        if (f.id === data.feeId) {
          return {
            ...f,
            status: "Paid",
            paidAmount: f.amount,
            receiptNo: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`
          };
        }
        return f;
      });
      setMockData("cms_student_fees", updated);
      return { success: true, data: updated, message: "Payment processed successfully" };
    }
    const fees = getMockData("cms_student_fees", INITIAL_FEES);
    return {
      success: true,
      data: {
        fees,
        summary: {
          totalPaid: fees.filter(f => f.status === "Paid").reduce((sum, f) => sum + f.paidAmount, 0),
          totalRemaining: fees.filter(f => f.status !== "Paid").reduce((sum, f) => sum + (f.amount - f.paidAmount), 0),
          overdueCount: fees.filter(f => f.status === "Overdue").length
        }
      }
    };
  }

  // Results API
  if (cleanUrl.includes("/api/student-module/results")) {
    return { success: true, data: getMockData("cms_student_results", INITIAL_RESULTS) };
  }

  // Attendance API
  if (cleanUrl.includes("/api/attendance/student/")) {
    const profile = getMockData("cms_student_profile", INITIAL_STUDENT_PROFILE);
    return {
      success: true,
      data: {
        stats: {
          percentage: profile.attendancePercentage,
          present: 42,
          absent: 5,
          total: 47
        },
        subjectWise: [
          { subject: "Data Structures & Algorithms", percentage: 92, present: 18, total: 19 },
          { subject: "Operating Systems", percentage: 85, present: 14, total: 16 },
          { subject: "Database Management Systems", percentage: 90, present: 15, total: 17 },
          { subject: "Web Technologies", percentage: 82, present: 13, total: 16 }
        ],
        records: [
          { date: "2026-07-20", subject: "Data Structures", time: "09:00 AM", status: "Present" },
          { date: "2026-07-20", subject: "Operating Systems", time: "10:15 AM", status: "Present" },
          { date: "2026-07-19", subject: "Web Technologies", time: "09:00 AM", status: "Absent" },
          { date: "2026-07-19", subject: "Database Systems", time: "11:30 AM", status: "Present" }
        ]
      }
    };
  }

  // Services API
  if (cleanUrl.includes("/api/student-module/services") || cleanUrl.includes("/api/student-module/leave")) {
    const services = getMockData("cms_student_services", INITIAL_SERVICES);
    if (method.toUpperCase() === "POST") {
      if (data?.leaveType || data?.type) {
        const newLeave = {
          id: `lv_${Date.now()}`,
          type: data.leaveType || data.type || "Casual Leave",
          from: data.from,
          to: data.to,
          days: data.days || 1,
          reason: data.reason,
          status: "Pending",
          appliedOn: new Date().toISOString().split("T")[0]
        };
        services.leaves.unshift(newLeave);
        setMockData("cms_student_services", services);
        return { success: true, data: services.leaves, message: "Leave request submitted successfully" };
      }
      if (data?.certificateType) {
        const newCert = {
          id: `cert_${Date.now()}`,
          type: data.certificateType,
          purpose: data.purpose || "General Purpose",
          requestedDate: new Date().toISOString().split("T")[0],
          status: "In Processing"
        };
        services.certificates.unshift(newCert);
        setMockData("cms_student_services", services);
        return { success: true, data: services.certificates, message: "Certificate requested successfully" };
      }
    }
    return { success: true, data: services };
  }

  // Complaints & Feedback API
  if (cleanUrl.includes("/api/student-module/complaints") || cleanUrl.includes("/api/student-module/feedback")) {
    const cf = getMockData("cms_student_complaints", INITIAL_COMPLAINTS_FEEDBACK);
    if (method.toUpperCase() === "POST") {
      if (data?.category && data?.subject) {
        const newCmp = {
          id: `cmp_${Date.now()}`,
          category: data.category,
          subject: data.subject,
          description: data.description,
          date: new Date().toISOString().split("T")[0],
          status: "In Progress",
          resolution: "Assigned to administrator for review."
        };
        cf.complaints.unshift(newCmp);
        setMockData("cms_student_complaints", cf);
        return { success: true, data: cf.complaints, message: "Complaint filed successfully" };
      }
      if (data?.faculty && data?.rating) {
        const newFb = {
          id: `fb_${Date.now()}`,
          faculty: data.faculty,
          subject: data.subject || "Course",
          rating: data.rating,
          comments: data.comments
        };
        cf.feedback.push(newFb);
        setMockData("cms_student_complaints", cf);
        return { success: true, data: cf.feedback, message: "Feedback submitted successfully" };
      }
    }
    return { success: true, data: cf };
  }

  // Webinars & Events API
  if (cleanUrl.includes("/api/student-module/webinars") || cleanUrl.includes("/api/student-module/events")) {
    const webs = getMockData("cms_student_webinars", INITIAL_WEBINARS_EVENTS);
    if (method.toUpperCase() === "POST" && data?.webinarId) {
      const updated = webs.map(w => {
        if (w.id === data.webinarId) return { ...w, status: w.status === "Registered" ? "Open" : "Registered" };
        return w;
      });
      setMockData("cms_student_webinars", updated);
      return { success: true, data: updated, message: "Webinar registration updated!" };
    }
    return { success: true, data: webs };
  }

  // Default fallback response
  return { success: true, data: [], message: "Mock data returned" };
}
