import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ Error: DATABASE_URL is missing in your .env file!");
  process.exit(1);
}

const isLocalDatabase =
  connectionString.includes('localhost') ||
  connectionString.includes('127.0.0.1') ||
  connectionString.includes('db') ||
  connectionString.includes('postgres') ||
  connectionString.includes('host.docker.internal') ||
  process.env.DATABASE_SSL === 'false';

const client = new Client({
  connectionString,
  ssl: isLocalDatabase ? false : { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log("Connected to database successfully.");

  console.log("🧹 Cleaning transactional database tables...");
  await client.query("DELETE FROM exam_evaluations CASCADE");
  await client.query("DELETE FROM marks_correction_requests CASCADE");
  await client.query("DELETE FROM results CASCADE");
  await client.query("DELETE FROM hall_tickets CASCADE");
  await client.query("DELETE FROM exam_registrations CASCADE");
  await client.query("DELETE FROM exam_timetables CASCADE");
  await client.query("DELETE FROM exams CASCADE");
  await client.query("DELETE FROM student_course_registrations CASCADE");
  await client.query("DELETE FROM courses CASCADE");
  await client.query("DELETE FROM subjects CASCADE");
  await client.query("DELETE FROM id_card_requests CASCADE");
  await client.query("DELETE FROM id_cards CASCADE");
  console.log("✅ Wiped all transactional tables.");

  // Check if students/faculty exist
  const studentsCount = await client.query("SELECT COUNT(*) FROM students");
  const facultyCount = await client.query("SELECT COUNT(*) FROM faculty");
  
  const sCount = parseInt(studentsCount.rows[0].count, 10);
  const fCount = parseInt(facultyCount.rows[0].count, 10);
  
  console.log(`ℹ️ Current DB stats: Students=${sCount}, Faculty=${fCount}`);
  
  if (sCount === 0 || fCount === 0) {
    console.error("❌ Error: Student or faculty data is missing. Please run 'npm run seed:supabase' first to load base profiles!");
    await client.end();
    return;
  }

  // Group active students by department & semester to find the demo cohort
  const cohortsRes = await client.query(`
    SELECT department, semester, COUNT(*) as count 
    FROM students 
    WHERE is_active = true 
    GROUP BY department, semester 
    ORDER BY count DESC
  `);

  if (cohortsRes.rows.length === 0) {
    console.error("❌ No active student cohorts found in the database!");
    await client.end();
    return;
  }

  // Select the primary cohort for demo (usually CSE Semester 5)
  const cohort = cohortsRes.rows[0];
  const targetDept = cohort.department;
  const targetSem = Number(cohort.semester);
  const targetYear = Math.ceil(targetSem / 2);
  const semStr = `Semester ${targetSem}`;

  console.log(`🎯 Targeting Demo Cohort: ${targetDept} - Year ${targetYear} (Sem ${targetSem}) [${cohort.count} students]`);

  // Fetch student profiles for the selected cohort
  const cohortStudents = await client.query(`
    SELECT id, user_id, full_name, roll_number 
    FROM students 
    WHERE department = $1 AND semester = $2 AND is_active = true
  `, [targetDept, targetSem]);

  // Fetch faculty profiles
  const facultyRes = await client.query(`
    SELECT id, full_name, designation 
    FROM faculty 
    WHERE is_active = true 
    LIMIT 10
  `);
  const facultyList = facultyRes.rows;

  // 1. Seed fresh subjects in subjects catalog
  console.log("🌱 Seeding subjects table...");
  const subjectsData = [
    { code: `${targetDept}${targetSem}01`, name: 'Data Structures & Algorithms', credits: 4 },
    { code: `${targetDept}${targetSem}02`, name: 'Database Management Systems', credits: 4 },
    { code: `${targetDept}${targetSem}03`, name: 'Operating Systems', credits: 4 },
    { code: `${targetDept}${targetSem}04`, name: 'Design & Analysis of Algorithms', credits: 4 }
  ];

  for (const s of subjectsData) {
    await client.query(`
      INSERT INTO subjects (code, name, department, semester, credits, status)
      VALUES ($1, $2, $3, $4, $5, 'Active')
      ON CONFLICT (code) DO NOTHING
    `, [s.code, s.name, targetDept, semStr, s.credits]);
  }

  // 2. Seed offered courses catalog
  console.log("🌱 Seeding courses table...");
  const courseIds = [];
  for (let i = 0; i < subjectsData.length; i++) {
    const s = subjectsData[i];
    const mentor = facultyList[i % facultyList.length];
    const courseRes = await client.query(`
      INSERT INTO courses (course_code, course_name, department, year, semester, course_type, credits, mentor_id)
      VALUES ($1, $2, $3, $4, $5, 'Normal Subject', $6, $7)
      RETURNING id, course_code, course_name
    `, [s.code, s.name, targetDept, targetYear, targetSem, s.credits, mentor ? mentor.id : null]);
    courseIds.push(courseRes.rows[0]);
  }

  // 3. Register students in the courses
  console.log(`🌱 Enrolling ${cohortStudents.rows.length} students in all offered courses...`);
  for (const student of cohortStudents.rows) {
    for (const course of courseIds) {
      await client.query(`
        INSERT INTO student_course_registrations (student_id, course_id, semester, year, status)
        VALUES ($1, $2, $3, $4, 'Registered')
        ON CONFLICT DO NOTHING
      `, [student.id, course.id, targetSem, targetYear]);
    }
  }

  // 4. Create an Exam Cycle
  console.log("🌱 Seeding exam cycle...");
  const examRes = await client.query(`
    INSERT INTO exams (name, type, department, year, semester, start_date, end_date, status, max_fee_due_limit)
    VALUES ($1, 'Regular', $2, $3, $4, CURRENT_DATE + 14, CURRENT_DATE + 21, 'Upcoming', 0)
    RETURNING id
  `, [`Sem ${targetSem} (${targetDept} Sem ${targetSem})`, targetDept, targetYear, targetSem]);
  const examId = examRes.rows[0].id;

  // 5. Seed exam registrations & hall tickets in 'Pending' state
  console.log("🌱 Registering students in exam cycle...");
  for (const student of cohortStudents.rows) {
    // Insert into exam_registrations (Student registered for these exam subjects)
    for (const course of courseIds) {
      await client.query(`
        INSERT INTO exam_registrations (student_id, course_id, semester, year, status)
        VALUES ($1, $2, $3, $4, 'Registered')
        ON CONFLICT DO NOTHING
      `, [student.id, course.id, targetSem, targetYear]);
    }

    // Insert into hall_tickets
    await client.query(`
      INSERT INTO hall_tickets (student_id, exam_id, seat_number, status)
      VALUES ($1, $2, $3, 'Pending')
      ON CONFLICT DO NOTHING
    `, [student.id, examId, `SEAT-${student.roll_number}`]);
  }

  console.log("🎉 Database cleanup and seeding completed successfully!");
  console.log(`👉 You can log in as Admin/Officer to approve Hall Tickets or create Timetable slots for "${targetDept} Year ${targetYear} Sem ${targetSem}".`);
  
  await client.end();
}

main().catch(async (err) => {
  console.error("❌ Critical seeding error:", err);
  try { await client.end(); } catch (e) {}
  process.exit(1);
});
