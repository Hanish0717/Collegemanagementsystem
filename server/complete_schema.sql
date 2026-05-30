-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if they exist (clean setup)
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS placements CASCADE;
DROP TABLE IF EXISTS otps CASCADE;
DROP TABLE IF EXISTS timetable CASCADE;
DROP TABLE IF EXISTS study_materials CASCADE;
DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS fees CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS issued_books CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. Create Tables
-- DEPARTMENTS Table
CREATE TABLE departments (
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

-- USERS Table
CREATE TABLE users (
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

-- STUDENTS Table
CREATE TABLE students (
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

-- ASSIGNMENTS Table
CREATE TABLE assignments (
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

-- ATTENDANCE Table (references students)
CREATE TABLE attendance (
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

-- BOOKS Table (Library)
CREATE TABLE books (
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

-- ISSUED_BOOKS Table
CREATE TABLE issued_books (
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

-- COMPLAINTS Table
CREATE TABLE complaints (
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

-- LEAVE_REQUESTS Table
CREATE TABLE leave_requests (
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

-- FEES Table (references students)
CREATE TABLE fees (
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

-- RESULTS Table
CREATE TABLE results (
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

-- STUDY_MATERIALS Table
CREATE TABLE study_materials (
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

-- TIMETABLE Table
CREATE TABLE timetable (
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

-- PLACEMENTS Table
CREATE TABLE placements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company varchar(255) NOT NULL,
  position varchar(255) NOT NULL,
  applied_students jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- OTPS Table
CREATE TABLE otps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email varchar(255) NOT NULL,
  otp varchar(255) NOT NULL,
  type varchar(50) NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  attempts integer DEFAULT 0,
  blocked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Seed Users (with hashed password "password123")
INSERT INTO users (name, full_name, email, password, role, child_email, is_verified, mobile_verified, is_phone_verified, is_active) VALUES
('Super Admin', 'Super Admin', 'superadmin@college.com', '$2a$10$tZ216f4k20/9x9D1/7RyeO4W4d.o6tKj.YhGG5T6W3v2lF6oM0s5S', 'super-admin', null, true, true, true, true),
('Admin', 'Admin', 'admin@college.com', '$2a$10$tZ216f4k20/9x9D1/7RyeO4W4d.o6tKj.YhGG5T6W3v2lF6oM0s5S', 'admin', null, true, true, true, true),
('Faculty', 'Faculty', 'faculty@college.com', '$2a$10$tZ216f4k20/9x9D1/7RyeO4W4d.o6tKj.YhGG5T6W3v2lF6oM0s5S', 'faculty', null, true, true, true, true),
('Student', 'Student', 'student@college.com', '$2a$10$tZ216f4k20/9x9D1/7RyeO4W4d.o6tKj.YhGG5T6W3v2lF6oM0s5S', 'student', null, true, true, true, true),
('Parent', 'Parent', 'parent@college.com', '$2a$10$tZ216f4k20/9x9D1/7RyeO4W4d.o6tKj.YhGG5T6W3v2lF6oM0s5S', 'parent', 'student@college.com', true, true, true, true),
('Librarian', 'Librarian', 'librarian@college.com', '$2a$10$tZ216f4k20/9x9D1/7RyeO4W4d.o6tKj.YhGG5T6W3v2lF6oM0s5S', 'librarian', null, true, true, true, true),
('Placement Officer', 'Placement Officer', 'placement@college.com', '$2a$10$tZ216f4k20/9x9D1/7RyeO4W4d.o6tKj.YhGG5T6W3v2lF6oM0s5S', 'placement-officer', null, true, true, true, true),
('Hostel Warden', 'Hostel Warden', 'warden@college.com', '$2a$10$tZ216f4k20/9x9D1/7RyeO4W4d.o6tKj.YhGG5T6W3v2lF6oM0s5S', 'hostel-warden', null, true, true, true, true),
('Transport Manager', 'Transport Manager', 'transport@college.com', '$2a$10$tZ216f4k20/9x9D1/7RyeO4W4d.o6tKj.YhGG5T6W3v2lF6oM0s5S', 'transport-manager', null, true, true, true, true);

-- 5. Seed Student Profile
INSERT INTO students (full_name, roll_number, email, phone_number, gender, date_of_birth, department, year, semester, section, address, parent_name, parent_phone, parent_email, cgpa, attendance_percentage, is_active) VALUES
('Student Demo', 'CS100001', 'student@college.com', '1234567890', 'Male', '2004-05-15', 'CSE', 3, 5, 'A', '123 College Ave, Campus Town', 'Parent Demo', '0987654321', 'parent@college.com', 8.5, 92.5, true);

-- 6. Seed Placements
INSERT INTO placements (company, position, applied_students) VALUES
('Microsoft', 'Full Stack Developer', '[]'::jsonb),
('Google', 'Software Engineer', '[]'::jsonb);

-- 7. Seed Departments
INSERT INTO departments (code, name, head_of_department, faculty_count, student_count, budget, is_active) VALUES
('CSE', 'Computer Science & Engineering', 'Dr. Anjali Mehra', 86, 2140, '₹32L', true),
('AIML', 'Artificial Intelligence & Machine Learning', 'Dr. Rajesh Kumar', 45, 1280, '₹22L', true),
('AIDS', 'Artificial Intelligence & Data Science', 'Dr. Vikram Rao', 38, 960, '₹18L', true),
('CYBERSECURITY', 'Cybersecurity', 'Prof. Sarah Lin', 32, 840, '₹16L', true),
('IT', 'Information Technology', 'Dr. Aisha Khan', 52, 1420, '₹20L', true),
('ECE', 'Electronics & Communication Engineering', 'Prof. Marco Rossi', 64, 1580, '₹24L', true),
('EEE', 'Electrical & Electronics Engineering', 'Dr. Ramana Rao', 42, 1100, '₹18L', true),
('MECH', 'Mechanical Engineering', 'Dr. Suresh Naidu', 58, 1350, '₹22L', true),
('CIVIL', 'Civil Engineering', 'Dr. K. Srinivasa Rao', 40, 980, '₹15L', true);

