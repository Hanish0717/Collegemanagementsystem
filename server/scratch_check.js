import pkg from 'pg';
const { Client } = pkg;

async function check() {
  const client = new Client({
    connectionString: 'postgresql://postgres.rdzitvvxxdhtbzzqoasd:RAMESH143.b21@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to database successfully!");

    // List all tables
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tables in database:", tablesRes.rows.map(r => r.table_name));

    // Check count and sample data for students and users
    for (const table of ['users', 'students', 'issued_books', 'books']) {
      try {
        const countRes = await client.query(`SELECT COUNT(*) FROM "${table}"`);
        console.log(`Table "${table}" count:`, countRes.rows[0].count);
        const sampleRes = await client.query(`SELECT * FROM "${table}" LIMIT 1`);
        console.log(`Table "${table}" sample column names:`, Object.keys(sampleRes.rows[0] || {}));
      } catch (err) {
        console.error(`Error checking table "${table}":`, err.message);
      }
    }
  } catch (err) {
    console.error("Connection failed:", err.message);
  } finally {
    await client.end();
  }
}

check();
