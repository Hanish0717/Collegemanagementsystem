// Quick script to fetch and print all students from local Postgres DB
import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function printStudents() {
  const client = await pool.connect();
  try {
    console.log('\n========================================');
    console.log('       STUDENTS IN DATABASE             ');
    console.log('========================================\n');

    // Check which tables exist
    const tableCheck = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('Available tables:', tableCheck.rows.map(r => r.table_name).join(', '));
    console.log('');

    // Try to query students
    let result;
    try {
      result = await client.query(`
        SELECT * FROM students
        ORDER BY department ASC, roll_number ASC
      `);
    } catch (e) {
      console.log(`'students' table error: ${e.message}`);
      console.log('Trying users table with role=student...');
      result = await client.query(`
        SELECT * FROM users WHERE role = 'student'
        ORDER BY created_at DESC
        LIMIT 100
      `);
    }

    const students = result.rows;
    if (!students || students.length === 0) {
      console.log('No students found in the database.');
      return;
    }

    console.log(`Total Students Found: ${students.length}\n`);

    // Group by department if available
    const byDept = {};
    for (const s of students) {
      const dept = s.department || 'Unknown';
      if (!byDept[dept]) byDept[dept] = [];
      byDept[dept].push(s);
    }

    for (const [dept, list] of Object.entries(byDept)) {
      console.log(`\n--- ${dept} (${list.length} students) ---`);
      list.forEach((s, i) => {
        const no   = String(i + 1).padStart(3, '0');
        const name  = (s.full_name   || s.name || '-');
        const roll  = (s.roll_number || s.admission_number || s.id || '-');
        const email = (s.email       || '-');
        const sem   = s.semester ? `Sem ${s.semester}` : '';
        const sec   = s.section  ? `Sec ${s.section}`  : '';
        console.log(`  ${no}. ${name.padEnd(35)} | Roll: ${roll.padEnd(15)} | ${email.padEnd(40)} | ${sem} ${sec}`);
      });
    }

    console.log('\n========================================\n');
  } finally {
    client.release();
    await pool.end();
  }
}

printStudents().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
