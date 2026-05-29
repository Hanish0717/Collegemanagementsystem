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

const sqlSchema = `
-- Create ADMINS Table
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

-- Create FACULTY Table
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

async function runMigration() {
  try {
    console.log("Connecting to PostgreSQL...");
    await client.connect();
    console.log("✅ Connected successfully.");

    console.log("Executing SQL to create admins and faculty tables...");
    await client.query(sqlSchema);
    console.log("✅ Tables created/validated successfully.");

    // Seed Admin profile if not exists
    const adminUserRes = await client.query("SELECT id FROM users WHERE email = $1", ['admin@college.com']);
    if (adminUserRes.rows.length > 0) {
      const adminUserId = adminUserRes.rows[0].id;
      const adminProfileRes = await client.query("SELECT id FROM admins WHERE email = $1", ['admin@college.com']);
      if (adminProfileRes.rows.length === 0) {
        await client.query(
          `INSERT INTO admins (user_id, full_name, email, employee_id, department, is_active)
           VALUES ($1, $2, $3, $4, $5, true)`,
          [adminUserId, 'System Admin', 'admin@college.com', 'ADM001', 'CSE']
        );
        console.log("✅ Seeded Admin Profile in admins table.");
      } else {
        console.log("ℹ️ Admin Profile already exists.");
      }
    }

    // Seed Faculty profile if not exists
    const facultyUserRes = await client.query("SELECT id FROM users WHERE email = $1", ['faculty@college.com']);
    if (facultyUserRes.rows.length > 0) {
      const facultyUserId = facultyUserRes.rows[0].id;
      const facultyProfileRes = await client.query("SELECT id FROM faculty WHERE email = $1", ['faculty@college.com']);
      if (facultyProfileRes.rows.length === 0) {
        await client.query(
          `INSERT INTO faculty (user_id, full_name, email, employee_id, department, designation, experience, gender, phone_number, status, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, 12, 'Male', '9876543212', 'Active', true)`,
          [facultyUserId, 'Dr. John Smith', 'faculty@college.com', 'FAC2020001', 'CSE', 'Associate Professor']
        );
        console.log("✅ Seeded Faculty Profile in faculty table.");
      } else {
        console.log("ℹ️ Faculty Profile already exists.");
      }
    }

    console.log("🎉 Migration script completed successfully!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await client.end();
  }
}

runMigration();
