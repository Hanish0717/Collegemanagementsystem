/**
 * Student Management Seeder
 * 
 * Seeds the complete student module:
 *   1. Courses (linked to departments)
 *   2. Semesters (linked to courses & academic year)
 *   3. Enhanced students with course/admission data
 *   4. Student results (sample grades)
 *   5. Student documents (sample records)
 *   6. Attendance records (sample entries)
 *   7. Fee records (sample entries)
 * 
 * Usage: npm run seed:students
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Department from '../models/academic/Department.js';
import AcademicYear from '../models/academic/AcademicYear.js';
import Subject from '../models/academic/Subject.js';
import Course from '../models/academic/Course.js';
import Semester from '../models/academic/Semester.js';
import Student from '../models/student/Student.js';
import StudentResult from '../models/student/StudentResult.js';
import StudentDocument from '../models/student/StudentDocument.js';
import Attendance from '../models/attendance/Attendance.js';
import Fee from '../models/fee/Fee.js';
import User from '../models/auth/User.js';
import Faculty from '../models/faculty/Faculty.js';

dotenv.config();

// ═══════════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════════

const coursesData = [
  { name: 'B.Tech Computer Science & Engineering', code: 'BTCSE', degreeType: 'bachelors', deptCode: 'CSE', duration: { years: 4, totalSemesters: 8 }, totalCredits: 180, totalSeats: 120, fees: { perSemester: 50000, perYear: 100000 }, eligibility: '10+2 with PCM, min 60% aggregate' },
  { name: 'B.Tech Electronics & Communication Engineering', code: 'BTECE', degreeType: 'bachelors', deptCode: 'ECE', duration: { years: 4, totalSemesters: 8 }, totalCredits: 175, totalSeats: 120, fees: { perSemester: 50000, perYear: 100000 }, eligibility: '10+2 with PCM, min 60% aggregate' },
  { name: 'B.Tech Mechanical Engineering', code: 'BTME', degreeType: 'bachelors', deptCode: 'ME', duration: { years: 4, totalSemesters: 8 }, totalCredits: 170, totalSeats: 60, fees: { perSemester: 45000, perYear: 90000 }, eligibility: '10+2 with PCM, min 55% aggregate' },
  { name: 'B.Tech Civil Engineering', code: 'BTCE', degreeType: 'bachelors', deptCode: 'CE', duration: { years: 4, totalSemesters: 8 }, totalCredits: 170, totalSeats: 60, fees: { perSemester: 45000, perYear: 90000 }, eligibility: '10+2 with PCM, min 55% aggregate' },
  { name: 'B.Tech Electrical Engineering', code: 'BTEE', degreeType: 'bachelors', deptCode: 'EE', duration: { years: 4, totalSemesters: 8 }, totalCredits: 170, totalSeats: 60, fees: { perSemester: 45000, perYear: 90000 }, eligibility: '10+2 with PCM, min 55% aggregate' },
  { name: 'M.Tech Computer Science', code: 'MTCSE', degreeType: 'masters', deptCode: 'CSE', duration: { years: 2, totalSemesters: 4 }, totalCredits: 80, totalSeats: 30, fees: { perSemester: 60000, perYear: 120000 }, eligibility: 'B.Tech in CSE/IT with min 60% aggregate' },
];

const additionalStudents = [
  { fullName: 'Rahul Kumar', email: 'rahul@college.com', rollNumber: 'CS2026002', gender: 'Male', dob: '2003-08-20', bloodGroup: 'B+', deptCode: 'CSE', year: 3, semester: 6, section: 'A', parentName: 'Ramesh Kumar', parentPhone: '9876500020', admissionNumber: 'ADM2023002', batch: '2023-2027' },
  { fullName: 'Priya Sharma', email: 'priya@college.com', rollNumber: 'CS2026003', gender: 'Female', dob: '2004-02-14', bloodGroup: 'O+', deptCode: 'CSE', year: 3, semester: 6, section: 'A', parentName: 'Suresh Sharma', parentPhone: '9876500021', admissionNumber: 'ADM2023003', batch: '2023-2027' },
  { fullName: 'Amit Patel', email: 'amit@college.com', rollNumber: 'EC2026001', gender: 'Male', dob: '2004-06-10', bloodGroup: 'A+', deptCode: 'ECE', year: 2, semester: 4, section: 'B', parentName: 'Vijay Patel', parentPhone: '9876500022', admissionNumber: 'ADM2024001', batch: '2024-2028' },
  { fullName: 'Sneha Reddy', email: 'sneha@college.com', rollNumber: 'ME2026001', gender: 'Female', dob: '2003-11-25', bloodGroup: 'AB+', deptCode: 'ME', year: 4, semester: 8, section: 'A', parentName: 'Krishna Reddy', parentPhone: '9876500023', admissionNumber: 'ADM2022001', batch: '2022-2026' },
];

// ═══════════════════════════════════════════════════════════
// SEED FUNCTIONS
// ═══════════════════════════════════════════════════════════

async function seedCourses(deptMap) {
  console.log('\n📌 Seeding Courses...');
  await Course.deleteMany({}).setOptions({ includeDeleted: true });

  const courseMap = {};
  for (const c of coursesData) {
    const dept = deptMap[c.deptCode];
    if (!dept) continue;

    const course = await Course.create({
      name: c.name,
      code: c.code,
      department: dept._id,
      degreeType: c.degreeType,
      duration: c.duration,
      totalCredits: c.totalCredits,
      totalSeats: c.totalSeats,
      fees: c.fees,
      eligibility: c.eligibility,
    });
    courseMap[c.code] = course;
    console.log(`   ✅ ${course.name} (${course.code})`);
  }
  return courseMap;
}

async function seedSemesters(courseMap, academicYear) {
  console.log('\n📌 Seeding Semesters...');
  await Semester.deleteMany({}).setOptions({ includeDeleted: true });

  const semesterMap = {};
  const btcse = courseMap['BTCSE'];
  if (!btcse) return semesterMap;

  for (let i = 1; i <= 8; i++) {
    const yearNum = Math.ceil(i / 2);
    const isOdd = i % 2 === 1;
    const startMonth = isOdd ? 6 : 0; // July or January
    const startYear = isOdd ? 2025 : 2026;

    const sem = await Semester.create({
      name: `Semester ${i}`,
      number: i,
      course: btcse._id,
      academicYear: academicYear._id,
      year: yearNum,
      startDate: new Date(startYear, startMonth, 15),
      endDate: new Date(startYear, startMonth + 5, 15),
      examStartDate: new Date(startYear, startMonth + 4, 20),
      examEndDate: new Date(startYear, startMonth + 5, 10),
      totalCredits: 22,
      minCreditsRequired: 18,
      status: i === 6 ? 'ongoing' : i < 6 ? 'completed' : 'upcoming',
    });
    semesterMap[i] = sem;
  }
  console.log(`   ✅ Created 8 semesters for B.Tech CSE`);
  return semesterMap;
}

async function seedAdditionalStudents(deptMap, courseMap) {
  console.log('\n📌 Seeding Additional Students...');

  const seededStudents = [];
  for (const s of additionalStudents) {
    // Check if user already exists
    let user = await User.findOne({ email: s.email });
    if (!user) {
      user = await User.create({
        fullName: s.fullName,
        email: s.email,
        password: 'password123',
        role: 'student',
        phoneNumber: '9876500' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
      });
    }

    // Check if student exists
    let student = await Student.findOne({ rollNumber: s.rollNumber });
    if (student) {
      seededStudents.push(student);
      console.log(`   ⏭️  ${s.fullName} already exists`);
      continue;
    }

    const dept = deptMap[s.deptCode];
    const courseCode = s.deptCode === 'CSE' ? 'BTCSE' : s.deptCode === 'ECE' ? 'BTECE' : s.deptCode === 'ME' ? 'BTME' : 'BTCE';
    const course = courseMap[courseCode];

    student = await Student.create({
      user: user._id,
      fullName: s.fullName,
      admissionNumber: s.admissionNumber,
      rollNumber: s.rollNumber,
      email: s.email,
      gender: s.gender,
      dateOfBirth: new Date(s.dob),
      bloodGroup: s.bloodGroup,
      department: dept._id,
      departmentName: s.deptCode,
      course: course?._id,
      courseName: course?.name,
      year: s.year,
      semester: s.semester,
      section: s.section,
      batch: s.batch,
      parentName: s.parentName,
      parentPhone: s.parentPhone,
      parentRelation: 'father',
      address: { city: 'Hyderabad', state: 'Telangana', pincode: '500001', country: 'India' },
      emergencyContact: { name: s.parentName, phone: s.parentPhone, relation: 'Father' },
      cgpa: +(Math.random() * 3 + 7).toFixed(1),
      attendancePercentage: Math.floor(Math.random() * 20 + 75),
    });
    seededStudents.push(student);
    console.log(`   ✅ ${s.fullName} (${s.rollNumber})`);
  }
  return seededStudents;
}

async function seedStudentResults(students, semesterMap, academicYear) {
  console.log('\n📌 Seeding Student Results...');
  await StudentResult.deleteMany({}).setOptions({ includeDeleted: true });

  const subjects = await Subject.find({}).lean();
  const cseSubjects = subjects.filter((s) => s.code.startsWith('CS'));
  let count = 0;

  // Get CSE students only
  const cseStudents = students.filter((s) => s.departmentName === 'CSE');
  const allStudents = await Student.find({ departmentName: 'CSE' }).lean();
  const targetStudents = [...cseStudents, ...allStudents].filter(
    (s, i, arr) => arr.findIndex((x) => x.rollNumber === s.rollNumber) === i
  );

  for (const student of targetStudents) {
    for (const subj of cseSubjects.slice(0, 3)) {
      const sem = semesterMap[subj.semester];
      if (!sem) continue;

      const internal = Math.floor(Math.random() * 15 + 25);
      const external = Math.floor(Math.random() * 25 + 35);

      await StudentResult.create({
        student: student._id,
        subject: subj._id,
        subjectName: subj.name,
        subjectCode: subj.code,
        semester: sem._id,
        semesterNumber: subj.semester,
        academicYear: academicYear._id,
        department: student.department,
        internalMarks: { obtained: internal, maximum: 40 },
        externalMarks: { obtained: external, maximum: 60 },
        credits: subj.credits || 4,
        status: 'published',
        publishedAt: new Date(),
        attemptNumber: 1,
      });
      count++;
    }
  }
  console.log(`   ✅ Created ${count} result records`);
}

async function seedStudentDocuments(students) {
  console.log('\n📌 Seeding Student Documents...');
  await StudentDocument.deleteMany({}).setOptions({ includeDeleted: true });

  const docTypes = [
    { type: 'aadhaar', title: 'Aadhaar Card', mandatory: true },
    { type: 'ssc-marksheet', title: 'SSC Marksheet', mandatory: true },
    { type: 'hsc-marksheet', title: 'HSC Marksheet', mandatory: true },
    { type: 'photograph', title: 'Passport Photo', mandatory: true },
    { type: 'transfer-certificate', title: 'Transfer Certificate', mandatory: false },
  ];

  let count = 0;
  const allStudents = await Student.find({}).lean();

  for (const student of allStudents.slice(0, 5)) {
    for (const doc of docTypes) {
      await StudentDocument.create({
        student: student._id,
        title: doc.title,
        type: doc.type,
        fileUrl: `/uploads/documents/${student.rollNumber}/${doc.type}.pdf`,
        fileName: `${doc.type}.pdf`,
        fileSize: Math.floor(Math.random() * 500000 + 100000),
        mimeType: 'application/pdf',
        isMandatory: doc.mandatory,
        verification: {
          status: doc.mandatory ? 'verified' : 'pending',
          verifiedAt: doc.mandatory ? new Date() : null,
        },
      });
      count++;
    }
  }
  console.log(`   ✅ Created ${count} document records`);
}

async function seedAttendanceRecords(students, academicYear) {
  console.log('\n📌 Seeding Attendance Records...');
  await Attendance.deleteMany({}).setOptions({ includeDeleted: true });

  const subjects = await Subject.find({}).lean();
  const faculty = await Faculty.findOne({}).lean();
  const cseSubjects = subjects.filter((s) => s.code.startsWith('CS'));
  const cseStudents = await Student.find({ departmentName: 'CSE' }).lean();

  let count = 0;
  const today = new Date();

  for (const student of cseStudents.slice(0, 3)) {
    for (const subj of cseSubjects.slice(0, 2)) {
      for (let day = 1; day <= 10; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() - day);
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        const statuses = ['present', 'present', 'present', 'present', 'absent', 'late'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        await Attendance.create({
          student: student._id,
          faculty: faculty?.user || student.user,
          subject: subj._id,
          subjectName: subj.name,
          department: student.department,
          semester: student.semester,
          section: student.section,
          date,
          period: Math.ceil(Math.random() * 6),
          status,
          academicYear: academicYear._id,
        });
        count++;
      }
    }
  }
  console.log(`   ✅ Created ${count} attendance records`);
}

async function seedStudentFees(academicYear) {
  console.log('\n📌 Seeding Student Fee Records...');
  // Don't delete existing fees from main seeder
  const allStudents = await Student.find({}).lean();
  let count = 0;

  for (const student of allStudents) {
    // Check if fees already exist
    const existing = await Fee.countDocuments({ student: student._id });
    if (existing > 0) continue;

    const feeTypes = [
      { type: 'tuition', amount: 50000, paid: 50000 },
      { type: 'examination', amount: 2500, paid: 0 },
    ];

    for (const f of feeTypes) {
      await Fee.create({
        student: student._id,
        academicYear: academicYear._id,
        academicYearName: '2025-2026',
        semester: student.semester,
        feeType: f.type,
        totalAmount: f.amount,
        paidAmount: f.paid,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentMethod: f.paid > 0 ? 'bank-transfer' : undefined,
      });
      count++;
    }
  }
  console.log(`   ✅ Created ${count} fee records`);
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function seedStudentModule() {
  const startTime = Date.now();

  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('  Student Management Module — Seeder');
    console.log('═══════════════════════════════════════════════════');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    // Load dependencies
    const departments = await Department.find({}).lean();
    const deptMap = {};
    departments.forEach((d) => { deptMap[d.code] = d; });

    const academicYear = await AcademicYear.findOne({ isCurrent: true });
    if (!academicYear) throw new Error('No active academic year found. Run main seeder first.');

    // Seed in order
    const courseMap = await seedCourses(deptMap);
    const semesterMap = await seedSemesters(courseMap, academicYear);
    const students = await seedAdditionalStudents(deptMap, courseMap);
    await seedStudentResults(students, semesterMap, academicYear);
    await seedStudentDocuments(students);
    await seedAttendanceRecords(students, academicYear);
    await seedStudentFees(academicYear);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  ✅ Student module seeded in ${elapsed}s`);
    console.log('═══════════════════════════════════════════════════');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
  }
}

seedStudentModule();
