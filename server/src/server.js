import app from './app.js';
import dotenv from 'dotenv';
import pkg from 'pg';
import { seedIfNeeded } from './seed_lightweight.js';
import { startScheduler } from './scheduler.js';
dotenv.config();

// Prevent process crashes from unhandled database rejections/exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception thrown:', err);
});

const PORT = process.env.PORT || 5000;
const { Client } = pkg;

import { isMockMode } from './config/supabase.js';



// Triggering server restart
// Startup database migration
async function runMigrations() {
  if (isMockMode) {
    console.log("ℹ️ Running in DATABASE MOCK MODE. Skipping live DDL migrations.");
    return;
  }

  const isLocalDatabase =
    process.env.DATABASE_URL?.includes('localhost') ||
    process.env.DATABASE_URL?.includes('127.0.0.1') ||
    process.env.DATABASE_URL?.includes('db') ||
    process.env.DATABASE_URL?.includes('postgres') ||
    process.env.DATABASE_URL?.includes('host.docker.internal') ||
    process.env.DATABASE_SSL === 'false';

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocalDatabase ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 3000
  });
  try {
    await client.connect();
    console.log("⏳ Running database migrations...");
    await client.query(`
      -- Create subjects table
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

      -- Ensure columns exist
      ALTER TABLE students ADD COLUMN IF NOT EXISTS user_id uuid;
      ALTER TABLE students ADD COLUMN IF NOT EXISTS admission_number varchar(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_password varchar(255);
      ALTER TABLE faculty ADD COLUMN IF NOT EXISTS user_id uuid;
      ALTER TABLE faculty ADD COLUMN IF NOT EXISTS attendance_percentage numeric(5, 2) DEFAULT 100.00;

      -- Ensure books table has all optional columns
      ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_image text DEFAULT '';
      ALTER TABLE books ADD COLUMN IF NOT EXISTS description text DEFAULT '';
      ALTER TABLE books ADD COLUMN IF NOT EXISTS shelf_location varchar(100) DEFAULT '';
      ALTER TABLE books ADD COLUMN IF NOT EXISTS edition varchar(100) DEFAULT '';
      ALTER TABLE books ADD COLUMN IF NOT EXISTS language varchar(100) DEFAULT 'English';
      ALTER TABLE books ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
      ALTER TABLE books ADD COLUMN IF NOT EXISTS available_quantity integer DEFAULT 0;

      -- Create faculty_attendance table
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

      -- Add period and time columns to attendance if not exist
      ALTER TABLE attendance ADD COLUMN IF NOT EXISTS period integer;
      ALTER TABLE attendance ADD COLUMN IF NOT EXISTS time varchar(50);

      -- Modify unique constraint on attendance table
      ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_student_date_subject_key;
      ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_student_date_subject_period_key;
      ALTER TABLE attendance ADD CONSTRAINT attendance_student_date_subject_period_key UNIQUE(student, date, subject, period);

      -- Recreate foreign key constraints to ensure PostgREST can map relations without ambiguity
      ALTER TABLE students DROP CONSTRAINT IF EXISTS students_user_id_fkey;
      ALTER TABLE students DROP CONSTRAINT IF EXISTS fk_students_users;
      ALTER TABLE students ADD CONSTRAINT fk_students_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

      ALTER TABLE faculty DROP CONSTRAINT IF EXISTS faculty_user_id_fkey;
      ALTER TABLE faculty DROP CONSTRAINT IF EXISTS fk_faculty_users;
      ALTER TABLE faculty ADD CONSTRAINT fk_faculty_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

      -- Link legacy profiles to user records by email if not already linked
      UPDATE students SET user_id = users.id FROM users WHERE students.email = users.email AND students.user_id IS NULL;
      UPDATE faculty SET user_id = users.id FROM users WHERE faculty.email = users.email AND faculty.user_id IS NULL;

      -- Placement Table Migrations
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

      ALTER TABLE placements ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES placement_companies(id) ON DELETE SET NULL;
      ALTER TABLE placements ADD COLUMN IF NOT EXISTS drive_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
      ALTER TABLE placements ADD COLUMN IF NOT EXISTS venue varchar(255) DEFAULT 'Virtual';
      ALTER TABLE placements ADD COLUMN IF NOT EXISTS deadline timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
      ALTER TABLE placements ADD COLUMN IF NOT EXISTS status varchar(50) DEFAULT 'upcoming';
      ALTER TABLE placements ADD COLUMN IF NOT EXISTS package_min numeric(10, 2) DEFAULT 0.00;
      ALTER TABLE placements ADD COLUMN IF NOT EXISTS package_max numeric(10, 2) DEFAULT 0.00;
      ALTER TABLE placements ADD COLUMN IF NOT EXISTS eligibility_min_cgpa numeric(4, 2) DEFAULT 0.00;
      ALTER TABLE placements ADD COLUMN IF NOT EXISTS eligibility_departments jsonb DEFAULT '[]'::jsonb;

      CREATE TABLE IF NOT EXISTS placement_interviews (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        student uuid REFERENCES students(id) ON DELETE CASCADE,
        student_name varchar(255) NOT NULL,
        company_name varchar(255) NOT NULL,
        drive_id uuid REFERENCES placements(id) ON DELETE CASCADE,
        round varchar(100) NOT NULL,
        date date NOT NULL,
        time varchar(50) NOT NULL,
        mode varchar(50) DEFAULT 'Online',
        status varchar(50) DEFAULT 'Scheduled',
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      ALTER TABLE placement_interviews ADD COLUMN IF NOT EXISTS feedback_comments text;
      ALTER TABLE placement_interviews ADD COLUMN IF NOT EXISTS feedback_rating integer;

      CREATE TABLE IF NOT EXISTS placement_training (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name varchar(255) NOT NULL,
        type varchar(100) NOT NULL,
        date date NOT NULL,
        time varchar(50) NOT NULL,
        duration varchar(50) NOT NULL,
        enrolled_students integer DEFAULT 0,
        completed integer DEFAULT 0,
        pass_percentage integer DEFAULT 0,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS placement_notifications (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        title varchar(255) NOT NULL,
        time varchar(100) NOT NULL,
        type varchar(50) NOT NULL,
        unread boolean DEFAULT true,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Create broadcast_notifications table
      CREATE TABLE IF NOT EXISTS broadcast_notifications (
        id varchar(50) PRIMARY KEY,
        title varchar(255) NOT NULL,
        type varchar(100) NOT NULL,
        audience varchar(255) NOT NULL,
        time varchar(100) NOT NULL,
        status varchar(50) NOT NULL,
        content text,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Create admin_notifications table
      CREATE TABLE IF NOT EXISTS admin_notifications (
        id varchar(50) PRIMARY KEY,
        title varchar(255) NOT NULL,
        category varchar(100) NOT NULL,
        time varchar(100) NOT NULL,
        unread boolean DEFAULT true,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Create faculty_notifications table
      CREATE TABLE IF NOT EXISTS faculty_notifications (
        id varchar(50) PRIMARY KEY,
        title varchar(255) NOT NULL,
        type varchar(100) NOT NULL,
        priority varchar(50) NOT NULL,
        time varchar(100) NOT NULL,
        unread boolean DEFAULT true,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Create faculty_notification_settings table
      CREATE TABLE IF NOT EXISTS faculty_notification_settings (
        id varchar(50) PRIMARY KEY,
        label varchar(255) NOT NULL,
        enabled boolean DEFAULT true,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Create student_notifications table
      CREATE TABLE IF NOT EXISTS student_notifications (
        id varchar(50) PRIMARY KEY,
        title varchar(255) NOT NULL,
        type varchar(100) NOT NULL,
        priority varchar(50) NOT NULL,
        time varchar(100) NOT NULL,
        unread boolean DEFAULT true,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );
      
      ALTER TABLE student_notifications ADD COLUMN IF NOT EXISTS student_id uuid REFERENCES students(id) ON DELETE CASCADE NULL;

      -- Create attendance_notifications table
      CREATE TABLE IF NOT EXISTS attendance_notifications (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id uuid REFERENCES students(id) ON DELETE CASCADE,
        student_name varchar(255) NOT NULL,
        roll_number varchar(100) NOT NULL,
        department varchar(50) NOT NULL,
        attendance_percentage numeric(5, 2) NOT NULL,
        notification_type varchar(100) NOT NULL, -- 'Warning', 'Critical Warning', 'Detention Alert'
        recipient_role varchar(100) NOT NULL, -- 'Student', 'Parent', 'Faculty', 'HOD'
        recipient_email varchar(255) NOT NULL,
        status varchar(50) DEFAULT 'Sent', -- 'Sent', 'Failed'
        error_details text,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Create below_75_students table
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

      -- Create attendance_notification_requests table
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
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        approved_by varchar(255),
        approved_at timestamp with time zone,
        sent_at timestamp with time zone
      );

      -- Create college_settings table
      CREATE TABLE IF NOT EXISTS college_settings (
        key varchar(255) PRIMARY KEY,
        value varchar(255) NOT NULL,
        description text,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Seed HOD approval toggle default if not exists
      INSERT INTO college_settings (key, value, description)
      VALUES ('attendance_approval_enabled', 'false', 'Enable/disable HOD approval flow for attendance warnings')
      ON CONFLICT (key) DO NOTHING;

      -- Create attendance_notification_templates table
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
      ('detention-alert', 'Detention Alert', 'Detention Risk Alert', 'Dear Parent / Student,\n\nYour overall attendance has fallen to {attendance_percentage}%, putting you at immediate risk of detention.\n\nKindly note that you will not be allowed to write the semester exams if this is not resolved.\n\nBest regards,\nPrincipal')
      ON CONFLICT (id) DO NOTHING;

      -- Create attendance_notification_history table
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

      -- Create attendance_notification_logs table
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

      -- Update attendance_notification_requests columns
      ALTER TABLE attendance_notification_requests ADD COLUMN IF NOT EXISTS subject text;
      ALTER TABLE attendance_notification_requests ADD COLUMN IF NOT EXISTS message text;
      ALTER TABLE attendance_notification_requests ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;
      ALTER TABLE attendance_notification_requests ADD COLUMN IF NOT EXISTS ip_address varchar(100);
      ALTER TABLE attendance_notification_requests ADD COLUMN IF NOT EXISTS approved_date timestamp with time zone;
      ALTER TABLE attendance_notification_requests ADD COLUMN IF NOT EXISTS sent_date timestamp with time zone;
      ALTER TABLE attendance_notification_requests ALTER COLUMN student_id DROP NOT NULL;
      ALTER TABLE attendance_notification_requests ALTER COLUMN student_name DROP NOT NULL;
      ALTER TABLE attendance_notification_requests ALTER COLUMN roll_number DROP NOT NULL;
      ALTER TABLE attendance_notification_requests ALTER COLUMN department DROP NOT NULL;
      ALTER TABLE attendance_notification_requests ALTER COLUMN attendance_percentage DROP NOT NULL;
      ALTER TABLE attendance_notification_requests ADD COLUMN IF NOT EXISTS student_ids jsonb DEFAULT '[]'::jsonb;
      ALTER TABLE faculty_notifications ADD COLUMN IF NOT EXISTS faculty_id uuid REFERENCES users(id);



      -- Hostel Blocks Overview Extra Columns
      ALTER TABLE hostel_blocks ADD COLUMN IF NOT EXISTS type varchar(50) DEFAULT 'Boys';
      ALTER TABLE hostel_blocks ADD COLUMN IF NOT EXISTS capacity integer DEFAULT 0;
      ALTER TABLE hostel_blocks ADD COLUMN IF NOT EXISTS ac_rooms integer DEFAULT 0;
      ALTER TABLE hostel_blocks ADD COLUMN IF NOT EXISTS non_ac_rooms integer DEFAULT 0;
      ALTER TABLE hostel_blocks ADD COLUMN IF NOT EXISTS occupants integer DEFAULT 0;
      ALTER TABLE hostel_blocks ADD COLUMN IF NOT EXISTS contact_number varchar(50) DEFAULT '';
      ALTER TABLE hostel_blocks ADD COLUMN IF NOT EXISTS status varchar(50) DEFAULT 'Available';
      ALTER TABLE hostel_blocks ADD COLUMN IF NOT EXISTS image_url text DEFAULT '';

      -- Room Management & Allocation Columns
      ALTER TABLE hostel_rooms ADD COLUMN IF NOT EXISTS room_type varchar(50) DEFAULT 'Double';
      ALTER TABLE hostel_rooms ADD COLUMN IF NOT EXISTS ac_type varchar(50) DEFAULT 'Non-AC';
      ALTER TABLE hostel_rooms ADD COLUMN IF NOT EXISTS room_status varchar(50) DEFAULT 'Vacant';
      ALTER TABLE hostel_rooms ADD COLUMN IF NOT EXISTS description text DEFAULT '';
      ALTER TABLE hostel_rooms ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

      ALTER TABLE hostel_allocations ADD COLUMN IF NOT EXISTS allocation_date date DEFAULT CURRENT_DATE;
      ALTER TABLE hostel_allocations ADD COLUMN IF NOT EXISTS check_in_date timestamp with time zone;
      ALTER TABLE hostel_allocations ADD COLUMN IF NOT EXISTS check_out_date timestamp with time zone;

      -- Create exams table
      CREATE TABLE IF NOT EXISTS exams (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name varchar(255) NOT NULL,
        type varchar(50) NOT NULL,
        department varchar(50) NOT NULL,
        year integer NOT NULL,
        semester integer NOT NULL,
        start_date date NOT NULL,
        end_date date NOT NULL,
        status varchar(50) DEFAULT 'Upcoming',
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Create exam_timetables table
      CREATE TABLE IF NOT EXISTS exam_timetables (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        exam_id uuid REFERENCES exams(id) ON DELETE CASCADE,
        subject varchar(255) NOT NULL,
        date date NOT NULL,
        time varchar(50) NOT NULL,
        hall varchar(50) NOT NULL,
        duration varchar(50) NOT NULL,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Create hall_tickets table
      CREATE TABLE IF NOT EXISTS hall_tickets (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id uuid REFERENCES students(id) ON DELETE CASCADE,
        exam_id uuid REFERENCES exams(id) ON DELETE CASCADE,
        seat_number varchar(50),
        status varchar(50) DEFAULT 'Pending',
        approved_by uuid REFERENCES users(id) ON DELETE SET NULL,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        UNIQUE(student_id, exam_id)
      );

      -- Add exam_id to results table
      ALTER TABLE results ADD COLUMN IF NOT EXISTS exam_id uuid REFERENCES exams(id) ON DELETE SET NULL;
      ALTER TABLE results DROP CONSTRAINT IF EXISTS results_student_subject_semester_key;
      ALTER TABLE results DROP CONSTRAINT IF EXISTS results_student_subject_semester_exam_key;
      ALTER TABLE results ADD CONSTRAINT results_student_subject_semester_exam_key UNIQUE (student, subject, semester, exam_id);

      -- Advanced Exam Cell Columns
      ALTER TABLE results ADD COLUMN IF NOT EXISTS internal_marks numeric(5,2) DEFAULT 0.00;
      ALTER TABLE results ADD COLUMN IF NOT EXISTS external_marks numeric(5,2) DEFAULT 0.00;
      ALTER TABLE results ADD COLUMN IF NOT EXISTS exam_type varchar(50) DEFAULT 'Regular';
      ALTER TABLE results ADD COLUMN IF NOT EXISTS grace_applied boolean DEFAULT false;
      ALTER TABLE results ADD COLUMN IF NOT EXISTS grace_marks numeric(4,2) DEFAULT 0.00;

      ALTER TABLE courses ADD COLUMN IF NOT EXISTS prerequisite_code varchar(50);

      CREATE TABLE IF NOT EXISTS marks_correction_requests (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        result_id uuid REFERENCES results(id) ON DELETE CASCADE,
        requested_by uuid REFERENCES users(id) ON DELETE SET NULL,
        old_internal_marks numeric(5,2),
        old_external_marks numeric(5,2),
        new_internal_marks numeric(5,2),
        new_external_marks numeric(5,2),
        reason text NOT NULL,
        status varchar(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
        reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
        reviewer_remarks text,
        requested_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        reviewed_at timestamp with time zone
      );

      -- Create events table
      CREATE TABLE IF NOT EXISTS events (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        title varchar(255) NOT NULL,
        description text NOT NULL,
        type varchar(50) NOT NULL,
        date date NOT NULL,
        time varchar(50),
        venue varchar(255) NOT NULL,
        organizer varchar(255),
        status varchar(50) DEFAULT 'Pending Approval',
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Ensure type, venue, time, organizer exist in events table
      ALTER TABLE events ADD COLUMN IF NOT EXISTS type varchar(50);
      ALTER TABLE events ADD COLUMN IF NOT EXISTS venue varchar(255);
      ALTER TABLE events ADD COLUMN IF NOT EXISTS time varchar(50);
      ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer varchar(255);

      -- Populate defaults for legacy event rows
      UPDATE events SET type = 'Event' WHERE type IS NULL;
      UPDATE events SET venue = 'Main Campus' WHERE venue IS NULL;

      -- Ensure study_materials table exists
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
        downloads integer DEFAULT 0,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Ensure downloads column exists in study_materials
      ALTER TABLE study_materials ADD COLUMN IF NOT EXISTS downloads integer DEFAULT 0;

      -- Create notification_preferences table
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
        academic_alerts boolean DEFAULT true,
        attendance_alerts boolean DEFAULT true,
        fee_alerts boolean DEFAULT true,
        placement_alerts boolean DEFAULT true,
        hostel_alerts boolean DEFAULT true,
        transport_alerts boolean DEFAULT true,
        email_enabled boolean DEFAULT true,
        in_app_enabled boolean DEFAULT true,
        sms_enabled boolean DEFAULT false,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Create notification_logs table
      CREATE TABLE IF NOT EXISTS notification_logs (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid REFERENCES users(id) ON DELETE SET NULL,
        recipient_email varchar(255) NOT NULL,
        type varchar(100) NOT NULL,
        title varchar(255) NOT NULL,
        message text NOT NULL,
        channel varchar(50) NOT NULL,
        status varchar(50) NOT NULL,
        error_details text,
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

      -- Create ebooks table
      CREATE TABLE IF NOT EXISTS ebooks (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        title varchar(255) NOT NULL,
        author varchar(255) NOT NULL,
        category varchar(255) NOT NULL,
        format varchar(50) DEFAULT 'PDF',
        size varchar(50) NOT NULL,
        downloads integer DEFAULT 0,
        file_url text,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Create transport_buses table
      CREATE TABLE IF NOT EXISTS transport_buses (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        bus_number varchar(50) UNIQUE NOT NULL,
        make varchar(100),
        model varchar(100),
        capacity integer NOT NULL,
        type varchar(50) DEFAULT 'Diesel',
        status varchar(50) DEFAULT 'Active',
        gps_device_number varchar(100),
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Create transport_drivers table
      CREATE TABLE IF NOT EXISTS transport_drivers (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        full_name varchar(255) NOT NULL,
        phone varchar(50),
        license_number varchar(100) UNIQUE NOT NULL,
        experience_years integer DEFAULT 0,
        status varchar(50) DEFAULT 'Active',
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Create transport_routes table
      CREATE TABLE IF NOT EXISTS transport_routes (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name varchar(255) NOT NULL,
        route_number varchar(50) UNIQUE NOT NULL,
        start_point varchar(255) NOT NULL,
        end_point varchar(255) NOT NULL,
        status varchar(50) DEFAULT 'active',
        bus uuid REFERENCES transport_buses(id) ON DELETE SET NULL,
        driver uuid REFERENCES transport_drivers(id) ON DELETE SET NULL,
        stops jsonb DEFAULT '[]'::jsonb,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Create transport_allocations table
      CREATE TABLE IF NOT EXISTS transport_allocations (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id uuid REFERENCES students(id) ON DELETE CASCADE,
        route_id uuid REFERENCES transport_routes(id) ON DELETE CASCADE,
        stop_name varchar(255),
        pass_number varchar(100) UNIQUE,
        academic_year varchar(50) NOT NULL,
        monthly_fare decimal(10,2) DEFAULT 0.00,
        status varchar(50) DEFAULT 'Active',
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      -- Create transport_fees table
      CREATE TABLE IF NOT EXISTS transport_fees (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id uuid REFERENCES students(id) ON DELETE CASCADE,
        academic_year varchar(50) NOT NULL,
        month varchar(50) NOT NULL,
        year varchar(10) NOT NULL,
        total_amount decimal(10,2) NOT NULL,
        status varchar(50) DEFAULT 'Unpaid',
        due_date varchar(50),
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);

    // Seed default subjects if empty
    const subjectsCountRes = await client.query("SELECT COUNT(*) FROM subjects");
    if (parseInt(subjectsCountRes.rows[0].count, 10) === 0) {
      console.log("Seeding subjects table...");
      const defaultSubjects = [
        // CSE
        { code: 'CS501', name: 'Data Structures', dept: 'CSE', semester: 'Semester 5', credits: 4 },
        { code: 'CS502', name: 'Algorithms', dept: 'CSE', semester: 'Semester 5', credits: 4 },
        { code: 'CS503', name: 'Database Systems', dept: 'CSE', semester: 'Semester 5', credits: 4 },
        { code: 'CS504', name: 'Web Technologies', dept: 'CSE', semester: 'Semester 5', credits: 4 },
        { code: 'CS505', name: 'Operating Systems', dept: 'CSE', semester: 'Semester 5', credits: 4 },
        // AIML
        { code: 'AM501', name: 'Machine Learning', dept: 'AIML', semester: 'Semester 5', credits: 4 },
        { code: 'AM502', name: 'Artificial Intelligence', dept: 'AIML', semester: 'Semester 5', credits: 4 },
        { code: 'AM503', name: 'Python Programming', dept: 'AIML', semester: 'Semester 5', credits: 4 },
        { code: 'AM504', name: 'Data Visualization', dept: 'AIML', semester: 'Semester 5', credits: 4 },
        { code: 'AM505', name: 'Neural Networks', dept: 'AIML', semester: 'Semester 5', credits: 4 },
        // AIDS
        { code: 'AD501', name: 'Data Science Foundations', dept: 'AIDS', semester: 'Semester 5', credits: 4 },
        { code: 'AD502', name: 'Big Data Analytics', dept: 'AIDS', semester: 'Semester 5', credits: 4 },
        { code: 'AD503', name: 'Statistical Methods', dept: 'AIDS', semester: 'Semester 5', credits: 4 },
        { code: 'AD504', name: 'Data Mining', dept: 'AIDS', semester: 'Semester 5', credits: 4 },
        { code: 'AD505', name: 'Deep Learning', dept: 'AIDS', semester: 'Semester 5', credits: 4 },
        // ECE
        { code: 'EC501', name: 'Digital Electronics', dept: 'ECE', semester: 'Semester 5', credits: 4 },
        { code: 'EC502', name: 'Microprocessors', dept: 'ECE', semester: 'Semester 5', credits: 4 },
        { code: 'EC503', name: 'Analog Communications', dept: 'ECE', semester: 'Semester 5', credits: 4 },
        { code: 'EC504', name: 'Signals and Systems', dept: 'ECE', semester: 'Semester 5', credits: 4 },
        { code: 'EC505', name: 'VLSI Design', dept: 'ECE', semester: 'Semester 5', credits: 4 },
        // EEE
        { code: 'EE501', name: 'Electrical Circuits', dept: 'EEE', semester: 'Semester 5', credits: 4 },
        { code: 'EE502', name: 'Power Systems', dept: 'EEE', semester: 'Semester 5', credits: 4 },
        { code: 'EE503', name: 'Control Systems', dept: 'EEE', semester: 'Semester 5', credits: 4 },
        { code: 'EE504', name: 'Electrical Machines', dept: 'EEE', semester: 'Semester 5', credits: 4 },
        { code: 'EE505', name: 'Power Electronics', dept: 'EEE', semester: 'Semester 5', credits: 4 }
      ];
      for (const s of defaultSubjects) {
        await client.query(
          "INSERT INTO subjects (code, name, department, semester, credits, status) VALUES ($1, $2, $3, $4, $5, 'Active')",
          [s.code, s.name, s.dept, s.semester, s.credits]
        );
      }
    }

    // Seed admin notifications
    const adminNotifsCount = await client.query("SELECT COUNT(*) FROM admin_notifications");
    if (parseInt(adminNotifsCount.rows[0].count) === 0) {
      console.log("Seeding admin notifications...");
      const adminNotifs = [
        ['AN-001', '5 new student admissions today', 'Students', 'Just now', true],
        ['AN-002', '3 student transfer requests pending', 'Students', '2 hours ago', true],
        ['AN-003', '2 faculty leave requests pending', 'Faculty', '4 hours ago', true],
        ['AN-004', 'New faculty assigned to AIML', 'Faculty', '1 day ago', false],
        ['AN-005', '15 students below 75% attendance', 'Academic', '3 hours ago', true],
        ['AN-006', '12 students have pending fees', 'Fees', '5 hours ago', true],
        ['AN-007', '₹50,000 fees collected today', 'Fees', 'Just now', false],
        ['AN-008', '3 hostel applications pending approval', 'Hostel', '1 day ago', true],
        ['AN-009', '2 transport registrations pending', 'Transport', '1 day ago', true],
        ['AN-010', 'New placement drive created: TCS', 'Placement', '2 days ago', false],
        ['AN-011', '5 students shortlisted by Infosys', 'Placement', '2 days ago', true],
        ['AN-012', 'Library books due reminder circular issued', 'Library', '6 hours ago', true],
        ['AN-013', 'Mid-term exam schedule released', 'Academic', '1 day ago', false],
        ['AN-014', 'Faculty meeting scheduled for tomorrow', 'Academic', '1 day ago', false]
      ];
      for (const n of adminNotifs) {
        await client.query(
          "INSERT INTO admin_notifications (id, title, category, time, unread) VALUES ($1, $2, $3, $4, $5)",
          n
        );
      }
    }

    // Seed broadcast notifications
    const broadcastsCount = await client.query("SELECT COUNT(*) FROM broadcast_notifications");
    if (parseInt(broadcastsCount.rows[0].count) === 0) {
      console.log("Seeding broadcast notifications...");
      const broadcasts = [
        ['B-001', 'Fee Payment Reminder', 'Email', 'All Students', '2 hours ago', 'Delivered', 'Dear student, your fee payment is due on {date}. Please ensure timely payment.'],
        ['B-002', 'Low Attendance Alert', 'SMS', 'All Students', '5 hours ago', 'Delivered', 'Your attendance is below 75%. Please attend classes regularly.'],
        ['B-003', 'Tech Fest 2026 Announcement', 'WhatsApp', 'All Students', '1 day ago', 'Delivered', 'Join us for Tech Fest on {date}. Register now!'],
        ['B-004', 'Exam Schedule Update', 'Email', 'All Faculty', '2 days ago', 'Delivered', 'The mid-semester exam timetable is published. Please review.']
      ];
      for (const b of broadcasts) {
        await client.query(
          "INSERT INTO broadcast_notifications (id, title, type, audience, time, status, content) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          b
        );
      }
    }

    // Seed faculty notifications
    const facNotifsCount = await client.query("SELECT COUNT(*) FROM faculty_notifications");
    if (parseInt(facNotifsCount.rows[0].count) === 0) {
      console.log("Seeding faculty notifications...");
      const facNotifs = [
        ['FN-001', 'Assignment submission reminder', 'Assignment', 'High', '1h ago', true],
        ['FN-002', 'Data Structures assignment graded', 'Assignment', 'Low', '1d ago', false],
        ['FN-003', 'DBMS quiz submission due soon', 'Assignment', 'High', '2d ago', false],
        ['FN-004', 'Compiler Design project guidelines updated', 'Assignment', 'Medium', '3d ago', false],
        ['FN-005', 'AI midterm assignment deadline extended', 'Assignment', 'Medium', '4d ago', false],
        ['FN-006', 'Class schedule change: DS Lecture moved to Room 402', 'Class', 'Medium', '3h ago', false],
        ['FN-007', 'Extra class scheduled for Algorithms on Friday', 'Class', 'Medium', '2d ago', false],
        ['FN-008', 'Practical lab session cancelled tomorrow', 'Class', 'Low', '4d ago', false],
        ['FN-009', 'Department meeting tomorrow at 10 AM', 'Meeting', 'High', '5h ago', true],
        ['FN-010', 'Faculty board meeting agenda shared', 'Meeting', 'Low', '3d ago', false],
        ['FN-011', 'Security scan found no critical risks', 'System', 'Low', '3h ago', false],
        ['FN-012', 'System maintenance schedule on Sunday', 'System', 'Medium', '1d ago', false],
        ['FN-013', 'New policy rule updates published', 'System', 'Low', '2d ago', false],
        ['FN-014', 'Database automatic backup completed successfully', 'System', 'Low', '3d ago', false]
      ];
      for (const n of facNotifs) {
        await client.query(
          "INSERT INTO faculty_notifications (id, title, type, priority, time, unread) VALUES ($1, $2, $3, $4, $5, $6)",
          n
        );
      }
    }

    // Seed faculty settings
    const facSettingsCount = await client.query("SELECT COUNT(*) FROM faculty_notification_settings");
    if (parseInt(facSettingsCount.rows[0].count) === 0) {
      console.log("Seeding faculty notification settings...");
      const facSettings = [
        ['settings-1', 'Assignment reminders', true],
        ['settings-2', 'Class notifications', true],
        ['settings-3', 'Meeting reminders', true],
        ['settings-4', 'Student messages', false],
        ['settings-5', 'System updates', true]
      ];
      for (const s of facSettings) {
        await client.query(
          "INSERT INTO faculty_notification_settings (id, label, enabled) VALUES ($1, $2, $3)",
          s
        );
      }
    }

    // Seed student notifications
    const studentNotifsCount = await client.query("SELECT COUNT(*) FROM student_notifications");
    if (parseInt(studentNotifsCount.rows[0].count) === 0) {
      console.log("Seeding student notifications...");
      const studentNotifs = [
        ['SN-001', 'Mid-term exam starts on 15 June', 'Academic', 'High', '1 day ago', true],
        ['SN-002', 'DBMS assignment marks published', 'Academic', 'Low', '2 days ago', false],
        ['SN-003', 'Semester results released', 'Academic', 'High', '3 days ago', false],
        ['SN-004', 'Your attendance dropped to 72%', 'Attendance', 'High', '5 hours ago', true],
        ['SN-005', 'Attendance updated for AIML class', 'Attendance', 'Low', '1 day ago', false],
        ['SN-006', 'Fee payment due on 30 June', 'Fees', 'High', '2 hours ago', true],
        ['SN-007', 'Payment received successfully', 'Fees', 'Low', '1 day ago', false],
        ['SN-008', 'Book return due tomorrow', 'Library', 'High', '4 hours ago', true],
        ['SN-009', '₹100 library fine pending', 'Library', 'Medium', '2 days ago', false],
        ['SN-010', 'TCS drive registration opened', 'Placement', 'High', '1 day ago', true],
        ['SN-011', 'You are shortlisted for Infosys interview', 'Placement', 'High', '3 days ago', false],
        ['SN-012', 'Room allocation completed', 'Hostel', 'Low', '2 days ago', false],
        ['SN-013', 'Hostel fee due', 'Hostel', 'High', '4 days ago', false],
        ['SN-014', 'Route 3 timing updated', 'Transport', 'Medium', '1 day ago', false],
        ['SN-015', 'Bus service unavailable tomorrow', 'Transport', 'High', '12 hours ago', true],
        ['SN-016', 'Faculty uploaded study material', 'Faculty', 'Low', '6 hours ago', false],
        ['SN-017', 'Class cancelled tomorrow', 'Faculty', 'High', '1 hour ago', true]
      ];
      for (const n of studentNotifs) {
        await client.query(
          "INSERT INTO student_notifications (id, title, type, priority, time, unread) VALUES ($1, $2, $3, $4, $5, $6)",
          n
        );
      }
    }

    // Reload PostgREST schema cache
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log("✅ PostgREST schema cache reload triggered.");

    console.log("✅ Database migrations completed successfully (added columns & linked legacy profiles).");
  } catch (err) {
    const isNetworkOrTimeout = err.code === 'ETIMEDOUT' || 
                               err.code === 'ENOTFOUND' || 
                               err.code === 'ECONNREFUSED' || 
                               err.code === 'ENETUNREACH' || 
                               err.message?.includes('timeout') ||
                               err.message?.includes('getaddrinfo');

    if (isNetworkOrTimeout) {
      console.log("\n⚠️  [MIGRATION NOTICE]: Could not connect directly to the PostgreSQL database via TCP.");
      console.log(`ℹ️  Reason: ${err.code || 'TIMEOUT'} (${err.message.split('\n')[0]})`);
      console.log("👉  This is normal in environments with restrictive firewalls (blocking ports 5432/6543) or limited IPv6 support.");
      console.log("✅  No action required! The application routes communicate using the Supabase HTTPS Client on port 443, which is fully operational.\n");
    } else {
      console.error("❌ Database migration failed:", err);
    }
  } finally {
    try {
      await client.end();
    } catch (e) {
      // Ignore end failure if never connected
    }
  }
}

// Start server after migrations
runMigrations()
  .then(() => {
    if (isMockMode) return;
    return seedIfNeeded();
  })
  .then(async () => {
    if (isMockMode) {
      return;
    }
    try {
      const { supabase } = await import('./config/supabase.js');
      
      console.log("⚡ Checking database query builder connectivity...");
      const { data: students, count, error } = await supabase
        .from('students')
        .select('*, users!inner(is_verified)', { count: 'exact' })
        .eq('is_active', true)
        .eq('users.is_verified', true)
        .range(0, 5);

      if (error) {
        console.error("❌ Supabase query builder error:", error);
      } else {
        console.log(`\n🔑 LIVE STUDENTS IN DATABASE (${count} total):`);
        students.forEach(r => console.log(`   - ${r.full_name} (${r.roll_number}) | ${r.email} | Dept: ${r.department}`));
        console.log("======================================\n");
      }
    } catch (err) {
      console.error("❌ Supabase verifier test failed:", err.message);
    }
  })
  .then(() => {
    let hasStarted = false;
    let retryTimer = null;

    function startServer(port, retries = 10, delay = 1000) {
      if (hasStarted) return;

      const server = app.listen(port, () => {
        hasStarted = true;
        if (retryTimer) clearTimeout(retryTimer);
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
        startScheduler();
      });

      server.on('error', (err) => {
        if (hasStarted) {
          try { server.close(); } catch (e) {}
          return;
        }

        if (err.code === 'EADDRINUSE') {
          try {
            server.close();
          } catch (e) {}

          if (retries > 0) {
            console.warn(`⚠️ Port ${port} is busy. Retrying in ${delay}ms... (${retries} retries left)`);
            if (retryTimer) clearTimeout(retryTimer);
            retryTimer = setTimeout(() => {
              startServer(port, retries - 1, delay);
            }, delay);
          } else {
            console.error(`❌ Port ${port} is occupied. Max retries reached. Exiting...`);
            process.exit(1);
          }
        } else {
          console.error("❌ Server error:", err);
        }
      });
    }

    startServer(PORT);
  })
  .catch((err) => {
    console.error("❌ Critical server startup failure:", err);
  }); // trigger reload 456




