import { readFile } from 'fs/promises';
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load server .env so DATABASE_URL is available when running this script
dotenv.config({ path: path.resolve(new URL('../.env', import.meta.url).pathname) });

// Fallback: if DATABASE_URL still not set, try to read and parse ../.env manually
async function loadDotenvFallback() {
  if (process.env.DATABASE_URL) return;
  try {
    const envText = await readFile(new URL('../.env', import.meta.url), 'utf8');
    envText.split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) {
        const key = m[1];
        let val = m[2] || '';
        // remove surrounding quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      }
    });
  } catch (err) {
    // ignore
  }
}

async function run() {
  await loadDotenvFallback();
  try {
    const sql = await readFile(new URL('../src/migrations/20260531_create_mess_tables.sql', import.meta.url), 'utf8');
    const connection = process.env.DATABASE_URL;
    if (!connection) {
      console.error('DATABASE_URL not set');
      process.exit(2);
    }

    const client = new Client({ connectionString: connection });
    await client.connect();
    console.log('Connected to DB, running migration...');
    // Execute statements individually to avoid issues with transactional statements like CREATE EXTENSION
    const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      try {
        await client.query(stmt);
      } catch (err) {
        const msg = (err && err.message) ? err.message : String(err);
        if (msg.includes('already exists')) {
          console.warn('Skipping existing object:', msg.split('\n')[0]);
          continue;
        }
        console.error('Statement failed:', stmt.slice(0, 200));
        console.error(msg);
        await client.end();
        process.exitCode = 1;
        return;
      }
    }
    await client.end();
    console.log('Migration applied successfully.');
  } catch (err) {
    console.error('Error running migration script:', err.message || err);
    process.exit(1);
  }
}

run();
