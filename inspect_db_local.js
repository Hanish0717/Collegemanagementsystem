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
    const res = await client.query("SELECT id, email, role, full_name, name FROM users WHERE email = 'sopetiyamini@gmail.com'");
    console.log("QUERY RESULT:", JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await client.end();
  }
}

run();
