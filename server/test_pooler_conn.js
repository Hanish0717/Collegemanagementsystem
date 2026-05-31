import pkg from 'pg';
const { Client } = pkg;

async function test() {
  const hosts = [
    'aws-0-ap-southeast-1.pooler.supabase.com',
    'aws-1-ap-southeast-1.pooler.supabase.com',
    'aws-2-ap-southeast-1.pooler.supabase.com',
    'aws-3-ap-southeast-1.pooler.supabase.com'
  ];

  for (const host of hosts) {
    const conn = `postgresql://postgres.rdzitvvxxdhtbzzqoasd:RAMESH143.b21@${host}:6543/postgres`;
    const client = new Client({
      connectionString: conn,
      ssl: { rejectUnauthorized: false }
    });

    try {
      console.log(`Trying host ${host}...`);
      await client.connect();
      console.log(`✅ Success! Connected via host: ${host}`);
      const res = await client.query("SELECT COUNT(*) FROM users;");
      console.log("Users count:", res.rows[0]);
      await client.end();
      return;
    } catch (err) {
      console.error(`Error for ${host}:`, err.message);
      try {
        await client.end();
      } catch (e) {}
    }
  }
  console.log("❌ Finished searching.");
}

test();
