import pkg from 'pg';
const { Client } = pkg;

const DB = 'postgresql://postgres.rdzitvvxxdhtbzzqoasd:RAMESH143.b21@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres';

async function check() {
  const client = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("✅ Connected!\n");

  // 1. Show all students with their roll_number and department
  const stuRes = await client.query(`
    SELECT id, full_name, roll_number, email, department, is_active
    FROM students
    ORDER BY department, roll_number
    LIMIT 40
  `);
  console.log(`\n📋 STUDENTS IN DATABASE (${stuRes.rows.length} rows):`);
  console.log("=".repeat(80));
  for (const s of stuRes.rows) {
    console.log(`  Roll: "${s.roll_number}" | Dept: "${s.department}" | Name: ${s.full_name} | Active: ${s.is_active}`);
  }

  // 2. Check transport_allocations
  const allocRes = await client.query(`SELECT COUNT(*) FROM transport_allocations`);
  console.log(`\n🚌 transport_allocations count: ${allocRes.rows[0].count}`);

  if (parseInt(allocRes.rows[0].count) > 0) {
    const sampleAlloc = await client.query(`SELECT * FROM transport_allocations LIMIT 5`);
    console.log('Sample allocations:', JSON.stringify(sampleAlloc.rows, null, 2));
  }

  // 3. Check what roll numbers would match if we do uppercase eq
  const testRolls = ['CS2026101', 'CS2026102', 'AM2026102', 'EC2026102', 'EE2026102'];
  console.log('\n🔍 Testing specific roll number lookups:');
  for (const roll of testRolls) {
    const r = await client.query(`SELECT full_name, roll_number, department FROM students WHERE roll_number = $1`, [roll]);
    console.log(`  "${roll}" → ${r.rows.length > 0 ? `FOUND: ${r.rows[0].full_name} (${r.rows[0].department})` : 'NOT FOUND'}`);
  }

  await client.end();
}

check().catch(console.error);
