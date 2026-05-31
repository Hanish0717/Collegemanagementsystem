import pkg from 'pg';
const { Client } = pkg;

async function check() {
  const client = new Client({
    connectionString: 'postgresql://postgres.rdzitvvxxdhtbzzqoasd:RAMESH143.b21@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query("SELECT * FROM transport_stops");
    console.log("All transport stops:", JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err.message);
  } finally {
    await client.end();
  }
}

check();
