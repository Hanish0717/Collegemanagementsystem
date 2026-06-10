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
    
    // 1. Get counts
    console.log("--- TABLE COUNTS ---");
    const tables = ['hostels', 'hostel_blocks', 'hostel_rooms', 'hostel_allocations', 'students'];
    for (const table of tables) {
      try {
        const res = await client.query(`SELECT count(*) FROM ${table}`);
        console.log(`${table}: ${res.rows[0].count}`);
      } catch (err) {
        console.error(`Error querying count for ${table}:`, err.message);
      }
    }

    // 2. Fetch a few hostels
    console.log("\n--- HOSTELS ---");
    try {
      const res = await client.query(`SELECT id, name, code, type FROM hostels LIMIT 5`);
      console.log(res.rows);
    } catch (err) {
      console.error("Error querying hostels:", err.message);
    }

    // 3. Fetch a few blocks
    console.log("\n--- HOSTEL BLOCKS ---");
    try {
      const res = await client.query(`SELECT id, name, code, hostel_id FROM hostel_blocks LIMIT 5`);
      console.log(res.rows);
    } catch (err) {
      console.error("Error querying hostel_blocks:", err.message);
    }

    // 4. Fetch a few rooms
    console.log("\n--- HOSTEL ROOMS ---");
    try {
      const res = await client.query(`SELECT id, room_number, floor, type, capacity, occupants, block_id FROM hostel_rooms LIMIT 5`);
      console.log(res.rows);
    } catch (err) {
      console.error("Error querying hostel_rooms:", err.message);
    }

  } catch (err) {
    console.error("Connection/Query Error:", err);
  } finally {
    await client.end();
  }
}

run();
