import { supabase } from './src/config/supabase.js';

async function testConnection() {
  try {
    console.log("Querying issued_books...");
    const { data: issues, error } = await supabase
      .from('issued_books')
      .select('*, book:books(*), user:users(*)');

    if (error) {
      console.error("Supabase query error:", error);
      return;
    }

    console.log("Total issued books in DB:", issues.length);
    console.log("Sample issues:", JSON.stringify(issues.slice(0, 3), null, 2));

    const overdue = issues.filter(i => String(i.status).toLowerCase() === 'overdue' || String(i.status).toLowerCase() === 'issued');
    console.log("Active / Overdue issues count:", overdue.length);
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

testConnection();
