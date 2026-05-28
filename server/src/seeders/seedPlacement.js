/**
 * Placement Management Seeder
 * Usage: npm run seed:placement
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Company from '../models/placement/Company.js';
import PlacementDrive from '../models/placement/PlacementDrive.js';
import DriveRound from '../models/placement/DriveRound.js';
import StudentApplication from '../models/placement/StudentApplication.js';
import InterviewResult from '../models/placement/InterviewResult.js';
import SelectedStudent from '../models/placement/SelectedStudent.js';
import Student from '../models/student/Student.js';
import Department from '../models/academic/Department.js';
import User from '../models/auth/User.js';

dotenv.config();

const companiesData = [
  { name: 'Google India', website: 'https://careers.google.com', industry: 'Technology', description: 'Global tech leader in search, cloud, AI, and hardware products.', contacts: [{ name: 'Anjali Sharma', email: 'anjali@google.com', phone: '9876543210', designation: 'University Relations Lead' }] },
  { name: 'Microsoft Corporation', website: 'https://careers.microsoft.com', industry: 'Technology / Software', description: 'Empowering every person and organization on the planet to achieve more.', contacts: [{ name: 'Deepak Rao', email: 'deepak@microsoft.com', phone: '9876543211', designation: 'Technical Recruiter' }] },
  { name: 'Amazon Development Centre', website: 'https://amazon.jobs', industry: 'E-commerce & Cloud', description: 'Customer-obsessed leader in retail, AWS cloud services, and digital streaming.', contacts: [{ name: 'Shreya Roy', email: 'shreya@amazon.com', phone: '9876543212', designation: 'Campus Hiring Coordinator' }] },
  { name: 'Infosys Limited', website: 'https://www.infosys.com/careers', industry: 'IT Services', description: 'Next-generation digital services and consulting leader.', contacts: [{ name: 'Venkatesh Prasad', email: 'venkat@infosys.com', phone: '9876543213', designation: 'HR Manager' }] },
];

async function seedPlacement() {
  const startTime = Date.now();
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('  Placement Management Module — Seeder');
    console.log('═══════════════════════════════════════════════════');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.\n');

    const students = await Student.find({}).lean();
    const departments = await Department.find({}).lean();
    const poUser = await User.findOne({ role: 'placement-officer' }) || await User.findOne({});

    if (students.length === 0) {
      console.log('⚠️ No students found in database. Please run students seeder first.');
      return;
    }

    const cseDept = departments.find((d) => d.code === 'CSE') || departments[0];
    const eceDept = departments.find((d) => d.code === 'ECE') || departments[1];

    // ── Companies ───────────────────────────────────
    console.log('📌 Seeding Companies...');
    await Company.deleteMany({}).setOptions({ includeDeleted: true });
    const companyDocs = [];
    for (const c of companiesData) {
      const company = await Company.create(c);
      companyDocs.push(company);
      console.log(`   ✅ ${c.name}`);
    }

    // ── Placement Drives ─────────────────────────────
    console.log('\n📌 Seeding Placement Drives...');
    await PlacementDrive.deleteMany({}).setOptions({ includeDeleted: true });
    const driveDocs = [];
    const today = new Date();

    const drivesData = [
      { companyIdx: 0, title: 'Software Development Engineer', type: 'full-time', minCGPA: 8.0, maxBacklogs: 0, positions: 5, minPkg: 15, maxPkg: 22, venue: 'Seminar Hall 1' },
      { companyIdx: 1, title: 'Cloud Support Associate', type: 'full-time', minCGPA: 7.5, maxBacklogs: 1, positions: 10, minPkg: 10, maxPkg: 14, venue: 'Seminar Hall 2' },
      { companyIdx: 2, title: 'Summer SDE Intern', type: 'internship', minCGPA: 8.0, maxBacklogs: 0, positions: 8, minPkg: 4, maxPkg: 8, venue: 'Lab 4' },
      { companyIdx: 3, title: 'Systems Engineer', type: 'full-time', minCGPA: 6.0, maxBacklogs: 2, positions: 50, minPkg: 3.6, maxPkg: 5.5, venue: 'Auditorium' },
    ];

    for (const d of drivesData) {
      const company = companyDocs[d.companyIdx];
      const drive = await PlacementDrive.create({
        company: company._id, companyName: company.name, jobTitle: d.title,
        jobType: d.type, description: `Exciting career opportunity at ${company.name} as a ${d.title}.`,
        package: { minimum: d.minPkg, maximum: d.maxPkg, currency: 'LPA' },
        eligibility: { departments: [cseDept?._id, eceDept?._id].filter(Boolean), minCGPA: d.minCGPA, maxBacklogs: d.maxBacklogs, batch: 2026 },
        driveDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10),
        lastDateToApply: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
        venue: d.venue, totalPositions: d.positions, coordinator: poUser?._id,
        status: 'upcoming',
      });
      driveDocs.push(drive);
      console.log(`   ✅ ${company.name} — ${d.title} (Eligible CGPA: ${d.minCGPA}+)`);
    }

    // ── Drive Rounds ─────────────────────────────────
    console.log('\n📌 Seeding Drive Rounds...');
    await DriveRound.deleteMany({}).setOptions({ includeDeleted: true });
    const roundDocs = [];

    // Create rounds for Google (Drive 0) and Microsoft (Drive 1)
    const googleRounds = [
      { num: 1, name: 'Online Coding Challenge', type: 'coding' },
      { num: 2, name: 'Technical Interview Round 1', type: 'technical' },
      { num: 3, name: 'HR Interview Round', type: 'hr' },
    ];
    for (const r of googleRounds) {
      const round = await DriveRound.create({
        drive: driveDocs[0]._id, roundNumber: r.num, name: r.name,
        type: r.type, date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10 + r.num),
        status: r.num === 1 ? 'completed' : 'scheduled',
      });
      roundDocs.push(round);
      console.log(`   ✅ Google Round ${r.num}: ${r.name}`);
    }

    const microsoftRounds = [
      { num: 1, name: 'Cognitive & Technical MCQ', type: 'aptitude' },
      { num: 2, name: 'Final Technical & Fitment', type: 'technical' },
    ];
    for (const r of microsoftRounds) {
      const round = await DriveRound.create({
        drive: driveDocs[1]._id, roundNumber: r.num, name: r.name,
        type: r.type, date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12 + r.num),
        status: 'scheduled',
      });
      roundDocs.push(round);
      console.log(`   ✅ Microsoft Round ${r.num}: ${r.name}`);
    }

    // ── Student Applications ─────────────────────────
    console.log('\n📌 Seeding Student Applications...');
    await StudentApplication.deleteMany({}).setOptions({ includeDeleted: true });
    const appDocs = [];

    // Apply students to Google Drive
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const app = await StudentApplication.create({
        student: student._id, drive: driveDocs[0]._id,
        resumeUrl: `https://storage.college.edu/resumes/${student.rollNumber}.pdf`,
        coverLetter: `Hello, I am interested in Software Development roles at Google India. Here is my profile.`,
        status: i < 3 ? 'in-progress' : 'rejected',
        appliedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2),
      });
      appDocs.push(app);
      console.log(`   ✅ ${student.fullName} applied to Google (Status: ${app.status})`);
    }

    // ── Interview Results ────────────────────────────
    console.log('\n📌 Seeding Interview Results...');
    await InterviewResult.deleteMany({}).setOptions({ includeDeleted: true });
    let resCount = 0;

    // Online Coding round results for Google Drive (Round 1)
    const round1 = roundDocs[0];
    for (let i = 0; i < appDocs.length; i++) {
      const app = appDocs[i];
      const resultVal = i < 3 ? 'passed' : 'failed';
      await InterviewResult.create({
        application: app._id, round: round1._id, score: i < 3 ? 85 + i * 5 : 45,
        result: resultVal, remarks: i < 3 ? 'Outstanding coding speed and correctness.' : 'Failed to clear minimum cut-off.',
        interviewerName: 'Automated Proctoring System',
      });
      resCount++;
    }
    console.log(`   ✅ Seeded ${resCount} round results`);

    // ── Selected Students ────────────────────────────
    console.log('\n📌 Seeding Selected Students...');
    await SelectedStudent.deleteMany({}).setOptions({ includeDeleted: true });
    let selectedCount = 0;

    // Select the first student who applied for Google
    if (appDocs.length > 0) {
      const primaryApp = appDocs[0];
      const studentObj = students.find((s) => s._id.toString() === primaryApp.student.toString());
      await SelectedStudent.create({
        student: primaryApp.student, drive: primaryApp.drive,
        application: primaryApp.id || primaryApp._id, packageOffered: 18,
        offerLetterUrl: `https://storage.college.edu/offers/google-${studentObj.rollNumber}.pdf`,
        joiningDate: new Date(today.getFullYear() + 1, 6, 1),
        status: 'accepted',
        remarks: 'Cleared all rounds with exceptional scores. Offer accepted by student.',
      });
      // Also update application status
      await StudentApplication.findByIdAndUpdate(primaryApp._id, { status: 'selected' });
      selectedCount++;
      console.log(`   🏆 Selection: ${studentObj.fullName} selected at Google (Package: 18 LPA)`);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  ✅ Placement module seeded in ${elapsed}s`);
    console.log('═══════════════════════════════════════════════════');
  } catch (error) {
    console.error('\n❌ Error:', error.message || error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
  }
}

seedPlacement();
