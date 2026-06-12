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
    
    console.log("--- RLS STATUS FOR TABLES ---");
    const tables = ['students', 'hostels', 'hostel_blocks', 'hostel_rooms', 'hostel_allocations'];
    for (const table of tables) {
      const res = await client.query(
        `SELECT relname, relrowsecurity FROM pg_class WHERE relname = $1`,
        [table]
      );
      if (res.rows.length > 0) {
        console.log(`${table}: RLS Enabled = ${res.rows[0].relrowsecurity}`);
      } else {
        console.log(`${table}: Table not found`);
      }
    }

    console.log("\n--- POLICIES FOR TABLES ---");
    const policiesRes = await client.query(
      `SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
       FROM pg_policies 
       WHERE schemaname = 'public' AND tablename ANY($1)`,
      [tables]
    );
    console.log(JSON.stringify(policiesRes.rows, null, 2));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
