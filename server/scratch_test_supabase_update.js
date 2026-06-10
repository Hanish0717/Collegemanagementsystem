import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: '../client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpdate() {
  try {
    // Get first block
    const { data: blocks, error: fetchErr } = await supabase.from("hostel_blocks").select("*").limit(1);
    if (fetchErr) {
      console.error("Fetch error:", fetchErr);
      return;
    }
    if (!blocks || blocks.length === 0) {
      console.error("No blocks found");
      return;
    }

    const block = blocks[0];
    console.log("Original Block:", block);

    // Try to update
    const updatedName = block.name + " Test";
    const { data: updatedBlock, error: updateErr } = await supabase
      .from("hostel_blocks")
      .update({ name: updatedName })
      .eq("id", block.id)
      .select()
      .single();

    if (updateErr) {
      console.error("Update error:", updateErr);
      return;
    }

    console.log("Updated Block:", updatedBlock);

    // Restore name
    const { error: restoreErr } = await supabase
      .from("hostel_blocks")
      .update({ name: block.name })
      .eq("id", block.id);
    if (restoreErr) console.error("Restore error:", restoreErr);
    else console.log("Restored successfully");

  } catch (err) {
    console.error("Exception:", err);
  }
}

testUpdate();
