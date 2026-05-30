import app from './app.js';
import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const PORT = process.env.PORT || 5000;
const { Client } = pkg;

// Validate Supabase config
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ ERROR: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined in .env! Backend cannot run without Supabase.");
  process.exit(1);
} else {
  console.log("✅ Supabase credentials detected. Ready to process queries.");
}

// Startup database migration
async function runMigrations() {
  const isMockMode = !process.env.SUPABASE_URL || 
                     process.env.SUPABASE_URL.includes('your-project') || 
                     process.env.SUPABASE_URL.includes('placeholder') ||
                     !process.env.DATABASE_URL ||
                     process.env.DATABASE_URL.includes('your_supabase');

  if (isMockMode) {
    console.log("ℹ️ Running in DATABASE MOCK MODE. Skipping live DDL migrations.");
    return;
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
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
    `);
    
    // Reload PostgREST schema cache
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log("✅ PostgREST schema cache reload triggered.");

    console.log("✅ Database migrations completed successfully (added columns & linked legacy profiles).");
  } catch (err) {
    console.error("❌ Database migration failed:", err);
  } finally {
    await client.end();
  }
}

// Start server after migrations
runMigrations().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});




