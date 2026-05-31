import { supabase } from './config/supabase.js';

async function test() {
  console.log("Querying placement_companies...");
  try {
    const { data: companies, error: compErr } = await supabase.from('placement_companies').select('*');
    if (compErr) {
      console.error("placement_companies error:", compErr);
    } else {
      console.log("placement_companies count:", companies ? companies.length : 0);
      console.log("companies:", companies);
    }
  } catch (err) {
    console.error("placement_companies exception:", err);
  }

  console.log("Querying placement_interviews...");
  try {
    const { data: interviews, error: intErr } = await supabase.from('placement_interviews').select('*');
    if (intErr) {
      console.error("placement_interviews error:", intErr);
    } else {
      console.log("placement_interviews count:", interviews ? interviews.length : 0);
    }
  } catch (err) {
    console.error("placement_interviews exception:", err);
  }
}

test();
