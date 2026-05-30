import pkg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;
const connectionString = process.env.DATABASE_URL;

const DEPARTMENTS = [
  { code: 'CSE', name: 'Computer Science & Engineering', head: 'Dr. Srinivas Rao', budget: '₹32L' },
  { code: 'AIML', name: 'Artificial Intelligence & Machine Learning', head: 'Dr. Rajesh Kumar', budget: '₹22L' },
  { code: 'AIDS', name: 'Artificial Intelligence & Data Science', head: 'Dr. Vikram Rao', budget: '₹18L' },
  { code: 'ECE', name: 'Electronics & Communication Engineering', head: 'Prof. Ramana Murthy', budget: '₹24L' },
  { code: 'EEE', name: 'Electrical & Electronics Engineering', head: 'Dr. Venkat Rao', budget: '₹18L' }
];

const FACULTY = [
  // CSE
  { email: 'srinivas.faculty@gmail.com', name: 'Dr. Srinivas Rao', code: 'CSE', empId: 'FAC_CSE_01', desig: 'Professor' },
  { email: 'kumar.faculty@gmail.com', name: 'Dr. Kumar Swamy', code: 'CSE', empId: 'FAC_CSE_02', desig: 'Assistant Professor' },
  // AIML
  { email: 'rajesh.faculty@gmail.com', name: 'Dr. Rajesh Kumar', code: 'AIML', empId: 'FAC_AIML_01', desig: 'Professor' },
  { email: 'laxmi.faculty@gmail.com', name: 'Dr. Laxmi Prasanna', code: 'AIML', empId: 'FAC_AIML_02', desig: 'Assistant Professor' },
  // AIDS
  { email: 'anil.faculty@gmail.com', name: 'Dr. Anil Kumar', code: 'AIDS', empId: 'FAC_AIDS_01', desig: 'Professor' },
  { email: 'priya.faculty@gmail.com', name: 'Dr. Priya Darshini', code: 'AIDS', empId: 'FAC_AIDS_02', desig: 'Assistant Professor' },
  // ECE
  { email: 'ramana.faculty@gmail.com', name: 'Dr. Ramana Murthy', code: 'ECE', empId: 'FAC_ECE_01', desig: 'Professor' },
  { email: 'krishna.faculty@gmail.com', name: 'Dr. Krishna Reddy', code: 'ECE', empId: 'FAC_ECE_02', desig: 'Assistant Professor' },
  // EEE
  { email: 'venkat.faculty@gmail.com', name: 'Dr. Venkat Rao', code: 'EEE', empId: 'FAC_EEE_01', desig: 'Professor' },
  { email: 'sreedhar.faculty@gmail.com', name: 'Dr. Sreedhar Reddy', code: 'EEE', empId: 'FAC_EEE_02', desig: 'Assistant Professor' }
];

const SUBJECTS = [
  // CSE
  { code: 'CS501', name: 'Data Structures', dept: 'CSE' },
  { code: 'CS502', name: 'Algorithms', dept: 'CSE' },
  { code: 'CS503', name: 'Database Systems', dept: 'CSE' },
  { code: 'CS504', name: 'Web Technologies', dept: 'CSE' },
  { code: 'CS505', name: 'Operating Systems', dept: 'CSE' },
  // AIML
  { code: 'AM501', name: 'Machine Learning', dept: 'AIML' },
  { code: 'AM502', name: 'Artificial Intelligence', dept: 'AIML' },
  { code: 'AM503', name: 'Python Programming', dept: 'AIML' },
  { code: 'AM504', name: 'Data Visualization', dept: 'AIML' },
  { code: 'AM505', name: 'Neural Networks', dept: 'AIML' },
  // AIDS
  { code: 'AD501', name: 'Data Science Foundations', dept: 'AIDS' },
  { code: 'AD502', name: 'Big Data Analytics', dept: 'AIDS' },
  { code: 'AD503', name: 'Statistical Methods', dept: 'AIDS' },
  { code: 'AD504', name: 'Data Mining', dept: 'AIDS' },
  { code: 'AD505', name: 'Deep Learning', dept: 'AIDS' },
  // ECE
  { code: 'EC501', name: 'Digital Electronics', dept: 'ECE' },
  { code: 'EC502', name: 'Microprocessors', dept: 'ECE' },
  { code: 'EC503', name: 'Analog Communications', dept: 'ECE' },
  { code: 'EC504', name: 'Signals and Systems', dept: 'ECE' },
  { code: 'EC505', name: 'VLSI Design', dept: 'ECE' },
  // EEE
  { code: 'EE501', name: 'Electrical Circuits', dept: 'EEE' },
  { code: 'EE502', name: 'Power Systems', dept: 'EEE' },
  { code: 'EE503', name: 'Control Systems', dept: 'EEE' },
  { code: 'EE504', name: 'Electrical Machines', dept: 'EEE' },
  { code: 'EE505', name: 'Power Electronics', dept: 'EEE' }
];

const STUDENTS_RAW = [
  // CSE
  { name: 'Hanish Vavilapalli', email: 'hanish@gmail.com', roll: 'CS2026101', adm: '26CSE01', dept: 'CSE', type: 'Hostel' },
  { name: 'Ramesh Kumar', email: 'ramesh@gmail.com', roll: 'CS2026102', adm: '26CSE02', dept: 'CSE', type: 'Bus' },
  { name: 'Sai Kiran', email: 'saikiran@gmail.com', roll: 'CS2026103', adm: '26CSE03', dept: 'CSE', type: 'Scholar' },
  { name: 'Charan Tej', email: 'charantej@gmail.com', roll: 'CS2026104', adm: '26CSE04', dept: 'CSE', type: 'Scholar' },
  { name: 'Lahari Priya', email: 'laharipriya@gmail.com', roll: 'CS2026105', adm: '26CSE05', dept: 'CSE', type: 'Scholar' },
  // AIML
  { name: 'Ananya Reddy', email: 'ananya@gmail.com', roll: 'AM2026101', adm: '26AIML01', dept: 'AIML', type: 'Hostel' },
  { name: 'Bhavya Sri', email: 'bhavyasri@gmail.com', roll: 'AM2026102', adm: '26AIML02', dept: 'AIML', type: 'Bus' },
  { name: 'Akhil Kumar', email: 'akhil@gmail.com', roll: 'AM2026103', adm: '26AIML03', dept: 'AIML', type: 'Scholar' },
  { name: 'Venkatesh Prasad', email: 'venkatesh@gmail.com', roll: 'AM2026104', adm: '26AIML04', dept: 'AIML', type: 'Scholar' },
  { name: 'Divya Teja', email: 'divya@gmail.com', roll: 'AM2026105', adm: '26AIML05', dept: 'AIML', type: 'Scholar' },
  // AIDS
  { name: 'Karthik Reddy', email: 'karthik@gmail.com', roll: 'AD2026101', adm: '26AIDS01', dept: 'AIDS', type: 'Hostel' },
  { name: 'Sri Lekha', email: 'srilekha@gmail.com', roll: 'AD2026102', adm: '26AIDS02', dept: 'AIDS', type: 'Bus' },
  { name: 'Harish Rao', email: 'harishrao@gmail.com', roll: 'AD2026103', adm: '26AIDS03', dept: 'AIDS', type: 'Scholar' },
  { name: 'Tejaswini Naidu', email: 'tejaswini@gmail.com', roll: 'AD2026104', adm: '26AIDS04', dept: 'AIDS', type: 'Scholar' },
  { name: 'Sai Teja', email: 'saiteja@gmail.com', roll: 'AD2026105', adm: '26AIDS05', dept: 'AIDS', type: 'Scholar' },
  // ECE
  { name: 'Tarun Kumar', email: 'tarun@gmail.com', roll: 'EC2026101', adm: '26ECE01', dept: 'ECE', type: 'Hostel' },
  { name: 'Bhanu Prasad', email: 'bhanu@gmail.com', roll: 'EC2026102', adm: '26ECE02', dept: 'ECE', type: 'Bus' },
  { name: 'Sandhya Rani', email: 'sandhya@gmail.com', roll: 'EC2026103', adm: '26ECE03', dept: 'ECE', type: 'Scholar' },
  { name: 'Kalyan Chakravarthy', email: 'kalyan@gmail.com', roll: 'EC2026104', adm: '26ECE04', dept: 'ECE', type: 'Scholar' },
  { name: 'Keerthi Reddy', email: 'keerthi@gmail.com', roll: 'EC2026105', adm: '26ECE05', dept: 'ECE', type: 'Scholar' },
  // EEE
  { name: 'Pradeep Kumar', email: 'pradeep@gmail.com', roll: 'EE2026101', adm: '26EEE01', dept: 'EEE', type: 'Hostel' },
  { name: 'Ramya Sri', email: 'ramyasri@gmail.com', roll: 'EE2026102', adm: '26EEE02', dept: 'EEE', type: 'Bus' },
  { name: 'Naveen Chandra', email: 'naveen@gmail.com', roll: 'EE2026103', adm: '26EEE03', dept: 'EEE', type: 'Scholar' },
  { name: 'Mahesh Babu', email: 'mahesh@gmail.com', roll: 'EE2026104', adm: '26EEE04', dept: 'EEE', type: 'Scholar' },
  { name: 'Sravani Reddy', email: 'sravani@gmail.com', roll: 'EE2026105', adm: '26EEE05', dept: 'EEE', type: 'Scholar' }
];

export const seedIfNeeded = async () => {
  if (!connectionString) {
    console.log("ℹ️ No DATABASE_URL found. Skipping lightweight seeding check.");
    return;
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Check if students count is 0
    const checkRes = await client.query("SELECT COUNT(*) FROM students");
    const count = parseInt(checkRes.rows[0].count);
    
    if (count >= 25) {
      console.log(`ℹ️ Supabase already contains ${count} student records (>= 25). Skipping lightweight seed.`);
      await client.end();
      return;
    }

    console.log("🚀 Starting database cleanup & lightweight seed for Supabase...");

    // Ensure subjects table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        code varchar(50) PRIMARY KEY,
        name varchar(255) NOT NULL,
        department varchar(255) NOT NULL,
        semester varchar(50) DEFAULT 'Semester 1',
        credits integer DEFAULT 4,
        status varchar(50) DEFAULT 'Active',
        is_active boolean DEFAULT true,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);

    // Clean tables in order
    await client.query("DELETE FROM attendance CASCADE");
    await client.query("DELETE FROM fees CASCADE");
    await client.query("DELETE FROM results CASCADE");
    await client.query("DELETE FROM study_materials CASCADE");
    await client.query("DELETE FROM timetable CASCADE");
    await client.query("DELETE FROM assignments CASCADE");
    await client.query("DELETE FROM leave_requests CASCADE");
    await client.query("DELETE FROM complaints CASCADE");
    await client.query("DELETE FROM students CASCADE");
    await client.query("DELETE FROM admins CASCADE");
    await client.query("DELETE FROM faculty CASCADE");
    await client.query("DELETE FROM users CASCADE");
    await client.query("DELETE FROM subjects CASCADE");
    await client.query("DELETE FROM departments CASCADE");

    console.log("🧹 Cleanup completed. Seeding fresh dataset...");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // 1. Seed Departments
    for (const d of DEPARTMENTS) {
      await client.query(
        "INSERT INTO departments (code, name, head_of_department, is_active) VALUES ($1, $2, $3, true)",
        [d.code, d.name, d.head]
      );
    }
    console.log(`✅ Seeded ${DEPARTMENTS.length} departments.`);

    // 2. Seed Subjects
    for (const s of SUBJECTS) {
      await client.query(
        "INSERT INTO subjects (code, name, department, semester, credits, status) VALUES ($1, $2, $3, 'Semester 5', 4, 'Active')",
        [s.code, s.name, s.dept]
      );
    }
    console.log(`✅ Seeded ${SUBJECTS.length} subjects.`);

    // 3. Seed Faculty Users & Profiles
    for (const f of FACULTY) {
      // Create user account
      const { rows: uRows } = await client.query(
        `INSERT INTO users (name, full_name, email, password, role, is_verified, is_active)
         VALUES ($1, $1, $2, $3, 'faculty', true, true) RETURNING id`,
        [f.name, f.email, hashedPassword]
      );
      const userId = uRows[0].id;

      // Create faculty profile
      await client.query(
        `INSERT INTO faculty (user_id, full_name, email, employee_id, department, designation, experience, status, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, 8, 'Active', true)`,
        [userId, f.name, f.email, f.empId, f.code, f.desig]
      );
    }
    console.log(`✅ Seeded ${FACULTY.length} faculty users and profiles.`);

    // 3.5 Seed Super-Admin, Admin, and Other staff accounts (Librarian, Placement, Warden, Transport)
    const STAFF_ACCOUNTS = [
      { email: 'superadmin@college.com', name: 'Super Admin', role: 'super-admin', is_admin_profile: true, empId: 'SUP_ADM_01' },
      { email: 'admin@college.com', name: 'System Admin', role: 'admin', is_admin_profile: true, empId: 'ADM_001' },
      { email: 'librarian@college.com', name: 'Librarian Demo', role: 'librarian' },
      { email: 'placement@college.com', name: 'Placement Officer Demo', role: 'placement-officer' },
      { email: 'warden@college.com', name: 'Hostel Warden Demo', role: 'hostel-warden' },
      { email: 'transport@college.com', name: 'Transport Manager Demo', role: 'transport-manager' }
    ];

    for (const staff of STAFF_ACCOUNTS) {
      // Create user account
      const { rows: uRows } = await client.query(
        `INSERT INTO users (name, full_name, email, password, role, is_verified, is_active)
         VALUES ($1, $1, $2, $3, $4, true, true) RETURNING id`,
        [staff.name, staff.email, hashedPassword, staff.role]
      );
      const userId = uRows[0].id;

      // If it requires admin profile table entry
      if (staff.is_admin_profile) {
        await client.query(
          `INSERT INTO admins (user_id, full_name, email, employee_id, department, is_active)
           VALUES ($1, $2, $3, $4, 'Administration', true)`,
          [userId, staff.name, staff.email, staff.empId]
        );
      }
    }
    console.log(`✅ Seeded Super-Admin, Admin, and staff accounts.`);

    // 4. Seed Students & Parents (Users, profiles, and cross-relations)
    for (const s of STUDENTS_RAW) {
      // a. Student User
      const { rows: sUserRows } = await client.query(
        `INSERT INTO users (name, full_name, email, password, role, is_verified, is_active)
         VALUES ($1, $1, $2, $3, 'student', true, true) RETURNING id`,
        [s.name, s.email, hashedPassword]
      );
      const studentUserId = sUserRows[0].id;

      // b. Parent User
      const parentName = `${s.name.split(' ')[0]}'s Parent`;
      const parentEmail = `${s.email.replace('@', '.parent@')}`;
      const parentPhone = '9' + Math.floor(100000000 + Math.random() * 900000000);

      const { rows: pUserRows } = await client.query(
        `INSERT INTO users (name, full_name, email, password, role, child_email, phone_number, is_verified, is_active)
         VALUES ($1, $1, $2, $3, 'parent', $4, $5, true, true) RETURNING id`,
        [parentName, parentEmail, hashedPassword, s.email, parentPhone]
      );

      // c. Student Profile
      const { rows: sProfileRows } = await client.query(
        `INSERT INTO students (user_id, full_name, roll_number, admission_number, email, department, year, semester, section, parent_name, parent_phone, parent_email, cgpa, attendance_percentage, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, 3, 5, 'A', $7, $8, $9, 8.4, 90.0, true) RETURNING id`,
        [studentUserId, s.name, s.roll, s.adm, s.email, s.dept, parentName, parentPhone, parentEmail]
      );
      const studentProfileId = sProfileRows[0].id;

      // d. Fee Records (Tuition + Special fee if Hostel/Bus)
      await client.query(
        `INSERT INTO fees (student, amount, type, due_date, status, paid_amount, academic_year, semester)
         VALUES ($1, 50000.00, 'Tuition Fee', '2026-07-31', 'Unpaid', 0.00, '2025-2026', 5)`,
        [studentProfileId]
      );

      if (s.type === 'Hostel') {
        await client.query(
          `INSERT INTO fees (student, amount, type, due_date, status, paid_amount, academic_year, semester)
           VALUES ($1, 6000.00, 'Hostel Fee', '2026-07-31', 'Unpaid', 0.00, '2025-2026', 5)`,
          [studentProfileId]
        );
      } else if (s.type === 'Bus') {
        await client.query(
          `INSERT INTO fees (student, amount, type, due_date, status, paid_amount, academic_year, semester)
           VALUES ($1, 2500.00, 'Transport Fee', '2026-07-31', 'Paid', 2500.00, '2025-2026', 5)`,
          [studentProfileId]
        );
      }

      // e. No default fake attendance records are created so dashboard shows only real marked data.
    }
    console.log(`✅ Seeded ${STUDENTS_RAW.length} students, parent user profiles, attendance, and fee allocations.`);

    // 5. Verification Report
    console.log("\n==================================================");
    console.log("🔍 VERIFICATION REPORT:");
    const finalStu = await client.query("SELECT COUNT(*) FROM students");
    const finalFac = await client.query("SELECT COUNT(*) FROM faculty");
    const finalSub = await client.query("SELECT COUNT(*) FROM subjects");
    const finalUsr = await client.query("SELECT COUNT(*), role FROM users GROUP BY role");
    const finalAtt = await client.query("SELECT COUNT(*) FROM attendance");
    
    const getRoleCount = (role) => {
      const row = finalUsr.rows.find(r => r.role === role);
      return row ? parseInt(row.count) : 0;
    };

    console.log(`- Super Admins created: ${getRoleCount('super-admin')} / 1`);
    console.log(`- Admins created: ${getRoleCount('admin')} / 1`);
    console.log(`- Faculty created: ${finalFac.rows[0].count} / 10`);
    console.log(`- Students created: ${finalStu.rows[0].count} / 25`);
    console.log(`- Parents created: ${getRoleCount('parent')} / 25`);
    console.log(`- Librarians created: ${getRoleCount('librarian')} / 1`);
    console.log(`- Placement Officers created: ${getRoleCount('placement-officer')} / 1`);
    console.log(`- Hostel Wardens created: ${getRoleCount('hostel-warden')} / 1`);
    console.log(`- Transport Managers created: ${getRoleCount('transport-manager')} / 1`);
    console.log(`- Subjects created: ${finalSub.rows[0].count} / 25`);
    console.log(`- Attendance records: ${finalAtt.rows[0].count}`);
    console.log("==================================================");
    console.log("🎉 Lightweight Supabase ERP dataset seeded successfully!");

  } catch (err) {
    console.error("❌ Lightweight seeding failed:", err);
  } finally {
    await client.end();
  }
};
