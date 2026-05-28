/**
 * Parent Management Seeder
 * Usage: npm run seed:parents
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Parent from '../models/parent/Parent.js';
import ParentStudent from '../models/parent/ParentStudent.js';
import ParentNotification from '../models/parent/ParentNotification.js';
import ParentMeeting from '../models/parent/ParentMeeting.js';
import Student from '../models/student/Student.js';
import Faculty from '../models/faculty/Faculty.js';
import AcademicYear from '../models/academic/AcademicYear.js';
import User from '../models/auth/User.js';

dotenv.config();

const additionalParents = [
  { fullName: 'Ramesh Kumar', email: 'ramesh.parent@college.com', phone: '9876500030', gender: 'Male', relationship: 'Father', occupation: 'Business Owner', org: 'Kumar Enterprises', income: 1200000, childRoll: 'CS2026002' },
  { fullName: 'Lakshmi Sharma', email: 'lakshmi.parent@college.com', phone: '9876500031', gender: 'Female', relationship: 'Mother', occupation: 'Teacher', org: 'DAV School', income: 800000, childRoll: 'CS2026003' },
  { fullName: 'Vijay Patel', email: 'vijay.parent@college.com', phone: '9876500032', gender: 'Male', relationship: 'Father', occupation: 'Engineer', org: 'Tata Motors', income: 1500000, childRoll: 'EC2026001' },
];

async function seedParents() {
  const startTime = Date.now();
  try {
    console.log('═══════════════════════════════════════════════════');
    console.log('  Parent Management Module — Seeder');
    console.log('═══════════════════════════════════════════════════');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.\n');

    const academicYear = await AcademicYear.findOne({ isCurrent: true });
    const allStudents = await Student.find({}).lean();
    const faculty = await Faculty.findOne({}).lean();

    // ── Additional Parents ──────────────────────────
    console.log('📌 Seeding Parents...');
    const parentDocs = [];
    for (const p of additionalParents) {
      let user = await User.findOne({ email: p.email });
      if (!user) {
        user = await User.create({ fullName: p.fullName, email: p.email, password: 'password123', role: 'parent', phoneNumber: p.phone });
      }
      let parent = await Parent.findOne({ user: user._id });
      if (!parent) {
        parent = await Parent.create({
          user: user._id, fullName: p.fullName, email: p.email, phoneNumber: p.phone,
          gender: p.gender, relationship: p.relationship, occupation: p.occupation,
          organization: p.org, annualIncome: p.income,
          address: { city: 'Hyderabad', state: 'Telangana', pincode: '500001', country: 'India' },
          emergencyContact: { name: p.fullName, phone: p.phone, relationship: 'Self' },
          communicationPreferences: { email: true, sms: true, whatsapp: true, pushNotification: true },
        });
        console.log(`   ✅ ${p.fullName} (${p.relationship})`);
      } else {
        console.log(`   ⏭️  ${p.fullName} exists`);
      }
      parentDocs.push(parent);
    }
    // Include existing parent
    const allParents = await Parent.find({}).lean();

    // ── Parent-Student Assignments ──────────────────
    console.log('\n📌 Seeding Parent-Student Assignments...');
    await ParentStudent.deleteMany({}).setOptions({ includeDeleted: true });
    let psCount = 0;
    for (const p of additionalParents) {
      const parent = allParents.find((pr) => pr.email === p.email);
      const student = allStudents.find((s) => s.rollNumber === p.childRoll);
      if (parent && student) {
        await ParentStudent.create({
          parent: parent._id, student: student._id,
          relationship: p.relationship.toLowerCase(), isPrimary: true,
        });
        psCount++;
      }
    }
    // Existing parent → existing student
    const existingParent = allParents.find((p) => p.email === 'parent@college.com');
    const janeDoe = allStudents.find((s) => s.rollNumber === 'CS2026001');
    if (existingParent && janeDoe) {
      await ParentStudent.create({
        parent: existingParent._id, student: janeDoe._id,
        relationship: 'father', isPrimary: true,
      });
      psCount++;
    }
    console.log(`   ✅ ${psCount} parent-student assignments`);

    // ── Parent Notifications ────────────────────────
    console.log('\n📌 Seeding Parent Notifications...');
    await ParentNotification.deleteMany({}).setOptions({ includeDeleted: true });
    const notifTypes = [
      { type: 'attendance', title: 'Attendance Alert', message: 'Your ward was absent today. Please contact the class teacher for details.', priority: 'high' },
      { type: 'fee-reminder', title: 'Fee Payment Reminder', message: 'Examination fee of ₹2,500 is due on 30th June 2026. Please pay before the due date.', priority: 'medium' },
      { type: 'result', title: 'Semester Results Published', message: 'Semester 5 results have been published. You can view them in the student portal.', priority: 'medium' },
      { type: 'announcement', title: 'Annual Day Celebration', message: 'Annual Day will be celebrated on 15th July 2026. Parents are cordially invited.', priority: 'low' },
      { type: 'meeting', title: 'PTM Scheduled', message: 'Parent-Teacher Meeting is scheduled for 20th June 2026 at 10:00 AM.', priority: 'high' },
      { type: 'emergency', title: 'Campus Closed Tomorrow', message: 'Due to heavy rains, campus will remain closed tomorrow. Stay safe.', priority: 'urgent' },
    ];

    let notifCount = 0;
    for (const parent of allParents) {
      for (const n of notifTypes) {
        const studentForParent = allStudents[Math.floor(Math.random() * allStudents.length)];
        await ParentNotification.create({
          parent: parent._id, student: studentForParent?._id,
          title: n.title, message: n.message, type: n.type, priority: n.priority,
          channel: 'in-app', isRead: Math.random() > 0.5,
          readAt: Math.random() > 0.5 ? new Date() : null,
          deliveryStatus: 'delivered',
          sentAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
        });
        notifCount++;
      }
    }
    console.log(`   ✅ ${notifCount} notifications`);

    // ── Parent Meetings ─────────────────────────────
    console.log('\n📌 Seeding Parent Meetings...');
    await ParentMeeting.deleteMany({}).setOptions({ includeDeleted: true });
    const meetingData = [
      { title: 'Parent-Teacher Meeting (PTM)', type: 'ptm', desc: 'Regular semester PTM for academic progress review.', agenda: ['Academic progress', 'Attendance review', 'Behavior assessment'] },
      { title: 'Fee Discussion', type: 'fee-discussion', desc: 'Discussion regarding pending fee balance.', agenda: ['Outstanding balance', 'Payment plan'] },
      { title: 'Academic Performance Review', type: 'academic-review', desc: 'One-on-one academic review for the student.', agenda: ['Subject-wise performance', 'Improvement areas', 'Study plan'] },
    ];

    let meetCount = 0;
    for (let i = 0; i < allParents.length && i < allStudents.length; i++) {
      const parent = allParents[i];
      const student = allStudents[i];
      for (const m of meetingData) {
        const date = new Date(); date.setDate(date.getDate() + Math.floor(Math.random() * 30));
        await ParentMeeting.create({
          parent: parent._id, student: student._id,
          faculty: faculty?._id, title: m.title, description: m.desc,
          type: m.type, scheduledDate: date,
          startTime: '10:00', endTime: '10:30', duration: 30,
          venue: 'Conference Room, Admin Block',
          mode: 'in-person', status: 'scheduled',
          requestedBy: 'admin', agenda: m.agenda,
          department: student.department, academicYear: academicYear?._id,
        });
        meetCount++;
      }
    }
    console.log(`   ✅ ${meetCount} meetings`);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  ✅ Parent module seeded in ${elapsed}s`);
    console.log('═══════════════════════════════════════════════════');
  } catch (error) {
    console.error('\n❌ Error:', error.message || error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
  }
}

seedParents();
