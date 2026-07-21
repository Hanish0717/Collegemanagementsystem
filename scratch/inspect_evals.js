import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pkg;

async function checkEvals() {
  const isLocalDatabase =
    process.env.DATABASE_URL?.includes('localhost') ||
    process.env.DATABASE_URL?.includes('127.0.0.1') ||
    process.env.DATABASE_URL?.includes('5433') ||
    process.env.DATABASE_SSL === 'false';

  const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5433/collegedb",
    ssl: isLocalDatabase ? false : { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query("SELECT id, evaluation_code, pdf_url FROM exam_evaluations;");
    console.log("Evaluations in DB:", res.rows);
  } catch (err) {
    console.error("DB error:", err);
  } finally {
    await client.end();
  }
}

checkEvals();
