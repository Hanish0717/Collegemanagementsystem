import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

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
    
    // Check RLS status
    console.log("--- RLS STATUS ---");
    const rlsRes = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' AND tablename IN ('hostels', 'hostel_blocks', 'hostel_rooms')
    `);
    console.log(rlsRes.rows);

    // Check policies
    console.log("\n--- POLICIES ---");
    const policyRes = await client.query(`
      SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check 
      FROM pg_policies 
      WHERE tablename IN ('hostels', 'hostel_blocks', 'hostel_rooms')
    `);
    console.log(JSON.stringify(policyRes.rows, null, 2));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
