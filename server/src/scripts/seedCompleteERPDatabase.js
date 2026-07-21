import pkg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { Client } = pkg;
const connectionString = process.env.DATABASE_URL;
const isLocalDatabase =
  connectionString?.includes('localhost') ||
  connectionString?.includes('127.0.0.1') ||
  connectionString?.includes('host.docker.internal');

console.log("==================================================");
console.log("🚀 STARTING COMPLETE UNIVERSITY ERP DATABASE SEEDING");
console.log("==================================================");

// Target counts
const TARGET = {
  depts: 6,
  students: 55,
  faculty: 22,
  subjects: 42,
  attendance: 320,
  assignments: 160,
  fees: 85,
  books: 310,
  notifications: 105,
  leaves: 52,
  complaints: 45,
  research: 22,
  iqac: 16,
  placementCompanies: 32
};

const DEPARTMENTS = [
  { code: 'CSE', name: 'Computer Science & Engineering', head: 'Dr. Srinivas Rao', budget: '₹45L' },
  { code: 'AIML', name: 'Artificial Intelligence & Machine Learning', head: 'Dr. Rajesh Kumar', budget: '₹35L' },
  { code: 'AIDS', name: 'Artificial Intelligence & Data Science', head: 'Dr. Vikram Rao', budget: '₹30L' },
  { code: 'ECE', name: 'Electronics & Communication Engineering', head: 'Prof. Ramana Murthy', budget: '₹38L' },
  { code: 'EEE', name: 'Electrical & Electronics Engineering', head: 'Dr. Venkat Rao', budget: '₹28L' },
  { code: 'MECH', name: 'Mechanical Engineering', head: 'Dr. Suresh Varma', budget: '₹32L' }
];

const FIRST_NAMES = ['Aarav', 'Ananya', 'Aditya', 'Bhavya', 'Charan', 'Divya', 'Ethan', 'Farhan', 'Gautam', 'Hanish', 'Ishaan', 'Jaya', 'Karthik', 'Kavya', 'Kalyan', 'Lahari', 'Mahesh', 'Neha', 'Nikhil', 'Pooja', 'Priya', 'Rahul', 'Rohan', 'Sai', 'Sneha', 'Siddharth', 'Tanvi', 'Tarun', 'Utkarsh', 'Varun', 'Vikram', 'Yash', 'Zoya', 'Deepak', 'Meera', 'Ramesh', 'Harish', 'Tejaswini', 'Sri', 'Pradeep', 'Ramya', 'Naveen', 'Sravani', 'Bhanu', 'Sandhya', 'Keerthi', 'Akhil', 'Laxmi', 'Sreedhar', 'Sanjay', 'Deepa', 'Srinivas', 'Kumar', 'Rajesh', 'Anil', 'Ramana', 'Krishna', 'Venkat'];
const LAST_NAMES = ['Sharma', 'Reddy', 'Patel', 'Verma', 'Kaur', 'Rao', 'Naidu', 'Chowdhary', 'Vavilapalli', 'Malhotra', 'Babu', 'Prasad', 'Gupta', 'Nair', 'Mehta', 'Swamy', 'Prasanna', 'Kumar', 'Darshini', 'Murthy', 'Reddy', 'Chakravarthy', 'Joshi', 'Singh', 'Deshmukh'];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function runCompleteERPSeeder() {
  let client = null;
  if (connectionString) {
    try {
      client = new Client({
        connectionString,
        ssl: isLocalDatabase ? false : { rejectUnauthorized: false },
        connectionTimeoutMillis: 2000
      });
      await client.connect();
      console.log("✅ Connected to PostgreSQL database server.");
    } catch (err) {
      console.log("ℹ️ Live PostgreSQL server not responding. Falling back to persistent file DB seeding.");
      client = null;
    }
  }

  const mockDbPath = path.join(__dirname, '../config/mock_db.json');
  let mockDb = {};
  if (fs.existsSync(mockDbPath)) {
    try {
      mockDb = JSON.parse(fs.readFileSync(mockDbPath, 'utf8'));
    } catch (e) {}
  }

  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash("password123", salt);

  try {
    // Prepare arrays for seeding
    const usersList = [];
    const studentsList = [];
    const facultyList = [];
    const subjectsList = [];
    const attendanceList = [];
    const assignmentsList = [];
    const feesList = [];
    const booksList = [];
    const notificationsList = [];
    const leavesList = [];
    const complaintsList = [];
    const placementList = [];

    // 1. Core Users
    const executiveUsers = [
      { name: 'Super Admin', email: 'superadmin@college.com', role: 'super-admin' },
      { name: 'System Admin', email: 'admin@college.com', role: 'admin' },
      { name: 'Dr. Srinivas Rao (Dean Academics)', email: 'dean@college.com', role: 'dean' },
      { name: 'Dr. Suresh Varma (Principal)', email: 'principal@college.com', role: 'principal' },
      { name: 'Accounts Manager', email: 'accounts@college.com', role: 'accounts' },
      { name: 'Exam Cell Officer', email: 'examcell@college.com', role: 'exam-cell' },
      { name: 'Librarian Head', email: 'librarian@college.com', role: 'librarian' },
      { name: 'Placement Officer', email: 'placement@college.com', role: 'placement-officer' },
      { name: 'Hostel Chief Warden', email: 'warden@college.com', role: 'hostel-warden' },
      { name: 'Transport Fleet Manager', email: 'transport@college.com', role: 'transport-manager' },
      { name: 'HOD CSE', email: 'hod@college.com', role: 'hod' }
    ];

    executiveUsers.forEach(u => {
      usersList.push({
        id: `exec-${u.role}-uuid`,
        full_name: u.name,
        name: u.name,
        email: u.email,
        password: defaultPasswordHash,
        role: u.role,
        is_verified: true,
        is_active: true
      });
    });

    // 2. Seed Faculty (Target: 22)
    for (let i = 1; i <= TARGET.faculty; i++) {
      const dept = DEPARTMENTS[(i - 1) % DEPARTMENTS.length];
      const name = `Dr. ${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`;
      const email = `faculty${i}@college.com`;
      const empId = `FAC_${dept.code}_${100 + i}`;
      const userId = `fac-user-${i}-uuid`;
      const facId = `fac-prof-${i}-uuid`;

      usersList.push({
        id: userId,
        full_name: name,
        name: name,
        email: email,
        password: defaultPasswordHash,
        role: 'faculty',
        is_verified: true,
        is_active: true
      });

      facultyList.push({
        id: facId,
        user_id: userId,
        full_name: name,
        email: email,
        employee_id: empId,
        department: dept.code,
        designation: i % 3 === 0 ? 'Professor' : (i % 2 === 0 ? 'Associate Professor' : 'Assistant Professor'),
        experience: getRandomInt(4, 20),
        status: 'Active',
        attendance_percentage: getRandomInt(88, 99),
        is_active: true
      });
    }

    // 3. Seed Students & Parents (Target: 55)
    for (let i = 1; i <= TARGET.students; i++) {
      const dept = DEPARTMENTS[(i - 1) % DEPARTMENTS.length];
      const firstName = FIRST_NAMES[(i - 1) % FIRST_NAMES.length];
      const lastName = LAST_NAMES[(i - 1) % LAST_NAMES.length];
      const name = `${firstName} ${lastName}`;
      const email = `student${i}@college.com`;
      const rollNumber = `${dept.code}2026${100 + i}`;
      const userId = `student-user-${i}-uuid`;
      const studentId = `student-prof-${i}-uuid`;
      const parentName = `${firstName}'s Parent`;
      const parentEmail = `parent${i}@college.com`;

      usersList.push({
        id: userId,
        full_name: name,
        name: name,
        email: email,
        password: defaultPasswordHash,
        role: 'student',
        is_verified: true,
        is_active: true
      });

      usersList.push({
        id: `parent-user-${i}-uuid`,
        full_name: parentName,
        name: parentName,
        email: parentEmail,
        password: defaultPasswordHash,
        role: 'parent',
        child_email: email,
        is_verified: true,
        is_active: true
      });

      const cgpa = (7.0 + (i % 30) * 0.1).toFixed(1);
      const att = getRandomInt(65, 98);

      studentsList.push({
        id: studentId,
        user_id: userId,
        full_name: name,
        roll_number: rollNumber,
        admission_number: `26${dept.code}${100 + i}`,
        email: email,
        phone_number: `98765${String(10000 + i).slice(1)}`,
        gender: i % 2 === 0 ? 'Female' : 'Male',
        date_of_birth: `2004-0${(i % 9) + 1}-15`,
        department: dept.code,
        year: (i % 4) + 1,
        semester: ((i % 4) * 2) + 1,
        section: i % 2 === 0 ? 'B' : 'A',
        address: `${100 + i} University Residency, Campus View`,
        parent_name: parentName,
        parent_phone: `91234${String(10000 + i).slice(1)}`,
        parent_email: parentEmail,
        cgpa: parseFloat(cgpa),
        attendance_percentage: parseFloat(att),
        is_active: true
      });

      feesList.push({
        id: `fee-tuit-${i}-uuid`,
        student: studentId,
        amount: 55000,
        type: 'Tuition Fee',
        due_date: '2026-08-31',
        status: i % 4 === 0 ? 'Paid' : 'Unpaid',
        paid_amount: i % 4 === 0 ? 55000 : 0,
        payment_date: i % 4 === 0 ? '2026-05-12' : null,
        academic_year: '2025-2026',
        semester: ((i % 4) * 2) + 1
      });

      if (i % 3 === 0) {
        feesList.push({
          id: `fee-spec-${i}-uuid`,
          student: studentId,
          amount: 8500,
          type: 'Hostel & Mess Fee',
          due_date: '2026-08-15',
          status: 'Paid',
          paid_amount: 8500,
          payment_date: '2026-05-10',
          academic_year: '2025-2026',
          semester: ((i % 4) * 2) + 1
        });
      }
    }

    // 4. Seed Subjects (Target: 42)
    for (let i = 1; i <= TARGET.subjects; i++) {
      const dept = DEPARTMENTS[(i - 1) % DEPARTMENTS.length];
      const code = `${dept.code}${300 + i}`;
      const name = `${dept.name.split(' ')[0]} Module ${i}`;
      subjectsList.push({
        code,
        name,
        department: dept.code,
        semester: `Semester ${(i % 8) + 1}`,
        credits: (i % 2 === 0) ? 4 : 3,
        status: 'Active',
        is_active: true
      });
    }

    // 5. Seed Attendance (Target: 320)
    for (let i = 1; i <= TARGET.attendance; i++) {
      const student = studentsList[(i - 1) % studentsList.length];
      const subject = subjectsList[(i - 1) % subjectsList.length];
      attendanceList.push({
        id: `att-rec-${i}-uuid`,
        student: student.id,
        date: `2026-05-${String((i % 25) + 1).padStart(2, '0')}`,
        status: i % 5 === 0 ? 'Absent' : 'Present',
        subject: subject.name,
        remarks: i % 5 === 0 ? 'Medical Intimation' : 'Regular'
      });
    }

    // 6. Seed Assignments (Target: 160)
    for (let i = 1; i <= TARGET.assignments; i++) {
      const dept = DEPARTMENTS[(i - 1) % DEPARTMENTS.length];
      const subject = subjectsList[(i - 1) % subjectsList.length];
      const faculty = facultyList[(i - 1) % facultyList.length];
      assignmentsList.push({
        id: `assign-${i}-uuid`,
        title: `${subject.name}: Laboratory Task ${i}`,
        description: `Comprehensive problem set and implementation guide for ${subject.name}.`,
        subject: subject.name,
        due_date: new Date(Date.now() + (i % 14 + 1) * 24 * 60 * 60 * 1000).toISOString(),
        department: dept.code,
        year: (i % 4) + 1,
        semester: (i % 8) + 1,
        section: i % 2 === 0 ? 'A' : 'B',
        faculty: faculty.user_id,
        submissions: []
      });
    }

    // 7. Seed Library Books (Target: 310)
    for (let i = 1; i <= TARGET.books; i++) {
      const dept = DEPARTMENTS[(i - 1) % DEPARTMENTS.length];
      booksList.push({
        id: `book-${i}-uuid`,
        title: `Handbook of ${dept.name} Vol. ${i}`,
        author: `Prof. ${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`,
        isbn: `987-0-${getRandomInt(1000, 9999)}-${getRandomInt(100, 999)}-${i % 10}`,
        category: dept.name,
        quantity: 10,
        available_quantity: 8,
        shelf_location: `${dept.code}-Rack-${(i % 12) + 1}`,
        publisher: 'IEEE Academic Press',
        edition: '4th Edition',
        language: 'English',
        description: `Reference text for advanced university curriculum in ${dept.name}.`,
        is_active: true
      });
    }

    // 8. Seed Notifications (Target: 105)
    for (let i = 1; i <= TARGET.notifications; i++) {
      notificationsList.push({
        id: `notif-${i}-uuid`,
        title: `University Announcement #${i}: Academic Calendar Update`,
        message: `Official notification regarding upcoming examination schedules, mid-term evaluations, and campus events.`,
        type: i % 3 === 0 ? 'Urgent' : 'General',
        created_at: new Date(Date.now() - (i * 3600 * 1000)).toISOString(),
        is_read: i % 2 === 0
      });
    }

    // 9. Seed Leave Requests & Approvals (Target: 52)
    for (let i = 1; i <= TARGET.leaves; i++) {
      const user = usersList[i % usersList.length];
      leavesList.push({
        id: `leave-${i}-uuid`,
        user_id: user.id,
        type: i % 2 === 0 ? 'Medical Leave' : 'Academic Duty Leave',
        from_date: `2026-06-01`,
        to_date: `2026-06-03`,
        days: 3,
        reason: `Conference presentation and academic delegation review.`,
        status: i % 3 === 0 ? 'Pending' : (i % 2 === 0 ? 'Approved' : 'Rejected'),
        comments: i % 3 === 0 ? 'Under review by HOD' : 'Sanctioned by Dean.'
      });
    }

    // 10. Seed Complaints / IMA Tickets (Target: 45)
    for (let i = 1; i <= TARGET.complaints; i++) {
      const user = usersList[i % usersList.length];
      complaintsList.push({
        id: `comp-${i}-uuid`,
        title: `IMA Maintenance Ticket #${1000 + i}: Lab Hardware Service`,
        description: `System diagnostics reported ethernet port connectivity failure in Block B, Station ${i}.`,
        category: i % 2 === 0 ? 'IT Infrastructure' : 'Electrical Service',
        user_id: user.id,
        status: i % 3 === 0 ? 'Pending' : 'Resolved',
        remarks: i % 3 === 0 ? 'Technician assigned' : 'Hardware replaced and tested.'
      });
    }

    // 11. Seed Placement Companies (Target: 32)
    for (let i = 1; i <= TARGET.placementCompanies; i++) {
      placementList.push({
        id: `comp-drive-${i}-uuid`,
        name: `Tech Partner Corp #${i}`,
        industry: i % 2 === 0 ? 'Enterprise Software' : 'FinTech & Banking',
        hr_contact: `HR Manager ${getRandomElement(FIRST_NAMES)}`,
        email: `careers${i}@techcorp.com`,
        phone: `9876543${String(100 + i)}`,
        package_amount: `${(8 + (i % 15) * 1.5).toFixed(1)} LPA`,
        previous_hires: getRandomInt(5, 30),
        is_active: true
      });
    }

    // If PostgreSQL client is connected
    if (client) {
      console.log("⚡ Executing direct PostgreSQL table insertion...");
      await client.query("CREATE TABLE IF NOT EXISTS subjects (code varchar(50) PRIMARY KEY, name varchar(255) NOT NULL, department varchar(255) NOT NULL, semester varchar(50), credits integer, status varchar(50), is_active boolean, created_at timestamp default now(), updated_at timestamp default now());");

      for (const d of DEPARTMENTS) {
        await client.query("INSERT INTO departments (code, name, head_of_department, is_active) VALUES ($1, $2, $3, true) ON CONFLICT DO NOTHING;", [d.code, d.name, d.head]);
      }
      for (const s of subjectsList) {
        await client.query("INSERT INTO subjects (code, name, department, semester, credits, status, is_active) VALUES ($1, $2, $3, $4, $5, $6, true) ON CONFLICT DO NOTHING;", [s.code, s.name, s.department, s.semester, s.credits, s.status]);
      }
      console.log(`✅ Direct PostgreSQL tables seeded!`);
    }

    // Save to File-backed Mock DB as well to guarantee instant local access across all backend routes
    mockDb.users = usersList;
    mockDb.students = studentsList;
    mockDb.faculty = facultyList;
    mockDb.departments = DEPARTMENTS.map(d => ({ id: `dept-${d.code}`, code: d.code, name: d.name, head_of_department: d.head, is_active: true }));
    mockDb.subjects = subjectsList;
    mockDb.attendance = attendanceList;
    mockDb.assignments = assignmentsList;
    mockDb.fees = feesList;
    mockDb.books = booksList;
    mockDb.notifications = notificationsList;
    mockDb.leave_requests = leavesList;
    mockDb.complaints = complaintsList;
    mockDb.placement_companies = placementList;

    fs.writeFileSync(mockDbPath, JSON.stringify(mockDb, null, 2), 'utf8');

    console.log("\n==================================================");
    console.log("🎉 ENTERPRISE UNIVERSITY ERP DATABASE SEEDED SUCCESSFULLY!");
    console.log("--------------------------------------------------");
    console.log(`- Departments: ${DEPARTMENTS.length}`);
    console.log(`- Users: ${usersList.length}`);
    console.log(`- Students: ${studentsList.length}`);
    console.log(`- Faculty: ${facultyList.length}`);
    console.log(`- Subjects: ${subjectsList.length}`);
    console.log(`- Attendance Records: ${attendanceList.length}`);
    console.log(`- Assignments: ${assignmentsList.length}`);
    console.log(`- Fee Transaction Records: ${feesList.length}`);
    console.log(`- Library Books: ${booksList.length}`);
    console.log(`- Notifications: ${notificationsList.length}`);
    console.log(`- Leave Requests: ${leavesList.length}`);
    console.log(`- Complaints / IMA Tickets: ${complaintsList.length}`);
    console.log(`- Placement Partner Companies: ${placementList.length}`);
    console.log("==================================================");

  } catch (err) {
    console.error("❌ Seeding Error:", err);
  } finally {
    if (client) {
      try { await client.end(); } catch (e) {}
    }
  }
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('seedCompleteERPDatabase.js')) {
  runCompleteERPSeeder();
}
