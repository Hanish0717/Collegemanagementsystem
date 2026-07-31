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

async function inspectTransport() {
  await client.connect();
  const routesCount = await client.query("SELECT COUNT(*) FROM routes;");
  const busesCount = await client.query("SELECT COUNT(*) FROM buses;");
  const driversCount = await client.query("SELECT COUNT(*) FROM drivers;");

  console.log(`routes table count: ${routesCount.rows[0].count}`);
  console.log(`buses table count: ${busesCount.rows[0].count}`);
  console.log(`drivers table count: ${driversCount.rows[0].count}`);

  if (parseInt(routesCount.rows[0].count) > 0) {
    const sampleRoute = await client.query("SELECT * FROM routes LIMIT 1;");
    console.log("Sample route from routes:", sampleRoute.rows[0]);
  }

  await client.end();
}

inspectTransport();
