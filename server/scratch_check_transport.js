import pkg from 'pg';
const { Client } = pkg;

async function check() {
  const client = new Client({
    connectionString: 'postgresql://postgres.rdzitvvxxdhtbzzqoasd:RAMESH143.b21@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected successfully!");

    const tables = [
      'routes', 'transport_routes',
      'stops', 'transport_stops',
      'drivers', 'transport_drivers',
      'buses', 'transport_buses',
      'transport_allocations'
    ];

    for (const t of tables) {
      try {
        const res = await client.query(`SELECT COUNT(*) FROM "${t}"`);
        console.log(`Table "${t}" row count: ${res.rows[0].count}`);
        if (parseInt(res.rows[0].count, 10) > 0) {
          const sample = await client.query(`SELECT * FROM "${t}" LIMIT 2`);
          console.log(`Sample from "${t}":`, JSON.stringify(sample.rows, null, 2));
        }
      } catch (err) {
        console.log(`Error reading table "${t}": ${err.message}`);
      }
    }
  } catch (err) {
    console.error("Connection failed:", err.message);
  } finally {
    await client.end();
  }
}

check();
