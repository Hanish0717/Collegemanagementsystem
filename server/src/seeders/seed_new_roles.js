import pkg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL is not set in environment!");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
});

const newUsers = [
  {
    name: "Principal",
    fullName: "Principal Office",
    email: "principal@college.com",
    role: "principal"
  },
  {
    name: "HOD CSE",
    fullName: "HOD CSE Dept",
    email: "hod@college.com",
    role: "hod"
  },
  {
    name: "Dean Academics",
    fullName: "Dean Academics Office",
    email: "dean@college.com",
    role: "dean"
  },
  {
    name: "Exam Cell Officer",
    fullName: "Exam Cell Office",
    email: "examcell@college.com",
    role: "exam-cell"
  },
  {
    name: "Accounts Manager",
    fullName: "Accounts Office",
    email: "accounts@college.com",
    role: "accounts"
  }
];

async function seed() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    console.log("⚡ Connecting to PostgreSQL database to seed new ERP roles...");
    
    // Drop and recreate check constraint to permit new roles
    console.log("🛠️ Updating users_role_check constraint...");
    await pool.query("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
    await pool.query(
      `ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (
        role IN (
          'super-admin', 'admin', 'faculty', 'student', 'parent', 'librarian', 
          'placement-officer', 'hostel-warden', 'transport-manager', 
          'principal', 'dean', 'hod', 'exam-cell', 'accounts'
        )
      )`
    );
    console.log("✅ users_role_check constraint updated successfully!");

    for (const u of newUsers) {
      // Check if user already exists
      const checkRes = await pool.query("SELECT id FROM users WHERE email = $1", [u.email]);
      if (checkRes.rows.length > 0) {
        console.log(`ℹ️ User ${u.email} already exists. Skipping.`);
        continue;
      }

      // Insert new user
      await pool.query(
        `INSERT INTO users (name, full_name, email, password, role, is_verified, is_active) 
         VALUES ($1, $2, $3, $4, $5, true, true)`,
        [u.name, u.fullName, u.email, hashedPassword, u.role]
      );
      console.log(`✅ Seeded user: ${u.email} (${u.role})`);
    }

    console.log("🎉 Seeding of new roles complete!");
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  } finally {
    await pool.end();
  }
}

seed();
