import { supabase } from './src/config/supabase.js';

async function testAdd() {
  const code = 'TEST_' + Math.floor(Math.random() * 1000);
  console.log(`Inserting test department with code: ${code}...`);
  
  const { data, error } = await supabase
    .from('departments')
    .insert([{
      code,
      name: 'Test Department',
      head_of_department: 'Test HoD',
      faculty_count: 5,
      student_count: 15,
      budget: '₹1.0Cr',
      is_active: true
    }])
    .select();

  if (error) {
    console.error('❌ Failed to insert:', error.message);
  } else {
    console.log('✅ Successfully inserted:', data);
    
    // Now delete it to clean up
    console.log(`Cleaning up test department...`);
    const { error: delError } = await supabase
      .from('departments')
      .delete()
      .eq('code', code);
    
    if (delError) {
      console.error('❌ Failed to delete:', delError.message);
    } else {
      console.log('✅ Successfully cleaned up!');
    }
  }
}

testAdd();
