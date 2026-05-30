import { supabase } from './src/config/supabase.js';
import bcrypt from 'bcryptjs';

async function testCreateAdmin() {
  let createdUserId = null;
  try {
    const fullName = "Test Admin";
    const email = "testadmin@college.com";
    const employeeId = "ADM999";
    const department = null;

    // Check duplicate email
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    console.log("Existing user check:", existingUser);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create User record
    const { data: user, error: userErr } = await supabase
      .from('users')
      .insert([{
        name: fullName,
        full_name: fullName,
        email: email,
        role: 'admin',
        password: hashedPassword,
        is_verified: true,
        is_active: true
      }])
      .select()
      .single();

    if (userErr) {
      console.error("User insert error:", userErr);
      return;
    }
    createdUserId = user.id;
    console.log("Created user successfully:", user);

    // Create Admin profile record
    const { data: adminProfile, error: adminErr } = await supabase
      .from('admins')
      .insert([{
        user_id: user.id,
        full_name: fullName,
        email: email,
        employee_id: employeeId,
        department: department,
        is_active: true
      }])
      .select()
      .single();

    if (adminErr) {
      console.error("Admin insert error:", adminErr);
      return;
    }
    console.log("Created admin profile successfully:", adminProfile);

  } catch (error) {
    console.error("Caught error:", error);
  } finally {
    if (createdUserId) {
      await supabase.from('users').delete().eq('id', createdUserId);
      console.log("Cleaned up test user");
    }
    process.exit(0);
  }
}

testCreateAdmin();
