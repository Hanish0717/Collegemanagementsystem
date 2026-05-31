import { supabase } from './config/supabase.js';

async function run() {
  try {
    console.log("Testing students query...");
    const { data, error, count } = await supabase
      .from('students')
      .select('*, users!inner(is_verified)', { count: 'exact' })
      .eq('is_active', true)
      .eq('users.is_verified', true);
      
    if (error) {
      console.error("Query Error:", error);
    } else {
      console.log("Query Success! Students found:", data ? data.length : 0);
      console.log("First student users field:", data && data[0] ? data[0].users : null);
    }
  } catch (err) {
    console.error("Exception:", err);
  }
}

run();
