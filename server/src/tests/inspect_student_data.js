import pkg from 'pg';
import dotenv from 'dotenv';
const { Client } = pkg;

dotenv.config();

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  
  const res = await client.query('SELECT DISTINCT department, section, year FROM students');
  console.log("Distinct student fields in DB:", res.rows);
  
  await client.end();
}

main().catch(console.error);
