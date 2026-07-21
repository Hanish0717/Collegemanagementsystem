import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const result = await pool.query(
  "UPDATE students SET full_name = 'Reddy Sai Kumar', email = 'saikumar.reddy@college.com' WHERE roll_number = 'CS100001' RETURNING roll_number, full_name, email"
);
console.log('Updated record:', result.rows[0]);
await pool.end();
