import pkg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const { Client } = pkg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ Error: DATABASE_URL is missing in your .env file!");
  process.exit(1);
}

const isLocalDatabase =
  connectionString.includes('localhost') ||
  connectionString.includes('127.0.0.1') ||
  connectionString.includes('db') ||
  connectionString.includes('postgres') ||
  connectionString.includes('host.docker.internal') ||
  process.env.DATABASE_SSL === 'false';

const client = new Client({
  connectionString,
  ssl: isLocalDatabase ? false : {
    rejectUnauthorized: false
  }
});

const sqlSchema = `
-- Drop all existing tables cascadingly for a clean reset
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS below_75_students CASCADE;
DROP TABLE IF EXISTS attendance_notification_requests CASCADE;
DROP TABLE IF EXISTS attendance_notifications CASCADE;
DROP TABLE IF EXISTS attendance_notification_history CASCADE;
DROP TABLE IF EXISTS attendance_notification_templates CASCADE;
DROP TABLE IF EXISTS attendance_notification_logs CASCADE;
DROP TABLE IF EXISTS college_settings CASCADE;
DROP TABLE IF EXISTS faculty CASCADE;
DROP TABLE IF EXISTS student_course_registrations CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS faculty_attendance CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS issued_books CASCADE;
DROP TABLE IF EXISTS library_notifications CASCADE;
DROP TABLE IF EXISTS library_settings CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS fees CASCADE;
DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS study_materials CASCADE;
DROP TABLE IF EXISTS timetable CASCADE;
DROP TABLE IF EXISTS otps CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS placement_drives CASCADE;
DROP TABLE IF EXISTS selected_students CASCADE;
DROP TABLE IF EXISTS student_applications CASCADE;
DROP TABLE IF EXISTS drive_rounds CASCADE;
DROP TABLE IF EXISTS hostels CASCADE;
DROP TABLE IF EXISTS hostel_blocks CASCADE;
DROP TABLE IF EXISTS hostel_rooms CASCADE;
DROP TABLE IF EXISTS hostel_allocations CASCADE;
DROP TABLE IF EXISTS hostel_fees CASCADE;
DROP TABLE IF EXISTS hostel_fee_payments CASCADE;
DROP TABLE IF EXISTS hostel_fee_receipts CASCADE;
DROP TABLE IF EXISTS fee_notifications CASCADE;
DROP TABLE IF EXISTS hostel_complaints CASCADE;
DROP TABLE IF EXISTS hostel_visitors CASCADE;
DROP TABLE IF EXISTS hostel_attendance CASCADE;
DROP TABLE IF EXISTS buses CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS stops CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS transport_allocations CASCADE;
DROP TABLE IF EXISTS vehicle_maintenance CASCADE;
DROP TABLE IF EXISTS transport_fees CASCADE;
DROP TABLE IF EXISTS alumni_profiles CASCADE;
DROP TABLE IF EXISTS alumni_employment CASCADE;
DROP TABLE IF EXISTS alumni_education CASCADE;
DROP TABLE IF EXISTS alumni_events CASCADE;
DROP TABLE IF EXISTS alumni_event_registrations CASCADE;
DROP TABLE IF EXISTS alumni_jobs CASCADE;
DROP TABLE IF EXISTS alumni_job_applications CASCADE;
DROP TABLE IF EXISTS alumni_mentorship_requests CASCADE;
DROP TABLE IF EXISTS alumni_donations CASCADE;
DROP TABLE IF EXISTS alumni_success_stories CASCADE;
DROP TABLE IF EXISTS alumni_communication_logs CASCADE;
DROP TABLE IF EXISTS alumni_connections CASCADE;
DROP TABLE IF EXISTS alumni_posts CASCADE;
DROP TABLE IF EXISTS alumni_post_likes CASCADE;
DROP TABLE IF EXISTS alumni_post_comments CASCADE;
DROP TABLE IF EXISTS alumni_messages CASCADE;
DROP TABLE IF EXISTS mentorship_sessions CASCADE;
DROP TABLE IF EXISTS alumni_activity_logs CASCADE;
DROP TABLE IF EXISTS chat_conversations CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS broadcast_notifications CASCADE;
DROP TABLE IF EXISTS admin_notifications CASCADE;
DROP TABLE IF EXISTS faculty_notifications CASCADE;
DROP TABLE IF EXISTS faculty_notification_settings CASCADE;
DROP TABLE IF EXISTS student_notifications CASCADE;
DROP TABLE IF EXISTS placement_companies CASCADE;
DROP TABLE IF EXISTS placements CASCADE;
DROP TABLE IF EXISTS placement_interviews CASCADE;
DROP TABLE IF EXISTS placement_notifications CASCADE;
DROP TABLE IF EXISTS placement_training CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS exam_timetables CASCADE;
DROP TABLE IF EXISTS exam_questions CASCADE;
DROP TABLE IF EXISTS exam_invigilations CASCADE;
DROP TABLE IF EXISTS exam_hall_tickets CASCADE;
DROP TABLE IF EXISTS exam_results CASCADE;

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
    'librarian', 'placement-officer', 'hostel-warden', 'transport-manager',
    'principal', 'dean', 'hod', 'exam-cell', 'accounts', 'alumni-coordinator', 'alumni'
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



-- 14. PLACEMENT_COMPANIES Table
CREATE TABLE IF NOT EXISTS placement_companies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name varchar(255) UNIQUE NOT NULL,
  industry varchar(255) DEFAULT 'Technology',
  hr_contact varchar(255) DEFAULT 'HR Manager',
  email varchar(255) DEFAULT 'hr@company.com',
  phone varchar(50) DEFAULT '9876543210',
  package_amount varchar(100) DEFAULT '8.0 LPA',
  previous_hires integer DEFAULT 0,
  is_active boolean DEFAULT true,
  logo text,
  website text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. PLACEMENTS Table (Drives)
CREATE TABLE IF NOT EXISTS placements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company varchar(255) NOT NULL,
  position varchar(255) NOT NULL,
  applied_students jsonb DEFAULT '[]'::jsonb,
  company_id uuid REFERENCES placement_companies(id) ON DELETE SET NULL,
  drive_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  venue varchar(255) DEFAULT 'Virtual',
  deadline timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  status varchar(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  package_min numeric(10, 2) DEFAULT 0.00,
  package_max numeric(10, 2) DEFAULT 0.00,
  eligibility_min_cgpa numeric(4, 2) DEFAULT 0.00,
  eligibility_departments jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. PLACEMENT_INTERVIEWS Table
CREATE TABLE IF NOT EXISTS placement_interviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student uuid REFERENCES students(id) ON DELETE CASCADE,
  student_name varchar(255) NOT NULL,
  company_name varchar(255) NOT NULL,
  drive_id uuid REFERENCES placements(id) ON DELETE CASCADE,
  round varchar(100) NOT NULL,
  date date NOT NULL,
  time varchar(50) NOT NULL,
  mode varchar(50) DEFAULT 'Online' CHECK (mode IN ('Online', 'In-Person')),
  status varchar(50) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. PLACEMENT_NOTIFICATIONS Table
CREATE TABLE IF NOT EXISTS placement_notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title varchar(255) NOT NULL,
  time varchar(100) NOT NULL,
  type varchar(50) NOT NULL CHECK (type IN ('Drive', 'Interview', 'Offer', 'Deadline', 'Resume')),
  unread boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 18. ATTENDANCE_NOTIFICATIONS Table
CREATE TABLE IF NOT EXISTS attendance_notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  student_name varchar(255) NOT NULL,
  roll_number varchar(100) NOT NULL,
  department varchar(50) NOT NULL,
  attendance_percentage numeric(5, 2) NOT NULL,
  notification_type varchar(100) NOT NULL,
  recipient_role varchar(100) NOT NULL,
  recipient_email varchar(255) NOT NULL,
  status varchar(50) DEFAULT 'Sent',
  error_details text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 19. BELOW_75_STUDENTS Table
CREATE TABLE IF NOT EXISTS below_75_students (
  id varchar(100) PRIMARY KEY,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  student_name varchar(255) NOT NULL,
  roll_number varchar(100) NOT NULL,
  department varchar(50) NOT NULL,
  year integer NOT NULL,
  semester integer NOT NULL,
  section varchar(50) NOT NULL,
  attendance_percentage numeric(5, 2) NOT NULL,
  short_attendance_subjects jsonb DEFAULT '[]'::jsonb,
  parent_name varchar(255),
  parent_email varchar(255),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 20. ATTENDANCE_NOTIFICATION_REQUESTS Table
CREATE TABLE IF NOT EXISTS attendance_notification_requests (
  id varchar(100) PRIMARY KEY,
  teacher_id varchar(100) NOT NULL,
  teacher_name varchar(255),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  student_name varchar(255) NOT NULL,
  roll_number varchar(100) NOT NULL,
  department varchar(50) NOT NULL,
  attendance_percentage numeric(5, 2) NOT NULL,
  selected_recipients jsonb DEFAULT '[]'::jsonb,
  message_type varchar(100) NOT NULL,
  status varchar(100) NOT NULL DEFAULT 'Pending HOD Approval',
  remarks text,
  custom_message text,
  short_attendance_subjects jsonb DEFAULT '[]'::jsonb,
  subject text,
  message text,
  attachments jsonb DEFAULT '[]'::jsonb,
  ip_address varchar(100),
  approved_date timestamp with time zone,
  sent_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  approved_by varchar(255),
  approved_at timestamp with time zone,
  sent_at timestamp with time zone
);

-- 21. COLLEGE_SETTINGS Table
CREATE TABLE IF NOT EXISTS college_settings (
  key varchar(255) PRIMARY KEY,
  value varchar(255) NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed HOD approval toggle default
INSERT INTO college_settings (key, value, description)
VALUES ('attendance_approval_enabled', 'false', 'Enable/disable HOD approval flow for attendance warnings');

-- 22. ATTENDANCE_NOTIFICATION_TEMPLATES Table
CREATE TABLE IF NOT EXISTS attendance_notification_templates (
  id varchar(100) PRIMARY KEY,
  name varchar(255) NOT NULL,
  subject varchar(255) NOT NULL,
  body text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed default templates
INSERT INTO attendance_notification_templates (id, name, subject, body) VALUES
('appreciation', 'Appreciation', 'Congratulations on Excellent Attendance', 'Dear {student_name},\n\nWe are pleased to inform you that you have maintained an excellent attendance of {attendance_percentage}% this month.\n\nKeep up the great work!\n\nBest regards,\nCollege Administration'),
('friendly-reminder', 'Friendly Reminder', 'Friendly Reminder: Attendance Update', 'Dear {student_name},\n\nThis is a friendly reminder that your overall attendance is currently at {attendance_percentage}%.\n\nPlease attend your classes regularly to keep your attendance above the required 75% threshold.\n\nBest regards,\nClass Teacher'),
('warning', 'Warning', 'Attendance Warning Alert', 'Dear {student_name},\n\nYour attendance is currently at {attendance_percentage}%, which is below the required 75% threshold.\n\nPlease take immediate steps to attend your classes regularly to avoid academic penalty.\n\nBest regards,\nClass Teacher'),
('critical-warning', 'Critical Warning', 'Critical Attendance Warning', 'Dear Parent / Student,\n\nThis is to notify you that the attendance of {student_name} ({roll_number}) is critical at {attendance_percentage}%.\n\nPlease meet your department HOD immediately to resolve this.\n\nBest regards,\nDepartment Head'),
('detention-alert', 'Detention Alert', 'Detention Risk Alert', 'Dear Parent / Student,\n\nYour overall attendance has fallen to {attendance_percentage}%, putting you at immediate risk of detention.\n\nKindly note that you will not be allowed to write the semester exams if this is not resolved.\n\nBest regards,\nPrincipal');

-- 23. ATTENDANCE_NOTIFICATION_HISTORY Table
CREATE TABLE IF NOT EXISTS attendance_notification_history (
  id varchar(100) PRIMARY KEY,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  student_name varchar(255) NOT NULL,
  roll_number varchar(100) NOT NULL,
  department varchar(50) NOT NULL,
  teacher_id varchar(100) NOT NULL,
  teacher_name varchar(255),
  attendance_percentage numeric(5, 2) NOT NULL,
  selected_recipients jsonb DEFAULT '[]'::jsonb,
  notification_type varchar(100) NOT NULL,
  subject text,
  message text,
  status varchar(50) NOT NULL DEFAULT 'Sent',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  sent_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  approved_by varchar(255),
  approved_at timestamp with time zone,
  ip_address varchar(100)
);

-- 24. ATTENDANCE_NOTIFICATION_LOGS Table
CREATE TABLE IF NOT EXISTS attendance_notification_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id varchar(100),
  recipient_role varchar(100) NOT NULL,
  email_address varchar(255) NOT NULL,
  delivery_status varchar(50) NOT NULL DEFAULT 'Sent',
  failed_reason text,
  retry_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- Performance optimization indexes on foreign keys
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student);
CREATE INDEX IF NOT EXISTS idx_fees_student ON fees(student);
CREATE INDEX IF NOT EXISTS idx_results_student ON results(student);
CREATE INDEX IF NOT EXISTS idx_issued_books_student ON issued_books(student);
CREATE INDEX IF NOT EXISTS idx_issued_books_user_id ON issued_books(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_user ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_user ON complaints(user_id);
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
  { name: 'Transport Manager', email: 'transport@college.com', role: 'transport-manager' },
  { name: 'Principal Office', email: 'principal@college.com', role: 'principal' },
  { name: 'Dean Academics', email: 'dean@college.com', role: 'dean' },
  { name: 'HOD CSE', email: 'hod@college.com', role: 'hod' },
  { name: 'Exam Cell Officer', email: 'examcell@college.com', role: 'exam-cell' },
  { name: 'Accounts Manager', email: 'accounts@college.com', role: 'accounts' },
  { name: 'Alumni Coordinator', email: 'alumni.coordinator@college.com', role: 'alumni-coordinator' },
  { name: 'Alumni Student', email: 'alumni@college.com', role: 'alumni' }
];

async function runSetup() {
  try {
    console.log("Connecting to PostgreSQL...");
    await client.connect();
    console.log("✅ Connected successfully.");

    console.log("Executing SQL Schema Migrations (creating tables if not exist)...");
    await client.query(sqlSchema);

    // Create admins and faculty tables
    console.log("Creating admins and faculty tables if not exist...");
    const missingTablesSql = `
      CREATE TABLE IF NOT EXISTS admins (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        full_name varchar(255) NOT NULL,
        email varchar(255) UNIQUE NOT NULL,
        employee_id varchar(50) UNIQUE NOT NULL,
        department varchar(255),
        is_active boolean DEFAULT true,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS faculty (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        full_name varchar(255) NOT NULL,
        email varchar(255) UNIQUE NOT NULL,
        employee_id varchar(50) UNIQUE NOT NULL,
        department varchar(255) NOT NULL,
        designation varchar(255) NOT NULL,
        experience integer DEFAULT 0,
        gender varchar(20),
        phone_number varchar(50),
        status varchar(50) DEFAULT 'Active',
        is_active boolean DEFAULT true,
        assigned_sections jsonb DEFAULT '[]'::jsonb,
        assigned_subjects jsonb DEFAULT '[]'::jsonb,
        assigned_student_ids jsonb DEFAULT '[]'::jsonb,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `;
    await client.query(missingTablesSql);

    // Run ALTER TABLE migrations
    console.log("Applying column and secondary migrations...");
    const alterTablesSql = `
      ALTER TABLE students ADD COLUMN IF NOT EXISTS user_id uuid;
      ALTER TABLE students ADD COLUMN IF NOT EXISTS admission_number varchar(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_password varchar(255);
      ALTER TABLE faculty ADD COLUMN IF NOT EXISTS user_id uuid;
      ALTER TABLE faculty ADD COLUMN IF NOT EXISTS attendance_percentage numeric(5, 2) DEFAULT 100.00;

      CREATE TABLE IF NOT EXISTS faculty_attendance (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        faculty uuid REFERENCES faculty(id) ON DELETE CASCADE,
        date date NOT NULL,
        status varchar(50) DEFAULT 'Present',
        remarks text,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        UNIQUE(faculty, date)
      );

      ALTER TABLE attendance ADD COLUMN IF NOT EXISTS period integer;
      ALTER TABLE attendance ADD COLUMN IF NOT EXISTS time varchar(50);

      -- Create Courses Table (Relocated after faculty table exists)
      CREATE TABLE IF NOT EXISTS courses (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        course_code varchar(50) UNIQUE NOT NULL,
        course_name varchar(255) NOT NULL,
        credits numeric(3,1) NOT NULL,
        course_type varchar(50) NOT NULL CHECK (course_type IN ('Open Elective', 'Integrated Subject', 'Normal Subject', 'Lab')),
        department varchar(50) REFERENCES departments(code) ON DELETE CASCADE,
        year integer NOT NULL CHECK (year BETWEEN 1 AND 4),
        semester integer NOT NULL CHECK (semester BETWEEN 1 AND 8),
        mentor_id uuid REFERENCES faculty(id) ON DELETE SET NULL,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Create Student Course Registrations Table (Relocated after courses table exists)
      CREATE TABLE IF NOT EXISTS student_course_registrations (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id uuid REFERENCES students(id) ON DELETE CASCADE,
        course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
        semester integer NOT NULL CHECK (semester BETWEEN 1 AND 8),
        year integer NOT NULL CHECK (year BETWEEN 1 AND 4),
        registration_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        status varchar(50) DEFAULT 'Registered' CHECK (status IN ('Registered', 'Approved', 'Pending')),
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        UNIQUE(student_id, course_id)
      );

      -- Create Exam Registrations Table
      CREATE TABLE IF NOT EXISTS exam_registrations (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id uuid REFERENCES students(id) ON DELETE CASCADE,
        course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
        semester integer NOT NULL CHECK (semester BETWEEN 1 AND 8),
        year integer NOT NULL CHECK (year BETWEEN 1 AND 4),
        registration_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        status varchar(50) DEFAULT 'Registered' CHECK (status IN ('Registered', 'Approved', 'Pending')),
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        UNIQUE(student_id, course_id)
      );
    `;
    await client.query(alterTablesSql);

    // Run migrated tables DDL schema
    const migratedPath = path.join(__dirname, 'src', 'migrations', 'create_migrated_tables.sql');
    if (fs.existsSync(migratedPath)) {
      console.log("Executing Migrated Tables SQL...");
      const migratedSql = fs.readFileSync(migratedPath, 'utf8');
      await client.query(migratedSql);
      console.log("✅ Migrated tables schema created/verified.");
    }

    // Run chat tables DDL schema
    const chatPath = path.join(__dirname, 'src', 'migrations', 'create_chat_tables.sql');
    if (fs.existsSync(chatPath)) {
      console.log("Executing Chat Tables SQL...");
      const chatSql = fs.readFileSync(chatPath, 'utf8');
      await client.query(chatSql);
      console.log("✅ Chat tables schema created/verified.");
    }

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

    console.log("Seeding Placements module...");
    // Clear existing placement seeds to ensure clean mock state
    await client.query("DELETE FROM placement_interviews");
    await client.query("DELETE FROM placement_notifications");
    await client.query("DELETE FROM placements");
    await client.query("DELETE FROM placement_companies");

    // Seed students for placements if they don't exist
    const placementStudents = [
      { full_name: 'Aarav Sharma', roll_number: 'CS100002', email: 'aarav@college.com', department: 'CSE', cgpa: 8.9 },
      { full_name: 'Priya Patel', roll_number: 'CS100003', email: 'priya@college.com', department: 'CSE', cgpa: 9.1 },
      { full_name: 'Ethan Walker', roll_number: 'CS100004', email: 'ethan@college.com', department: 'ECE', cgpa: 8.4 },
      { full_name: 'Sofia Rodriguez', roll_number: 'CS100005', email: 'sofia@college.com', department: 'MECH', cgpa: 7.8 }
    ];

    const studentMap = {}; // mapping name -> id
    
    // First get student demo
    const demoStudentRes = await client.query("SELECT id FROM students WHERE email = 'student@college.com'");
    if (demoStudentRes.rows.length > 0) {
      studentMap['Student Demo'] = demoStudentRes.rows[0].id;
    }

    for (const stud of placementStudents) {
      const check = await client.query("SELECT id FROM students WHERE email = $1", [stud.email]);
      if (check.rows.length === 0) {
        const insertRes = await client.query(
          `INSERT INTO students (full_name, roll_number, email, phone_number, gender, date_of_birth, department, year, semester, section, address, parent_name, parent_phone, parent_email, cgpa, attendance_percentage, is_active)
           VALUES ($1, $2, $3, '9876543210', 'Male', '2004-06-20', $4, 4, 7, 'A', '123 Campus Lane', $5, '9876543210', $6, $7, 90.0, true) RETURNING id`,
          [stud.full_name, stud.roll_number, stud.email, stud.department, `Parent ${stud.full_name}`, `parent.${stud.email}`, stud.cgpa]
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
      { name: 'Infosys', industry: 'IT Services', hr: 'Deepa Nair', email: 'careers@infosys.com', package: '10.5 LPA', hires: 18 }
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

    console.log("\n🎉 Database setup and seeding complete!");
    console.log("👉 You can now log in using any of the demo accounts with password: 'password123'");

  } catch (err) {
    console.error("❌ Setup failed with error:", err);
  } finally {
    await client.end();
  }
}

runSetup();
