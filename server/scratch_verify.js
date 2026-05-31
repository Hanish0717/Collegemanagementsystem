import { supabase } from './src/config/supabase.js';

async function verify() {
  try {
    console.log("Verifying custom query builder...");
    const { data: students, count, error } = await supabase
      .from('students')
      .select('*, users!inner(is_verified)', { count: 'exact' })
      .eq('is_active', true)
      .eq('users.is_verified', true)
      .range(0, 5);

    if (error) {
      console.error("Query builder error:", error);
      return;
    }

    console.log(`✅ SUCCESS! Loaded ${students.length} students from the database.`);
    console.log("Total database count match:", count);
    console.log("First student record:", JSON.stringify(students[0], null, 2));
  } catch (err) {
    console.error("Unexpected verification error:", err.message);
  }
}

verify();
