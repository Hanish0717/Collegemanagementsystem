import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pkg;
const connectionString = process.env.DATABASE_URL;

const isLocalDatabase =
  connectionString.includes('localhost') ||
  connectionString.includes('127.0.0.1') ||
  connectionString.includes('db') ||
  process.env.DATABASE_SSL === 'false';

const client = new Client({
  connectionString,
  ssl: isLocalDatabase ? false : { rejectUnauthorized: false }
});

async function checkTables() {
  try {
    await client.connect();
    const res = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;"
    );
    console.log("=== LIVE TABLES IN DATABASE ===");
    const tables = res.rows.map(r => r.table_name);
    console.log(JSON.stringify(tables, null, 2));

    const checkSpecific = [
      'automations',
      'automation_logs',
      'transport_routes',
      'transport_buses',
      'transport_drivers',
      'buses',
      'drivers',
      'routes',
      'stops',
      'transport_allocations',
      'vehicle_maintenance',
      'transport_fees'
    ];
    console.log("\n=== SPECIFIC TABLES CHECK ===");
    for (const t of checkSpecific) {
      console.log(`${t}: ${tables.includes(t) ? '✅ EXISTS' : '❌ MISSING'}`);
    }
  } catch (err) {
    console.error("Error querying database tables:", err);
  } finally {
    await client.end();
  }
}

checkTables();
