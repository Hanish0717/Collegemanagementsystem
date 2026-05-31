import { supabase } from './config/supabase.js';
import { updateStudentAttendancePercentage } from './services/attendanceService.js';

async function seed() {
  console.log("Starting attendance seeding...");

  // 1. Delete existing attendance records
  const { error: delErr } = await supabase
    .from('attendance')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (delErr) {
    console.error("Error clearing attendance table:", delErr);
    return;
  }
  console.log("Cleared existing attendance records.");

  // 2. Fetch all active students
  const { data: students, error: studErr } = await supabase
    .from('students')
    .select('id, department')
    .eq('is_active', true);

  if (studErr || !students) {
    console.error("Error fetching students:", studErr);
    return;
  }

  // 3. Generate last 15 days dates (excluding Sundays)
  const dates = [];
  let current = new Date();
  for (let i = 0; i < 20 && dates.length < 15; i++) {
    const d = new Date(current);
    d.setDate(current.getDate() - i);
    if (d.getDay() !== 0) { // Not Sunday
      dates.push(d.toISOString().split('T')[0]);
    }
  }
  dates.reverse();
  console.log("Generating attendance for dates:", dates);

  // 4. Seed attendance for each student
  // Pick one student from each department to have low attendance (<75%), others high (~90%)
  const lowAttendanceStudentIds = new Set();
  const deptsDone = new Set();

  for (const student of students) {
    if (!deptsDone.has(student.department)) {
      lowAttendanceStudentIds.add(student.id);
      deptsDone.add(student.department);
    }
  }

  const attendanceRecords = [];

  for (const student of students) {
    const isLow = lowAttendanceStudentIds.has(student.id);
    const absentDaysCount = isLow ? 6 : (Math.random() > 0.5 ? 1 : 2);
    
    const shuffledDates = [...dates].sort(() => 0.5 - Math.random());
    const absentDates = new Set(shuffledDates.slice(0, absentDaysCount));

    for (const date of dates) {
      const status = absentDates.has(date) ? 'absent' : 'present';
      attendanceRecords.push({
        student: student.id,
        date,
        status,
        subject: 'Regular Class',
        remarks: isLow ? 'Frequent absence' : 'Regular'
      });
    }
  }

  // Insert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < attendanceRecords.length; i += batchSize) {
    const batch = attendanceRecords.slice(i, i + batchSize);
    const { error: insErr } = await supabase
      .from('attendance')
      .insert(batch);
    if (insErr) {
      console.error(`Error inserting batch ${i}:`, insErr);
      return;
    }
  }

  console.log(`Successfully seeded ${attendanceRecords.length} attendance records.`);

  // 5. Recalculate percentages for all students
  console.log("Recalculating student attendance percentages...");
  for (const student of students) {
    await updateStudentAttendancePercentage(student.id);
  }
  console.log("Recalculation complete!");
}

seed();
