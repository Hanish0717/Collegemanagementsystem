import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pkg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ Error: DATABASE_URL missing in process.env!");
  process.exit(1);
}

const isLocalDatabase =
  connectionString.includes('localhost') ||
  connectionString.includes('127.0.0.1') ||
  connectionString.includes('db') ||
  process.env.DATABASE_SSL === 'false';

const client = new Client({
  connectionString,
  ssl: isLocalDatabase ? false : { rejectUnauthorized: false }
});

async function applyMigration() {
  try {
    console.log("Connecting to PostgreSQL...");
    await client.connect();
    console.log("✅ Connected successfully.");

    const sqlPath = path.join(__dirname, '..', 'migrations', '20260723_create_automations_and_transport_views.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Applying transaction migration script...");
    await client.query(sql);
    console.log("✅ Migration applied successfully!");

    // Run Verification Queries
    console.log("\n=== VERIFICATION QUERIES ===");
    
    const automationsResult = await client.query("SELECT * FROM automations LIMIT 1;");
    console.log("SELECT * FROM automations LIMIT 1;");
    console.log(`✅ Success! Rows returned: ${automationsResult.rowCount}`);
    if (automationsResult.rowCount > 0) {
      console.log("Sample automation:", automationsResult.rows[0]);
    }

    const transportRoutesResult = await client.query("SELECT * FROM transport_routes LIMIT 1;");
    console.log("\nSELECT * FROM transport_routes LIMIT 1;");
    console.log(`✅ Success! Rows returned: ${transportRoutesResult.rowCount}`);
    if (transportRoutesResult.rowCount > 0) {
      console.log("Sample transport_route:", transportRoutesResult.rows[0]);
    }

  } catch (err) {
    console.error("❌ Migration failed! Rolling back changes:", err);
  } finally {
    await client.end();
  }
}

applyMigration();
