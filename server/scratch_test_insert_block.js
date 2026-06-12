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

async function testInsertBlock() {
  try {
    const { data: hostels } = await supabase.from("hostels").select("id").limit(1);
    const defaultHostelId = hostels && hostels.length > 0 ? hostels[0].id : null;

    const dbPayload = {
      hostel_id: defaultHostelId,
      name: "Test Block Insert " + Date.now(),
      code: "TESTB_" + Math.floor(Math.random() * 10000),
      type: "Boys",
      capacity: 300,
      total_rooms: 150,
      ac_rooms: 50,
      non_ac_rooms: 100,
      occupants: 0,
      block_warden: "Test Warden",
      contact_number: "1234567890",
      status: "Available",
      image_url: ""
    };

    console.log("Inserting block payload:", dbPayload);
    const { data, error } = await supabase.from("hostel_blocks").insert([dbPayload]).select();

    if (error) {
      console.error("❌ Insert failed with error:", error);
    } else {
      console.log("✅ Insert succeeded:", data);
      // Clean up
      const { error: delErr } = await supabase.from("hostel_blocks").delete().eq("id", data[0].id);
      if (delErr) console.error("Clean up error:", delErr);
      else console.log("Cleaned up successfully");
    }

  } catch (err) {
    console.error("Exception:", err);
  }
}

testInsertBlock();
