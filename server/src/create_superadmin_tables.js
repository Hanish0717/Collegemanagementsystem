import pkg from 'pg';
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
    rejectUnauthorized: false
  }
});

const schema = `
-- Create subjects table (if not exists)
CREATE TABLE IF NOT EXISTS subjects (
  code varchar(50) PRIMARY KEY,
  name varchar(255) NOT NULL,
  department varchar(255) NOT NULL,
  semester varchar(50) NOT NULL,
  credits integer NOT NULL,
  status varchar(50) DEFAULT 'Active',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create backups table (if not exists)
CREATE TABLE IF NOT EXISTS backups (
  id varchar(50) PRIMARY KEY,
  type varchar(100) NOT NULL,
  size varchar(50) NOT NULL,
  date varchar(100) NOT NULL,
  status varchar(50) DEFAULT 'Completed',
  cloud varchar(50) DEFAULT 'Synced',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create automations table (if not exists)
CREATE TABLE IF NOT EXISTS automations (
  name varchar(255) PRIMARY KEY,
  trigger varchar(255) NOT NULL,
  runs integer DEFAULT 0,
  success integer DEFAULT 100,
  enabled boolean DEFAULT true,
  frequency varchar(50) DEFAULT 'Daily',
  target varchar(100) DEFAULT 'All Students',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create automation_logs table (if not exists)
CREATE TABLE IF NOT EXISTS automation_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event varchar(255) NOT NULL,
  result varchar(255) NOT NULL,
  time varchar(100) NOT NULL,
  status varchar(50) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create system_notifications table (if not exists)
CREATE TABLE IF NOT EXISTS system_notifications (
  id varchar(50) PRIMARY KEY,
  title varchar(255) NOT NULL,
  type varchar(100) NOT NULL,
  time varchar(100) NOT NULL,
  unread boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create security_logs table (if not exists)
CREATE TABLE IF NOT EXISTS security_logs (
  id varchar(50) PRIMARY KEY,
  user_name varchar(255) NOT NULL,
  event varchar(255) NOT NULL,
  ip varchar(50) NOT NULL,
  time varchar(100) NOT NULL,
  status varchar(50) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create system_settings table (if not exists)
CREATE TABLE IF NOT EXISTS system_settings (
  key varchar(255) PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
`;

async function run() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL successfully.");

    console.log("Creating tables...");
    await client.query(schema);
    console.log("Tables created successfully.");

    // Seed subjects
    const subjectsCount = await client.query("SELECT COUNT(*) FROM subjects");
    if (parseInt(subjectsCount.rows[0].count) === 0) {
      console.log("Seeding subjects...");
      const subjects = [
        ['CS301', 'Data Structures', 'Computer Science & Engineering', 'Semester 3', 4, 'Active'],
        ['AI404', 'Deep Learning & Neural Networks', 'Artificial Intelligence & Machine Learning', 'Semester 6', 4, 'Active'],
        ['DS202', 'Data Mining & Visualization', 'Artificial Intelligence & Data Science', 'Semester 4', 3, 'Active'],
        ['CY501', 'Cryptography & Network Security', 'Cybersecurity', 'Semester 5', 4, 'Active'],
        ['IT101', 'Introduction to Information Technology', 'Information Technology', 'Semester 1', 3, 'Active'],
        ['EC202', 'Digital Signal Processing', 'Electronics & Communication Engineering', 'Semester 4', 3, 'Active'],
        ['EE301', 'Power System Analysis', 'Electrical & Electronics Engineering', 'Semester 5', 4, 'Active'],
        ['ME401', 'Thermodynamics', 'Mechanical Engineering', 'Semester 5', 4, 'Active'],
        ['CE302', 'Structural Analysis', 'Civil Engineering', 'Semester 4', 4, 'Active'],
      ];
      for (const s of subjects) {
        await client.query(
          "INSERT INTO subjects (code, name, department, semester, credits, status) VALUES ($1, $2, $3, $4, $5, $6)",
          s
        );
      }
    }

    // Seed backups
    const backupsCount = await client.query("SELECT COUNT(*) FROM backups");
    if (parseInt(backupsCount.rows[0].count) === 0) {
      console.log("Seeding backups...");
      const backups = [
        ['BKP-2026-0524', 'Full Backup', '8.4 GB', '2026-05-24 02:00 AM', 'Completed', 'Synced'],
        ['BKP-2026-0523', 'Incremental', '1.2 GB', '2026-05-23 02:00 AM', 'Completed', 'Synced'],
        ['BKP-2026-0522', 'Incremental', '1.1 GB', '2026-05-22 02:00 AM', 'Completed', 'Synced'],
        ['BKP-2026-0521', 'Full Backup', '8.1 GB', '2026-05-21 02:00 AM', 'Review', 'Pending'],
      ];
      for (const b of backups) {
        await client.query(
          "INSERT INTO backups (id, type, size, date, status, cloud) VALUES ($1, $2, $3, $4, $5, $6)",
          b
        );
      }
    }

    // Seed automations
    const automationsCount = await client.query("SELECT COUNT(*) FROM automations");
    if (parseInt(automationsCount.rows[0].count) === 0) {
      console.log("Seeding automations...");
      const automations = [
        ['Notification Automation', 'New circular published', 184, 98, true, 'Daily', 'All Students'],
        ['Attendance Alerts', 'Attendance below 75%', 426, 94, true, 'Hourly', 'All Students'],
        ['Fee Reminder Controls', 'Payment due in 3 days', 342, 96, true, 'Daily', 'All Students'],
        ['Approval Escalation', 'Pending beyond 48 hours', 28, 89, false, 'Daily', 'Admins and Heads'],
      ];
      for (const a of automations) {
        await client.query(
          "INSERT INTO automations (name, trigger, runs, success, enabled, frequency, target) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          a
        );
      }
    }

    // Seed automation logs
    const automationLogsCount = await client.query("SELECT COUNT(*) FROM automation_logs");
    if (parseInt(automationLogsCount.rows[0].count) === 0) {
      console.log("Seeding automation logs...");
      const logs = [
        ['Fee reminders delivered', '342 sent', '20m ago', 'Success'],
        ['Low attendance alerts queued', '86 students', '1h ago', 'Success'],
        ['Admin approval escalation paused', 'Manual review', '3h ago', 'Review'],
        ['Daily report digest generated', '12 recipients', '6h ago', 'Success'],
      ];
      for (const l of logs) {
        await client.query(
          "INSERT INTO automation_logs (event, result, time, status) VALUES ($1, $2, $3, $4)",
          l
        );
      }
    }

    // Seed system notifications
    const systemNotificationsCount = await client.query("SELECT COUNT(*) FROM system_notifications");
    if (parseInt(systemNotificationsCount.rows[0].count) === 0) {
      console.log("Seeding system notifications...");
      const notifications = [
        ['SAN-001', 'Backup completed successfully', 'System', '10m ago', true],
        ['SAN-002', '7 admin approvals pending review', 'Approval', '1h ago', true],
        ['SAN-003', 'Security scan found no critical risks', 'Security', '3h ago', false],
        ['SAN-004', 'Maintenance window scheduled Friday', 'Maintenance', '1d ago', false],
        ['SAN-005', 'Automation alert: Attendance notification completed', 'Automation', '2d ago', false],
        ['SAN-006', 'Approval required for new department settings', 'Approval', '2d ago', false],
      ];
      for (const n of notifications) {
        await client.query(
          "INSERT INTO system_notifications (id, title, type, time, unread) VALUES ($1, $2, $3, $4, $5)",
          n
        );
      }
    }

    // Seed security logs
    const securityLogsCount = await client.query("SELECT COUNT(*) FROM security_logs");
    if (parseInt(securityLogsCount.rows[0].count) === 0) {
      console.log("Seeding security logs...");
      const logs = [
        ['LOG001', 'Rohan Verma', 'Successful login', '103.24.18.11', '2026-05-24 10:12 AM', 'Success'],
        ['LOG002', 'Unknown', 'Failed login attempt', '185.19.22.90', '2026-05-24 09:48 AM', 'Failed'],
        ['LOG003', 'Neha Gupta', 'Permission updated', '103.24.18.16', '2026-05-24 09:22 AM', 'Review'],
        ['LOG004', 'System', 'Security scan completed', 'Internal', '2026-05-24 08:00 AM', 'Success'],
        ['LOG005', 'Amit Kumar', 'Report exported', '103.24.18.19', '2026-05-23 05:12 PM', 'Success'],
      ];
      for (const l of logs) {
        await client.query(
          "INSERT INTO security_logs (id, user_name, event, ip, time, status) VALUES ($1, $2, $3, $4, $5, $6)",
          l
        );
      }
    }

    // Seed system settings
    const systemSettingsCount = await client.query("SELECT COUNT(*) FROM system_settings");
    if (parseInt(systemSettingsCount.rows[0].count) === 0) {
      console.log("Seeding system settings...");
      // profile
      await client.query(
        "INSERT INTO system_settings (key, value) VALUES ($1, $2)",
        [
          'profile',
          JSON.stringify({
            profileName: "Dr. Anjali Mehra",
            profileEmail: "super.admin@college.edu",
            profilePhone: "+91 9876543210",
            profileRole: "Super Admin",
            profileBio: "Responsible for global platform governance, institutional workflows and administrative security."
          })
        ]
      );
      // security_opts
      await client.query(
        "INSERT INTO system_settings (key, value) VALUES ($1, $2)",
        ['security_opts', JSON.stringify([true, false, true, true])]
      );
      // notif_opts
      await client.query(
        "INSERT INTO system_settings (key, value) VALUES ($1, $2)",
        ['notif_opts', JSON.stringify([true, true, true, true])]
      );
      // backup_settings
      await client.query(
        "INSERT INTO system_settings (key, value) VALUES ($1, $2)",
        ['backup_settings', JSON.stringify([true, true, true, false])]
      );
      // config_toggles
      await client.query(
        "INSERT INTO system_settings (key, value) VALUES ($1, $2)",
        [
          'config_toggles',
          JSON.stringify({
            "SMTP server": true,
            "Sender identity": true,
            "Bounce handling": true,
            "Email alerts": true,
            "SMS alerts": true,
            "Dashboard alerts": true,
            "Term calendar": true,
            "Exam windows": true,
            "Holidays": true,
            "Daily backup": true,
            "Cloud sync": true,
            "Retention policy": true,
            "Default theme": true,
            "Brand logo": true,
            "Display density": true
          })
        ]
      );
      // institution
      await client.query(
        "INSERT INTO system_settings (key, value) VALUES ($1, $2)",
        [
          'institution',
          JSON.stringify({
            instName: "College Management System",
            acadYear: "2026-2027",
            bkInterval: "Daily Backup",
            admEmail: "admin@college.edu",
            notifNotes: "Primary email, SMS and dashboard notifications are enabled for critical events."
          })
        ]
      );
    }

    console.log("Seeding completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

run();
