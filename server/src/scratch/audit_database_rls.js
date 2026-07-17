import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function checkRLS() {
  console.log("=========================================");
  console.log("      DATABASE SECURITY RLS AUDIT        ");
  console.log("=========================================\n");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log("⚠️ No DATABASE_URL configured in server environment. Skipping live PostgreSQL check.");
    return;
  }

  const client = new Client({
    connectionString,
    // Add SSL support for Supabase connection
    ssl: connectionString.includes('supabase.co') || connectionString.includes('localhost') === false && connectionString.includes('127.0.0.1') === false ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log("✅ Successfully connected to live database instance.");

    // Query to check row level security (RLS) status on public tables
    const rlsQuery = `
      SELECT 
        tablename, 
        rowsecurity AS rls_enabled
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
    const res = await client.query(rlsQuery);
    
    console.log("\n--- Table Row Level Security (RLS) Status ---");
    let fullyHardened = true;
    for (const row of res.rows) {
      const status = row.rls_enabled ? "🛡️ ENABLED" : "⚠️ DISABLED (Security Flaw in Production)";
      if (!row.rls_enabled) fullyHardened = false;
      console.log(`Table: ${row.tablename.padEnd(25)} | RLS Status: ${status}`);
    }

    if (fullyHardened) {
      console.log("\n✅ Security Status: Excellent. All tables have Row Level Security enabled.");
    } else {
      console.log("\n⚠️ Security Status: Action Required. Enable RLS on all tables in Supabase.");
    }
  } catch (err) {
    console.log(`❌ Failed to connect/query live database: ${err.message}`);
    console.log("ℹ️ Standard fallback: Local development and testing environment runs in DATABASE_MOCK_MODE.");
  } finally {
    await client.end().catch(() => {});
  }
}

checkRLS();
