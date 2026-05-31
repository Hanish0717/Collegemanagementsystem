import pkg from 'pg';
const { Client } = pkg;

async function check() {
  const client = new Client({
    connectionString: 'postgresql://postgres.rdzitvvxxdhtbzzqoasd:RAMESH143.b21@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query("SELECT roll_number, full_name FROM students WHERE roll_number ILIKE 'STU%' OR full_name ILIKE '%Priya%' OR full_name ILIKE '%Aarav%'");
    console.log("Matching live students:", JSON.stringify(res.rows, null, 2));

    const countAll = await client.query("SELECT COUNT(*) FROM students");
    console.log("Total students in database:", countAll.rows[0].count);
  } catch (err) {
    console.error(err.message);
  } finally {
    await client.end();
  }
}

check();
