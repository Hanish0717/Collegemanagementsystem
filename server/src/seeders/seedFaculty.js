/**
 * Faculty Management Seeder
 * 
 * Usage: npm run seed:faculty
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Faculty from '../models/faculty/Faculty.js';
import FacultyDepartment from '../models/faculty/FacultyDepartment.js';
import FacultySubject from '../models/faculty/FacultySubject.js';
import FacultyAttendance from '../models/faculty/FacultyAttendance.js';
import FacultySalary from '../models/faculty/FacultySalary.js';
import FacultySchedule from '../models/faculty/FacultySchedule.js';
import Department from '../models/academic/Department.js';
import AcademicYear from '../models/academic/AcademicYear.js';
import Subject from '../models/academic/Subject.js';
import User from '../models/auth/User.js';

dotenv.config();

const additionalFaculty = [
  { fullName: 'Dr. Sarah Johnson', email: 'sarah@college.com', empId: 'FAC2019001', gender: 'Female', deptCode: 'CSE', designation: 'Professor', qualification: 'PhD Computer Science', specialization: 'Artificial Intelligence', experience: 15, highestDegree: 'PhD', salary: { basic: 120000, allowances: 40000 } },
  { fullName: 'Prof. Rajesh Verma', email: 'rajesh@college.com', empId: 'FAC2020002', gender: 'Male', deptCode: 'CSE', designation: 'Assistant Professor', qualification: 'M.Tech CSE', specialization: 'Database Systems', experience: 8, highestDegree: 'M.Tech', salary: { basic: 80000, allowances: 25000 } },
  { fullName: 'Dr. Meena Iyer', email: 'meena@college.com', empId: 'FAC2018001', gender: 'Female', deptCode: 'ECE', designation: 'Associate Professor', qualification: 'PhD Electronics', specialization: 'VLSI Design', experience: 12, highestDegree: 'PhD', salary: { basic: 100000, allowances: 35000 } },
  { fullName: 'Prof. Anil Gupta', email: 'anil@college.com', empId: 'FAC2021001', gender: 'Male', deptCode: 'ME', designation: 'Lecturer', qualification: 'M.Tech Mechanical', specialization: 'Thermodynamics', experience: 5, highestDegree: 'M.Tech', salary: { basic: 60000, allowances: 20000 } },
];

async function seedFaculty() {
  const startTime = Date.now();
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('  Faculty Management Module — Seeder');
    console.log('═══════════════════════════════════════════════════');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.\n');

    const departments = await Department.find({}).lean();
    const deptMap = {};
    departments.forEach((d) => { deptMap[d.code] = d; });

    const academicYear = await AcademicYear.findOne({ isCurrent: true });
    const subjects = await Subject.find({}).lean();

    // ── Additional Faculty ──────────────────────────
    console.log('📌 Seeding Faculty...');
    const facultyDocs = [];
    for (const f of additionalFaculty) {
      let user = await User.findOne({ email: f.email });
      if (!user) {
        user = await User.create({ fullName: f.fullName, email: f.email, password: 'password123', role: 'faculty' });
      }
      let faculty = await Faculty.findOne({ employeeId: f.empId });
      if (!faculty) {
        const dept = deptMap[f.deptCode];
        faculty = await Faculty.create({
          user: user._id, fullName: f.fullName, employeeId: f.empId, email: f.email,
          gender: f.gender, department: dept._id, departmentName: f.deptCode,
          designation: f.designation, qualification: f.qualification,
          specialization: f.specialization, experience: f.experience,
          highestDegree: f.highestDegree, salary: f.salary,
          joiningDate: new Date(2020, 5, 1),
          emergencyContact: { name: 'Emergency Contact', phone: '9876543210', relation: 'Spouse' },
        });
        console.log(`   ✅ ${f.fullName} (${f.empId})`);
      } else {
        console.log(`   ⏭️  ${f.fullName} exists`);
      }
      facultyDocs.push(faculty);
    }

    // Also include existing faculty
    const allFaculty = await Faculty.find({}).lean();

    // ── Faculty-Department ───────────────────────────
    console.log('\n📌 Seeding Faculty-Department Assignments...');
    await FacultyDepartment.deleteMany({}).setOptions({ includeDeleted: true });
    for (const fac of allFaculty) {
      await FacultyDepartment.create({
        faculty: fac._id, department: fac.department, role: 'primary',
        isHOD: fac.designation === 'Professor', academicYear: academicYear._id,
      });
    }
    // Cross-department: Sarah also teaches in ECE
    const sarah = allFaculty.find((f) => f.employeeId === 'FAC2019001');
    const eceDept = deptMap['ECE'];
    if (sarah && eceDept) {
      await FacultyDepartment.create({
        faculty: sarah._id, department: eceDept._id, role: 'visiting', academicYear: academicYear._id,
      });
    }
    console.log(`   ✅ ${allFaculty.length + 1} assignments`);

    // ── Faculty-Subject ─────────────────────────────
    console.log('\n📌 Seeding Faculty-Subject Assignments...');
    await FacultySubject.deleteMany({}).setOptions({ includeDeleted: true });
    const cseSubs = subjects.filter((s) => s.code.startsWith('CS'));
    let fsCount = 0;
    for (let i = 0; i < allFaculty.length && i < cseSubs.length; i++) {
      const fac = allFaculty[i];
      const sub = cseSubs[i];
      if (!sub) continue;
      await FacultySubject.create({
        faculty: fac._id, subject: sub._id, subjectName: sub.name, subjectCode: sub.code,
        department: fac.department, semester: sub.semester, section: 'A',
        academicYear: academicYear._id, teachingType: 'theory', weeklyHours: 4,
      });
      fsCount++;
    }
    console.log(`   ✅ ${fsCount} subject assignments`);

    // ── Faculty Attendance ──────────────────────────
    console.log('\n📌 Seeding Faculty Attendance...');
    await FacultyAttendance.deleteMany({}).setOptions({ includeDeleted: true });
    let attCount = 0;
    const today = new Date();
    for (const fac of allFaculty.slice(0, 3)) {
      for (let day = 1; day <= 15; day++) {
        const date = new Date(today); date.setDate(date.getDate() - day);
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        const statuses = ['present', 'present', 'present', 'present', 'on-leave'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const checkIn = new Date(date); checkIn.setHours(9, 0, 0);
        const checkOut = new Date(date); checkOut.setHours(17, 30, 0);
        await FacultyAttendance.create({
          faculty: fac._id, department: fac.department, date, status,
          checkIn: status === 'present' ? { time: checkIn, method: 'biometric' } : undefined,
          checkOut: status === 'present' ? { time: checkOut, method: 'biometric' } : undefined,
          leaveType: status === 'on-leave' ? 'casual' : undefined,
          classesScheduled: 5, classesTaken: status === 'present' ? 5 : 0,
          academicYear: academicYear._id,
        });
        attCount++;
      }
    }
    console.log(`   ✅ ${attCount} attendance records`);

    // ── Faculty Salary ──────────────────────────────
    console.log('\n📌 Seeding Faculty Salary...');
    await FacultySalary.deleteMany({}).setOptions({ includeDeleted: true });
    let salCount = 0;
    for (const fac of allFaculty) {
      for (let m = 1; m <= 3; m++) {
        const basic = fac.salary?.basic || 50000;
        const hra = Math.round(basic * 0.2);
        const da = Math.round(basic * 0.1);
        await FacultySalary.create({
          faculty: fac._id, employeeId: fac.employeeId, department: fac.department,
          month: m, year: 2026,
          earnings: { basicPay: basic, hra, da, specialAllowance: 5000, conveyanceAllowance: 3000 },
          deductions: { pf: Math.round(basic * 0.12), tds: Math.round(basic * 0.1), professionalTax: 200 },
          workingDays: 22, daysPresent: 20, daysAbsent: 2,
          paymentStatus: 'paid', paymentDate: new Date(2026, m, 1), paymentMethod: 'bank-transfer',
          payslipNumber: `SAL-${fac.employeeId}-2026-${String(m).padStart(2, '0')}`,
        });
        salCount++;
      }
    }
    console.log(`   ✅ ${salCount} salary records`);

    // ── Faculty Schedule ────────────────────────────
    console.log('\n📌 Seeding Faculty Schedules...');
    await FacultySchedule.deleteMany({}).setOptions({ includeDeleted: true });
    let schCount = 0;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const times = [['09:00','09:50'],['10:00','10:50'],['11:00','11:50'],['14:00','14:50'],['15:00','15:50']];

    for (let i = 0; i < allFaculty.length && i < cseSubs.length; i++) {
      const fac = allFaculty[i];
      const sub = cseSubs[i];
      if (!sub) continue;
      for (let d = 0; d < 3; d++) {
        const period = (i % 5) + 1;
        await FacultySchedule.create({
          faculty: fac._id, subject: sub._id, subjectName: sub.name, subjectCode: sub.code,
          department: fac.department, semester: sub.semester, section: 'A',
          academicYear: academicYear._id,
          day: days[d], period, startTime: times[period-1][0], endTime: times[period-1][1],
          duration: 50, room: { number: `${100 + i + d}`, building: 'Main Block', floor: 1, type: 'classroom', capacity: 60 },
          classType: 'lecture',
        });
        schCount++;
      }
    }
    console.log(`   ✅ ${schCount} schedule entries`);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  ✅ Faculty module seeded in ${elapsed}s`);
    console.log('═══════════════════════════════════════════════════');
  } catch (error) {
    console.error('\n❌ Error:', error.message || error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
  }
}

seedFaculty();
