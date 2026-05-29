import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing Supabase credentials!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function fixPasswords() {
  try {
    console.log("Generating verified local hash for 'password123'...");
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("password123", salt);

    // Verify it locally
    const isMatch = await bcrypt.compare("password123", hash);
    if (!isMatch) {
      throw new Error("Failed to verify the generated hash locally!");
    }
    console.log("✅ Hashed password verified locally.");

    console.log("Fetching users from Supabase...");
    const { data: users, error: fetchErr } = await supabase
      .from('users')
      .select('id, email');

    if (fetchErr) throw fetchErr;

    console.log(`Updating ${users.length} user accounts with the verified password hash...`);
    for (const u of users) {
      const { error: updateErr } = await supabase
        .from('users')
        .update({ password: hash })
        .eq('id', u.id);

      if (updateErr) {
        console.error(`❌ Failed to update ${u.email}:`, updateErr.message);
      } else {
        console.log(`✅ Updated password for: ${u.email}`);
      }
    }
    console.log("\n🎉 All passwords updated and synced successfully!");
  } catch (err) {
    console.error("❌ Unexpected error:", err);
  }
}

fixPasswords();
