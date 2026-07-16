import pkg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;
const connectionString = process.env.DATABASE_URL;
const isLocalDatabase =
  connectionString?.includes('localhost') ||
  connectionString?.includes('127.0.0.1') ||
  connectionString?.includes('host.docker.internal');

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

const seedPlacements = async (client) => {
  try {
    // Check if companies exist
    const compCheck = await client.query("SELECT COUNT(*) FROM placement_companies");
    if (parseInt(compCheck.rows[0].count) > 0) {
      console.log("ℹ️ placement_companies already seeded. Skipping placement seeding.");
      return;
    }

    console.log("🚀 Seeding Placements module...");
    
    // Seed students for placements if they don't exist
    const placementStudents = [
      { full_name: 'Aarav Sharma', roll_number: 'CS100002', email: 'aarav@college.com', department: 'CSE', cgpa: 8.9 },
      { full_name: 'Priya Patel', roll_number: 'CS100003', email: 'priya@college.com', department: 'CSE', cgpa: 9.1 },
      { full_name: 'Ethan Walker', roll_number: 'CS100004', email: 'ethan@college.com', department: 'ECE', cgpa: 8.4 },
      { full_name: 'Sofia Rodriguez', roll_number: 'CS100005', email: 'sofia@college.com', department: 'MECH', cgpa: 7.8 }
    ];

    const studentMap = {}; // mapping name -> id
    
    // First get student demo or existing students
    const demoStudentRes = await client.query("SELECT id FROM students WHERE email = 'student@college.com'");
    if (demoStudentRes.rows.length > 0) {
      studentMap['Student Demo'] = demoStudentRes.rows[0].id;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    for (const stud of placementStudents) {
      const check = await client.query("SELECT id FROM students WHERE email = $1", [stud.email]);
      if (check.rows.length === 0) {
        // Insert a user first (since student references user) - check if user already exists by email
        let userId;
        const userCheck = await client.query("SELECT id FROM users WHERE email = $1", [stud.email]);
        if (userCheck.rows.length > 0) {
          userId = userCheck.rows[0].id;
        } else {
          const userRes = await client.query(
            `INSERT INTO users (name, full_name, email, password, role, is_verified, is_active)
             VALUES ($1, $1, $2, $3, 'student', true, true) RETURNING id`,
            [stud.full_name, stud.email, hashedPassword]
          );
          userId = userRes.rows[0].id;
        }

        const insertRes = await client.query(
          `INSERT INTO students (user_id, full_name, roll_number, email, phone_number, gender, date_of_birth, department, year, semester, section, address, parent_name, parent_phone, parent_email, cgpa, attendance_percentage, is_active)
           VALUES ($1, $2, $3, $4, '9876543210', 'Male', '2004-06-20', $5, 4, 7, 'A', '123 Campus Lane', $7, '9876543210', $8, $6, 90.0, true) RETURNING id`,
          [
            userId,
            stud.full_name,
            stud.roll_number,
            stud.email,
            stud.department,
            stud.cgpa,
            `Parent ${stud.full_name}`,
            `parent.${stud.email}`
          ]
        );
        studentMap[stud.full_name] = insertRes.rows[0].id;
      } else {
        studentMap[stud.full_name] = check.rows[0].id;
      }
    }

    const companiesData = [
      { name: 'Google India', industry: 'Technology', hr: 'Anjali Sharma', email: 'careers-india@google.com', package: '22.5 LPA', hires: 12 },
      { name: 'Microsoft India', industry: 'Technology', hr: 'Rohit Mehta', email: 'careers@microsoft.com', package: '20.0 LPA', hires: 15 },
      { name: 'Amazon India', industry: 'E-commerce', hr: 'Sanjay Sen', email: 'careers@amazon.in', package: '18.5 LPA', hires: 18 },
      { name: 'Goldman Sachs', industry: 'Investment Banking', hr: 'Sneha Rao', email: 'careers@gs.com', package: '16.0 LPA', hires: 8 },
      { name: 'Accenture', industry: 'Consulting', hr: 'Rahul Verma', email: 'careers@accenture.com', package: '11.0 LPA', hires: 22 },
      { name: 'TCS', industry: 'Consulting', hr: 'Komal Gupta', email: 'careers@tcs.com', package: '12.0 LPA', hires: 20 },
      { name: 'Infosys', industry: 'IT Services', hr: 'Deepa Nair', email: 'careers@infosys.com', package: '10.5 LPA', hires: 18 },
      { name: 'Oracle', industry: 'Technology', hr: 'Siddharth Sen', email: 'careers@oracle.com', package: '16.5 LPA', hires: 14 }
    ];
    
    const companyMap = {};
    for (const comp of companiesData) {
      const insertRes = await client.query(
        `INSERT INTO placement_companies (name, industry, hr_contact, email, phone, package_amount, previous_hires, is_active)
         VALUES ($1, $2, $3, $4, '9876543210', $5, $6, true) RETURNING id`,
        [comp.name, comp.industry, comp.hr, comp.email, comp.package, comp.hires]
      );
      companyMap[comp.name] = insertRes.rows[0].id;
    }

    const aaravId = studentMap['Aarav Sharma'];
    const priyaId = studentMap['Priya Patel'];
    const ethanId = studentMap['Ethan Walker'];
    const sofiaId = studentMap['Sofia Rodriguez'];
    const demoStudentId = studentMap['Student Demo'];

    const drivesData = [
      {
        company: 'Google India',
        position: 'Software Engineer',
        company_name: 'Google India',
        drive_date: '2026-06-15',
        venue: 'Main Auditorium',
        deadline: '2026-06-10',
        status: 'upcoming',
        package_min: 15.0,
        package_max: 22.5,
        eligibility_min_cgpa: 7.5,
        eligibility_departments: ['CSE', 'AIML', 'AIDS'],
        applied_students: [
          { student_id: aaravId, student_name: 'Aarav Sharma', status: 'Selected', applied_date: '2026-05-10', package: 22.5 },
          { student_id: priyaId, student_name: 'Priya Patel', status: 'Shortlisted', applied_date: '2026-05-11' }
        ]
      },
      {
        company: 'Microsoft India',
        position: 'SDE-II',
        company_name: 'Microsoft India',
        drive_date: '2026-06-20',
        venue: 'Conference Hall A',
        deadline: '2026-06-15',
        status: 'upcoming',
        package_min: 18.0,
        package_max: 20.0,
        eligibility_min_cgpa: 8.0,
        eligibility_departments: ['CSE', 'AIML'],
        applied_students: [
          { student_id: priyaId, student_name: 'Priya Patel', status: 'Selected', applied_date: '2026-05-12', package: 20.0 },
          { student_id: demoStudentId, student_name: 'Student Demo', status: 'Applied', applied_date: '2026-05-15' }
        ]
      },
      {
        company: 'Amazon India',
        position: 'Associate',
        company_name: 'Amazon India',
        drive_date: '2026-06-08',
        venue: 'Main Auditorium',
        deadline: '2026-06-05',
        status: 'ongoing',
        package_min: 10.0,
        package_max: 18.5,
        eligibility_min_cgpa: 7.0,
        eligibility_departments: ['CSE', 'AIML', 'AIDS', 'IT', 'ECE'],
        applied_students: [
          { student_id: ethanId, student_name: 'Ethan Walker', status: 'Selected', applied_date: '2026-05-08', package: 18.5 }
        ]
      },
      {
        company: 'Goldman Sachs',
        position: 'Analyst',
        company_name: 'Goldman Sachs',
        drive_date: '2026-06-22',
        venue: 'Finance Center',
        deadline: '2026-06-18',
        status: 'upcoming',
        package_min: 12.0,
        package_max: 16.0,
        eligibility_min_cgpa: 7.5,
        eligibility_departments: ['CSE', 'AIML', 'AIDS', 'IT'],
        applied_students: [
          { student_id: aaravId, student_name: 'Aarav Sharma', status: 'Applied', applied_date: '2026-05-18' }
        ]
      },
      {
        company: 'Accenture',
        position: 'Consulting',
        company_name: 'Accenture',
        drive_date: '2026-01-15',
        venue: 'Seminar Hall 1',
        deadline: '2026-01-10',
        status: 'completed',
        package_min: 4.5,
        package_max: 11.0,
        eligibility_min_cgpa: 6.0,
        eligibility_departments: ['CSE', 'AIML', 'ECE', 'EEE', 'MECH', 'CIVIL'],
        applied_students: [
          { student_id: demoStudentId, student_name: 'Student Demo', status: 'Selected', applied_date: '2026-01-11', package: 11.0 }
        ]
      },
      {
        company: 'TCS',
        position: 'Consulting',
        company_name: 'TCS',
        drive_date: '2026-02-12',
        venue: 'Campus Placement Block',
        deadline: '2026-02-08',
        status: 'completed',
        package_min: 3.5,
        package_max: 12.0,
        eligibility_min_cgpa: 6.0,
        eligibility_departments: ['CSE', 'ECE', 'MECH', 'CIVIL'],
        applied_students: []
      },
      {
        company: 'Infosys',
        position: 'IT Services',
        company_name: 'Infosys',
        drive_date: '2026-03-10',
        venue: 'Placement Block',
        deadline: '2026-03-05',
        status: 'completed',
        package_min: 4.0,
        package_max: 10.5,
        eligibility_min_cgpa: 6.0,
        eligibility_departments: ['CSE', 'ECE', 'MECH', 'CIVIL'],
        applied_students: [
          { student_id: sofiaId, student_name: 'Sofia Rodriguez', status: 'Selected', applied_date: '2026-03-06', package: 10.5 }
        ]
      }
    ];

    const driveMap = {};
    for (const drive of drivesData) {
      const companyId = companyMap[drive.company_name] || null;
      const insertRes = await client.query(
        `INSERT INTO placements (company, position, applied_students, company_id, drive_date, venue, deadline, status, package_min, package_max, eligibility_min_cgpa, eligibility_departments)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
        [
          drive.company,
          drive.position,
          JSON.stringify(drive.applied_students),
          companyId,
          drive.drive_date,
          drive.venue,
          drive.deadline,
          drive.status,
          drive.package_min,
          drive.package_max,
          drive.eligibility_min_cgpa,
          JSON.stringify(drive.eligibility_departments)
        ]
      );
      driveMap[drive.company + " - " + drive.position] = insertRes.rows[0].id;
    }

    const interviewsData = [
      { student_name: 'Aarav Sharma', company: 'Google India', drive_key: 'Google India - Software Engineer', round: 'Round 2', date: '2026-06-18', time: '10:00 AM', mode: 'Online', status: 'Scheduled' },
      { student_name: 'Priya Patel', company: 'Microsoft India', drive_key: 'Microsoft India - SDE-II', round: 'Round 1', date: '2026-06-20', time: '02:00 PM', mode: 'In-Person', status: 'Scheduled' },
      { student_name: 'Ethan Walker', company: 'Amazon India', drive_key: 'Amazon India - Associate', round: 'Round 3', date: '2026-06-25', time: '11:00 AM', mode: 'Online', status: 'Scheduled' },
      { student_name: 'Sofia Rodriguez', company: 'Infosys', drive_key: 'Infosys - IT Services', round: 'Round 1', date: '2026-06-12', time: '09:00 AM', mode: 'In-Person', status: 'Scheduled' }
    ];

    for (const intv of interviewsData) {
      const studentId = studentMap[intv.student_name] || null;
      const driveId = driveMap[intv.drive_key] || null;
      await client.query(
        `INSERT INTO placement_interviews (student, student_name, company_name, drive_id, round, date, time, mode, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [studentId, intv.student_name, intv.company, driveId, intv.round, intv.date, intv.time, intv.mode, intv.status]
      );
    }

    const notifsData = [
      { title: 'New drive: Goldman Sachs Analyst', time: '2h ago', type: 'Drive', unread: true },
      { title: 'Interview scheduled: Aarav Sharma - Google', time: '5h ago', type: 'Interview', unread: true },
      { title: 'Offer received: Sofia Rodriguez - Infosys', time: '1d ago', type: 'Offer', unread: false },
      { title: 'Application deadline tomorrow: Microsoft India', time: '2d ago', type: 'Deadline', unread: false },
      { title: 'Resume verification required', time: '3d ago', type: 'Resume', unread: false }
    ];

    for (const notif of notifsData) {
      await client.query(
        `INSERT INTO placement_notifications (title, time, type, unread)
         VALUES ($1, $2, $3, $4)`,
         [notif.title, notif.time, notif.type, notif.unread]
      );
    }
    console.log("✅ Seeded Placements module successfully.");
  } catch (err) {
    console.error("❌ Failed to seed placements:", err);
  }
};

export const seedIfNeeded = async () => {
  if (!connectionString) {
    console.log("ℹ️ No DATABASE_URL found. Skipping lightweight seeding check.");
    return;
  }

  const client = new Client({
    connectionString,
    ssl: isLocalDatabase ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 3000
  });

  try {
    await client.connect();
    
    // Check if students count is 0
    const checkRes = await client.query("SELECT COUNT(*) FROM students");
    const count = parseInt(checkRes.rows[0].count);
    if (count > 0) {
      console.log(`ℹ️ Supabase already contains ${count} student records. Skipping lightweight seed to preserve user data.`);
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
    
    await seedPlacements(client);
    
    console.log("🎉 Lightweight Supabase ERP dataset seeded successfully!");

  } catch (err) {
    console.error("❌ Lightweight seeding failed:", err);
  } finally {
    try {
      await client.end();
    } catch (e) {
      // Ignore end failure if never connected
    }
  }
};
