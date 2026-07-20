import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function enableRLS() {
  console.log("=========================================");
  console.log("      ENABLING ROW LEVEL SECURITY        ");
  console.log("=========================================\n");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log("❌ No DATABASE_URL configured in server environment.");
    return;
  }

  const client = new Client({
    connectionString,
    ssl: connectionString.includes('supabase.co') || connectionString.includes('localhost') === false && connectionString.includes('127.0.0.1') === false ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log("✅ Connected to database.");

    // Fetch all public tables
    const tableQuery = `
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `;
    const res = await client.query(tableQuery);
    
    console.log(`\nEnabling RLS on ${res.rows.length} tables...`);
    
    for (const row of res.rows) {
      const tableName = row.tablename;
      // Enable RLS
      await client.query(`ALTER TABLE "${tableName}" ENABLE ROW LEVEL SECURITY;`);
      
      console.log(`🛡️ Enabled RLS on table: ${tableName}`);
    }

    console.log("\n✅ Row Level Security (RLS) successfully enabled on all tables!");

  } catch (err) {
    console.error(`❌ Error enabling RLS: ${err.message}`);
  } finally {
    await client.end().catch(() => {});
  }
}

enableRLS();
