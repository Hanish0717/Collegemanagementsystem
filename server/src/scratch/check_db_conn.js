import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pkg;
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    await client.connect();
    console.log("SUCCESS connected to DATABASE_URL: ", process.env.DATABASE_URL);
    const res = await client.query('SELECT version();');
    console.log('Version:', res.rows[0].version);
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public'
    `);
    console.log('Tables:', tables.rows.map(r => r.table_name));
    await client.end();
  } catch (err) {
    console.error("FAILED to connect:", err.message);
  }
}
check();
