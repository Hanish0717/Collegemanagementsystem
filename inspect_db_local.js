import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: 'server/.env' });

const { Client } = pkg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is missing!");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    
    // 1. Get columns of the faculty table
    console.log("--- FACULTY TABLE COLUMNS ---");
    const columnsRes = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'faculty'`
    );
    console.log("COLUMNS:", columnsRes.rows);

    // 2. Get all records from faculty
    console.log("\n--- FACULTY RECORDS ---");
    const facultyRes = await client.query(`SELECT id, full_name, employee_id, department, assigned_sections, assigned_subjects FROM faculty`);
    console.log("FACULTY:", JSON.stringify(facultyRes.rows, null, 2));

    // 3. Get students count
    console.log("\n--- STUDENTS COUNT ---");
    const studentsRes = await client.query(`SELECT count(*), department, section FROM students GROUP BY department, section`);
    console.log("STUDENTS:", studentsRes.rows);

  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await client.end();
  }
}

run();

