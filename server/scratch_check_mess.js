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
    
    const tables = ['hostel_fees'];
    for (const table of tables) {
      console.log(`\n--- TABLE: ${table} ---`);
      
      // Get column names & types
      const cols = await client.query(
        `SELECT column_name, data_type, is_nullable 
         FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = $1`, 
        [table]
      );
      console.log("Columns:");
      cols.rows.forEach(r => {
        console.log(`  - ${r.column_name} (${r.data_type}, nullable: ${r.is_nullable})`);
      });

      // Get count
      const countRes = await client.query(`SELECT count(*) FROM ${table}`);
      console.log(`Row count: ${countRes.rows[0].count}`);
    }
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await client.end();
  }
}

run();
