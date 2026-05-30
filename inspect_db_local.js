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
    const res = await client.query("SELECT a.id, a.date, a.status, a.subject, a.period, a.time, s.full_name as student_name FROM attendance a JOIN students s ON a.student = s.id ORDER BY a.date DESC");
    console.log("QUERY RESULT:", JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await client.end();
  }
}

run();

