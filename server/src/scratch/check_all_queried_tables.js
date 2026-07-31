import fs from 'fs';
import path from 'path';
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

function findFromCalls(dir) {
  const tableMap = new Map();
  function walk(currentDir) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (file.endsWith('.js') || file.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const matches = content.matchAll(/\.from\(['"]([^'"]+)['"]\)/g);
        for (const match of matches) {
          const tableName = match[1];
          if (!tableMap.has(tableName)) {
            tableMap.set(tableName, []);
          }
          tableMap.get(tableName).push(path.relative(process.cwd(), fullPath));
        }
      }
    }
  }
  walk(dir);
  return tableMap;
}

async function auditSchema() {
  await client.connect();
  const res = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' UNION SELECT table_name FROM information_schema.views WHERE table_schema='public';"
  );
  const dbTables = new Set(res.rows.map(r => r.table_name));

  const controllersDir = path.resolve('src');
  const tableMap = findFromCalls(controllersDir);

  console.log("=== COMPREHENSIVE SCHEMA COMPARISON REPORT ===");
  const missingTables = [];
  const existingTables = [];

  for (const tableName of tableMap.keys()) {
    if (dbTables.has(tableName)) {
      existingTables.push(tableName);
    } else {
      missingTables.push({
        table: tableName,
        usedIn: tableMap.get(tableName)
      });
    }
  }

  console.log("\n✅ EXISTING TABLES/VIEWS IN DB (" + existingTables.length + "):");
  console.log(existingTables.sort().join(', '));

  console.log("\n❌ MISSING TABLES/VIEWS IN DB (" + missingTables.length + "):");
  console.log(JSON.stringify(missingTables, null, 2));

  await client.end();
}

auditSchema();
