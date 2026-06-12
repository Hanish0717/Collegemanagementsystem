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
    
    console.log("--- ALL HOSTEL BLOCKS ---");
    const res = await client.query(`
      SELECT b.id, b.name, b.code, b.hostel_id, h.name as hostel_name, b.capacity, b.total_rooms, b.ac_rooms, b.non_ac_rooms, b.occupants, b.block_warden, b.contact_number, b.status
      FROM hostel_blocks b
      LEFT JOIN hostels h ON b.hostel_id = h.id
      ORDER BY b.name, h.name
    `);
    console.log(JSON.stringify(res.rows, null, 2));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

run();
