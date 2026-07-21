import pool from '../lib/db.js';
import { supabase } from '../config/supabase.js';

async function checkCounts() {
  console.log('--- Checking DB Counts ---');
  try {
    if (pool) {
      const res = await pool.query('SELECT COUNT(*) FROM users');
      console.log('Postgres users count:', res.rows[0].count);
      const studentRes = await pool.query('SELECT COUNT(*) FROM students');
      console.log('Postgres students count:', studentRes.rows[0].count);
      const facultyRes = await pool.query('SELECT COUNT(*) FROM faculty');
      console.log('Postgres faculty count:', facultyRes.rows[0].count);
    }
  } catch (err) {
    console.error('Postgres error:', err.message);
  }

  try {
    const { count: usersCount, error } = await supabase.from('users').select('*', { count: 'exact', head: true });
    console.log('Supabase users count:', usersCount, error);
    const { count: stCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
    console.log('Supabase students count:', stCount);
    const { count: faCount } = await supabase.from('faculty').select('*', { count: 'exact', head: true });
    console.log('Supabase faculty count:', faCount);
  } catch (err) {
    console.error('Supabase error:', err.message);
  }
}

checkCounts().then(() => process.exit(0));
