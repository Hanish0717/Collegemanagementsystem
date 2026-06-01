import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pkg;

async function testLibrary() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to database.");

    // Run ALTER TABLE
    console.log("Altering student_notifications table to add student_id column...");
    await client.query("ALTER TABLE student_notifications ADD COLUMN IF NOT EXISTS student_id uuid REFERENCES students(id) ON DELETE CASCADE NULL");
    console.log("Column added successfully!");

    // Query column info for student_notifications
    const colNotifs = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'student_notifications'");
    console.log("student_notifications columns:");
    console.table(colNotifs.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

testLibrary();
