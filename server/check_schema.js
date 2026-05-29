import { supabase } from './src/config/supabase.js';

async function checkSchema() {
  try {
    console.log("Fetching database tables and columns...");
    // Let's query information_schema or just run a simple select on each table to see if it succeeds
    const tables = ['users', 'students', 'assignments', 'attendance', 'books', 'issued_books', 'complaints', 'leave_requests', 'fees', 'results', 'study_materials', 'timetable'];
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ Table '${table}': Error or not found: ${error.message}`);
      } else {
        console.log(`✅ Table '${table}': Connected successfully. Row sample size: ${data.length}`);
        if (data.length > 0) {
          console.log(`   Sample keys: ${Object.keys(data[0]).join(', ')}`);
        }
      }
    }
  } catch (err) {
    console.error("Error running schema check:", err);
  }
}

checkSchema();
