import pkg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ Error: DATABASE_URL is missing in your .env file!");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Supabase SSL connection
  }
});

const sqlSchema = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. DEPARTMENTS Table
CREATE TABLE IF NOT EXISTS departments (
  code varchar(50) PRIMARY KEY,
  name varchar(255) NOT NULL,
  head_of_department varchar(255),
  faculty_count integer DEFAULT 0,
  student_count integer DEFAULT 0,
  budget varchar(100) DEFAULT '₹10L',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1. USERS Table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name varchar(255),
  name varchar(255),
  email varchar(255) UNIQUE NOT NULL,
  password varchar(255),
  role varchar(50) DEFAULT 'student' CHECK (role IN (
    'super-admin', 'admin', 'faculty', 'student', 'parent', 
    'librarian', 'placement-officer', 'hostel-warden', 'transport-manager'
  )),
  phone_number varchar(50),
  mobile varchar(50),
  child_email varchar(255),
  is_verified boolean DEFAULT false,
  mobile_verified boolean DEFAULT false,
  is_phone_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  google_id varchar(255),
  temp_password varchar(255),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. STUDENTS Table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name varchar(255) NOT NULL,
  roll_number varchar(50) UNIQUE NOT NULL,
  admission_number varchar(100) UNIQUE,
  email varchar(255) UNIQUE NOT NULL,
  phone_number varchar(50),
  gender varchar(20) CHECK (gender IN ('Male', 'Female', 'Other')),
  date_of_birth date,
  department varchar(255) NOT NULL,
  year integer NOT NULL CHECK (year IN (1, 2, 3, 4)),
  semester integer NOT NULL CHECK (semester BETWEEN 1 AND 8),
  section varchar(50) NOT NULL,
  address text,
  parent_name varchar(255) NOT NULL,
  parent_phone varchar(50) NOT NULL,
  parent_email varchar(255),
  cgpa numeric(4, 2) CHECK (cgpa BETWEEN 0 AND 10),
  attendance_percentage numeric(5, 2) DEFAULT 100.00 CHECK (attendance_percentage BETWEEN 0 AND 100),
  profile_image text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ASSIGNMENTS Table
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title varchar(255) NOT NULL,
  description text,
  subject varchar(255) NOT NULL,
  due_date timestamp with time zone NOT NULL,
  department varchar(255) NOT NULL,
  year integer NOT NULL,
  semester integer NOT NULL,
  section varchar(50) NOT NULL,
  faculty uuid REFERENCES users(id) ON DELETE SET NULL,
  submissions jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ATTENDANCE Table (references students)
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student uuid REFERENCES students(id) ON DELETE CASCADE,
  date date NOT NULL,
  status varchar(20) CHECK (status IN ('Present', 'Absent', 'Late', 'present', 'absent', 'late')),
  subject varchar(255) NOT NULL,
  period integer,
  time varchar(50),
  remarks text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student, date, subject, period)
);

-- 5. BOOKS Table (Library)
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title varchar(255) NOT NULL,
  author varchar(255) NOT NULL,
  isbn varchar(100) UNIQUE,
  category varchar(255),
  quantity integer DEFAULT 1,
  available_quantity integer DEFAULT 1,
  shelf_location varchar(100),
  publisher varchar(255),
  edition varchar(255),
  language varchar(255),
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ISSUED_BOOKS Table
CREATE TABLE IF NOT EXISTS issued_books (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  book uuid REFERENCES books(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  student uuid REFERENCES students(id) ON DELETE CASCADE,
  issue_date date NOT NULL DEFAULT current_date,
  due_date date NOT NULL,
  return_date date,
  status varchar(20) DEFAULT 'Issued' CHECK (status IN ('Issued', 'Returned', 'Overdue', 'issued', 'returned', 'overdue')),
  fine_amount numeric(10, 2) DEFAULT 0.00,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6b. LIBRARY_NOTIFICATIONS Table
CREATE TABLE IF NOT EXISTS library_notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title varchar(255) NOT NULL,
  message text NOT NULL,
  type varchar(50) NOT NULL,
  unread boolean DEFAULT true,
  urgency varchar(20) DEFAULT 'medium' CHECK (urgency IN ('high', 'medium', 'low')),
  is_archived boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6c. LIBRARY_SETTINGS Table
CREATE TABLE IF NOT EXISTS library_settings (
  key varchar(255) PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. COMPLAINTS Table
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title varchar(255) NOT NULL,
  description text NOT NULL,
  category varchar(100) NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status varchar(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In-Progress', 'Resolved')),
  remarks text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. LEAVE_REQUESTS Table
CREATE TABLE IF NOT EXISTS leave_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type varchar(100) NOT NULL,
  from_date date NOT NULL,
  to_date date NOT NULL,
  days integer NOT NULL,
  reason text,
  status varchar(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  comments text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. FEES Table (references students)
CREATE TABLE IF NOT EXISTS fees (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student uuid REFERENCES students(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL,
  type varchar(100) NOT NULL,
  due_date date NOT NULL,
  status varchar(20) DEFAULT 'Unpaid' CHECK (status IN ('Paid', 'Unpaid', 'Partially-Paid', 'paid', 'unpaid', 'partially-paid', 'pending', 'partial', 'overdue')),
  paid_amount numeric(10, 2) DEFAULT 0.00,
  payment_date date,
  payment_method varchar(100),
  transaction_id varchar(255),
  remarks text,
  academic_year varchar(50),
  semester integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. RESULTS Table
CREATE TABLE IF NOT EXISTS results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student uuid REFERENCES users(id) ON DELETE CASCADE,
  subject varchar(255) NOT NULL,
  credits integer NOT NULL,
  marks integer NOT NULL,
  grade varchar(10) NOT NULL,
  semester integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student, subject, semester)
);

-- 11. STUDY_MATERIALS Table
CREATE TABLE IF NOT EXISTS study_materials (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title varchar(255) NOT NULL,
  subject varchar(255) NOT NULL,
  type varchar(50) NOT NULL,
  file_url text NOT NULL,
  department varchar(255) NOT NULL,
  year integer NOT NULL,
  semester integer NOT NULL,
  faculty uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. TIMETABLE Table
CREATE TABLE IF NOT EXISTS timetable (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  day varchar(20) NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
  start_time varchar(50) NOT NULL,
  end_time varchar(50) NOT NULL,
  subject varchar(255) NOT NULL,
  faculty_name varchar(255) NOT NULL,
  room varchar(50) NOT NULL,
  department varchar(255) NOT NULL,
  year integer NOT NULL,
  semester integer NOT NULL,
  section varchar(50) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. OTPS Table
CREATE TABLE IF NOT EXISTS otps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email varchar(255) NOT NULL,
  otp varchar(255) NOT NULL,
  type varchar(50) NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  attempts integer DEFAULT 0,
  blocked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
`;

const demoUsers = [
  { name: 'Super Admin', email: 'superadmin@college.com', role: 'super-admin' },
  { name: 'Admin', email: 'admin@college.com', role: 'admin' },
  { name: 'Faculty', email: 'faculty@college.com', role: 'faculty' },
  { name: 'Student', email: 'student@college.com', role: 'student' },
  { name: 'Parent', email: 'parent@college.com', role: 'parent', child_email: 'student@college.com' },
  { name: 'Librarian', email: 'librarian@college.com', role: 'librarian' },
  { name: 'Placement Officer', email: 'placement@college.com', role: 'placement-officer' },
  { name: 'Hostel Warden', email: 'warden@college.com', role: 'hostel-warden' },
  { name: 'Transport Manager', email: 'transport@college.com', role: 'transport-manager' }
];

async function runSetup() {
  try {
    console.log("Connecting to PostgreSQL...");
    await client.connect();
    console.log("✅ Connected successfully.");

    console.log("Executing SQL Schema Migrations (creating tables if not exist)...");
    await client.query(sqlSchema);
    console.log("✅ Tables created/validated successfully.");

    console.log("Seeding Demo Accounts...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    for (const user of demoUsers) {
      // Check if user already exists
      const checkRes = await client.query("SELECT * FROM users WHERE email = $1", [user.email]);
      if (checkRes.rows.length === 0) {
        const { rows } = await client.query(
          `INSERT INTO users (name, full_name, email, password, role, child_email, is_verified, mobile_verified, is_phone_verified, is_active)
           VALUES ($1, $1, $2, $3, $4, $5, true, true, true, true) RETURNING id`,
          [user.name, user.email, hashedPassword, user.role, user.child_email || null]
        );
        console.log(`✅ Seeded User: ${user.email} (ID: ${rows[0].id})`);
      } else {
        console.log(`ℹ️ User already exists: ${user.email}`);
      }
    }

    // Seed Departments
    const departmentsData = [
      { code: 'CSE', name: 'Computer Science & Engineering', head: 'Dr. Anjali Mehra', faculty: 86, students: 2140, budget: '₹32L' },
      { code: 'AIML', name: 'Artificial Intelligence & Machine Learning', head: 'Dr. Rajesh Kumar', faculty: 45, students: 1280, budget: '₹22L' },
      { code: 'AIDS', name: 'Artificial Intelligence & Data Science', head: 'Dr. Vikram Rao', faculty: 38, students: 960, budget: '₹18L' },
      { code: 'CYBERSECURITY', name: 'Cybersecurity', head: 'Prof. Sarah Lin', faculty: 32, students: 840, budget: '₹16L' },
      { code: 'IT', name: 'Information Technology', head: 'Dr. Aisha Khan', faculty: 52, students: 1420, budget: '₹20L' },
      { code: 'ECE', name: 'Electronics & Communication Engineering', head: 'Prof. Marco Rossi', faculty: 64, students: 1580, budget: '₹24L' },
      { code: 'EEE', name: 'Electrical & Electronics Engineering', head: 'Dr. Ramana Rao', faculty: 42, students: 1100, budget: '₹18L' },
      { code: 'MECH', name: 'Mechanical Engineering', head: 'Dr. Suresh Naidu', faculty: 58, students: 1350, budget: '₹22L' },
      { code: 'CIVIL', name: 'Civil Engineering', head: 'Dr. K. Srinivasa Rao', faculty: 40, students: 980, budget: '₹15L' }
    ];

    console.log("Seeding Departments...");
    for (const dept of departmentsData) {
      await client.query(`
        INSERT INTO departments (code, name, head_of_department, faculty_count, student_count, budget, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        ON CONFLICT (code) DO UPDATE 
        SET name = EXCLUDED.name,
            head_of_department = EXCLUDED.head_of_department,
            faculty_count = EXCLUDED.faculty_count,
            student_count = EXCLUDED.student_count,
            budget = EXCLUDED.budget,
            updated_at = NOW();
      `, [dept.code, dept.name, dept.head, dept.faculty, dept.students, dept.budget]);
    }
    console.log("✅ Departments seeded successfully.");

    // Seed student profile for student@college.com if it doesn't exist
    const studentCheck = await client.query("SELECT * FROM students WHERE email = $1", ['student@college.com']);
    if (studentCheck.rows.length === 0) {
      const { rows } = await client.query(
        `INSERT INTO students (full_name, roll_number, email, phone_number, gender, date_of_birth, department, year, semester, section, address, parent_name, parent_phone, parent_email, cgpa, attendance_percentage, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, true) RETURNING id`,
        [
          'Student Demo',
          'CS100001',
          'student@college.com',
          '1234567890',
          'Male',
          '2004-05-15',
          'CSE',
          3,
          5,
          'A',
          '123 College Ave, Campus Town',
          'Parent Demo',
          '0987654321',
          'parent@college.com',
          8.5,
          92.5
        ]
      );
      console.log(`✅ Seeded Student Profile: student@college.com (ID: ${rows[0].id})`);
    } else {
      console.log("ℹ️ Student profile already exists for student@college.com");
    }

    // Seed sample study materials for faculty@college.com matching student cohort
    const facultyUserRes = await client.query("SELECT id FROM users WHERE email = $1", ['faculty@college.com']);
    if (facultyUserRes.rows.length > 0) {
      const facultyId = facultyUserRes.rows[0].id;
      const materialsCheck = await client.query("SELECT * FROM study_materials WHERE faculty = $1", [facultyId]);
      if (materialsCheck.rows.length === 0) {
        await client.query(`
          INSERT INTO study_materials (title, subject, type, file_url, department, year, semester, faculty)
          VALUES 
          ('Algorithm Video Lecture', 'Algorithms', 'Video', 'https://example.com/materials/algo-lecture.mp4', 'CSE', 3, 5, $1),
          ('Database Schema Examples', 'Database Systems', 'Document', 'https://example.com/materials/db-schema.docx', 'CSE', 3, 5, $1)
        `, [facultyId]);
        console.log("✅ Seeded sample study materials for faculty@college.com");
      }
    }

    console.log("\n🎉 Database setup and seeding complete!");
    console.log("👉 You can now log in using any of the demo accounts with password: 'password123'");

  } catch (err) {
    console.error("❌ Setup failed with error:", err);
  } finally {
    await client.end();
  }
}

runSetup();
