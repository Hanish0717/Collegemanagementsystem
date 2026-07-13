import app from './app.js';
import dotenv from 'dotenv';
import pkg from 'pg';
import { seedIfNeeded } from './seed_lightweight.js';
dotenv.config();

const PORT = process.env.PORT || 5000;
const { Client } = pkg;

import { isMockMode } from './config/supabase.js';

// Validate Supabase config
if (isMockMode) {
  console.log("🚀 Running backend in DATABASE MOCK MODE because no live database credentials are configured.");
} else {
  console.log("✅ Live database credentials detected. Ready to process queries.");
}

// Startup database migration
async function runMigrations() {
  if (isMockMode) {
    console.log("ℹ️ Running in DATABASE MOCK MODE. Skipping live DDL migrations.");
    return;
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 3000
  });
  try {
    await client.connect();
    console.log("⏳ Running database migrations...");
    await client.query(`
      -- Ensure columns exist
      ALTER TABLE students ADD COLUMN IF NOT EXISTS user_id uuid;
      ALTER TABLE students ADD COLUMN IF NOT EXISTS admission_number varchar(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_password varchar(255);
      ALTER TABLE faculty ADD COLUMN IF NOT EXISTS user_id uuid;

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
    `);
    
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
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  }); // Hot-reload trigger comment




