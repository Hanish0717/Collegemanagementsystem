import pkg from 'pg';
const { Client } = pkg;

async function test() {
  const client = new Client({
    host: '2406:da18:e5c:b700:ca00:ce38:cd35:a547',
    port: 5432,
    user: 'postgres',
    password: 'RAMESH143.b21',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Connecting directly via IPv6...");
    await client.connect();
    console.log("Success! Connected to database.");
    const res = await client.query("SELECT COUNT(*) FROM users;");
    console.log("Users count:", res.rows[0]);
  } catch (err) {
    console.error("Direct IPv6 connection failed:", err);
  } finally {
    await client.end();
  }
}

test();
