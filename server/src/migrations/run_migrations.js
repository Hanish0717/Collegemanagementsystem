import pkg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

dotenv.config();

const { Client } = pkg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ Error: DATABASE_URL is missing in your .env file!");
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getClientConfig(connStr) {
  try {
    // Standard connection string parser
    const regex = /^(postgresql|postgres):\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/([^?]+)/;
    const match = connStr.match(regex);
    if (!match) {
      throw new Error("Invalid connection string format");
    }

    const [,, username, password, host, port, dbname] = match;
    let resolvedHost = host;

    // Resolve IPv6 DNS if needed
    if (!host.includes('[') && !/^[0-9.]+$/.test(host)) {
      console.log(`⏳ Resolving DNS for ${host}...`);
      try {
        const ips = await dns.promises.resolve6(host);
        if (ips && ips.length > 0) {
          console.log(`✅ Resolved ${host} to IPv6: ${ips[0]}`);
          resolvedHost = ips[0];
        }
      } catch (dnsErr) {
        console.warn(`⚠️ DNS IPv6 resolution failed for ${host}, using raw host:`, dnsErr.message);
      }
    }

    return {
      host: resolvedHost,
      port: port ? parseInt(port, 10) : 5432,
      user: username,
      password: decodeURIComponent(password),
      database: dbname,
      ssl: {
        rejectUnauthorized: false
      }
    };
  } catch (err) {
    console.error("❌ Error parsing connection string:", err.message);
    throw err;
  }
}

async function run() {
  let client;
  try {
    const config = await getClientConfig(connectionString);
    client = new Client(config);

    console.log("⏳ Connecting to PostgreSQL database...");
    await client.connect();
    console.log("✅ Connected successfully.");

    const sqlPath = path.join(__dirname, 'create_migrated_tables.sql');
    console.log(`⏳ Reading SQL file from ${sqlPath}...`);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("⏳ Executing migrations query...");
    await client.query(sql);
    console.log("✅ Migrations executed successfully. All tables created/validated.");

    // Reload PostgREST schema cache
    console.log("⏳ Reloading PostgREST schema cache...");
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log("✅ PostgREST schema cache reloaded.");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

run();
