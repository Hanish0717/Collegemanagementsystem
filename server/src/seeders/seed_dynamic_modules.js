import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Timetable from '../models/Timetable.js';
import Assignment from '../models/Assignment.js';
import StudyMaterial from '../models/StudyMaterial.js';
import Result from '../models/Result.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Complaint from '../models/Complaint.js';
import Placement from '../models/Placement.js';
import Fee from '../models/Fee.js';
import Attendance from '../models/Attendance.js';

dotenv.config({ path: 'c:/College Management System GA/Collegemanagementsystem/server/.env' });

const seedDynamicData = async () => {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully!");

    // 1. Fetch or create users
    console.log("Seeding User accounts...");
    
    // Student User
    let studentUser = await User.findOne({ email: 'student@college.com' });
    if (!studentUser) {
      studentUser = await User.create({
        name: 'Student User',
        fullName: 'Student User',
        email: 'student@college.com',
        password: 'password123',
        role: 'student',
        mobile: '1112223333',
        phoneNumber: '1112223333',
        isVerified: true,
        isActive: true
      });
    }

    // Faculty User
    let facultyUser = await User.findOne({ email: 'faculty@college.com' });
    if (!facultyUser) {
      facultyUser = await User.create({
        name: 'Faculty User',
        fullName: 'Faculty User',
        email: 'faculty@college.com',
        password: 'password123',
        role: 'faculty',
        mobile: '4445556666',
        phoneNumber: '4445556666',
        isVerified: true,
        isActive: true
      });
    }

    // Parent User
    let parentUser = await User.findOne({ email: 'parent@college.com' });
    if (!parentUser) {
      parentUser = await User.create({
        name: 'Parent User',
        fullName: 'Parent User',
        email: 'parent@college.com',
        password: 'password123',
        role: 'parent',
        mobile: '9998887777',
        phoneNumber: '9998887777',
        isVerified: true,
        isActive: true
      });
    }

    // 2. Create Student Profile linked to parent user's phone number
    console.log("Seeding Student Profile...");
    let studentProfile = await Student.findOne({ email: 'student@college.com' });
    if (studentProfile) {
      await Student.deleteOne({ email: 'student@college.com' });
    }
    
    studentProfile = await Student.create({
      fullName: 'Student User',
      rollNumber: 'CS2026101',
      email: 'student@college.com',
      phoneNumber: '1112223333',
      gender: 'Male',
      dateOfBirth: new Date('2005-08-15'),
      department: 'CSE',
      year: 3,
      semester: 5,
      section: 'A',
      parentName: 'Parent User',
      parentPhone: '9998887777', // Links to parent user phone
      parentEmail: 'parent@college.com',
      cgpa: 3.7,
      attendancePercentage: 88,
      isActive: true
    });

    // Clean old module data to avoid pollution
    console.log("Cleaning old dynamic data...");
    await Timetable.deleteMany({});
    await Assignment.deleteMany({});
    await StudyMaterial.deleteMany({});
    await Result.deleteMany({});
    await LeaveRequest.deleteMany({});
    await Complaint.deleteMany({});
    await Placement.deleteMany({});
    await Fee.deleteMany({ student: studentProfile._id });
    await Attendance.deleteMany({ student: studentProfile._id });

    // 3. Seed Timetable
    console.log("Seeding Timetable...");
    await Timetable.create([
      { day: 'Monday', time: '09:00 AM', subject: 'Data Structures', facultyName: 'Faculty User', room: 'Room 101', department: 'CSE', year: 3, semester: 5, section: 'A' },
      { day: 'Monday', time: '11:00 AM', subject: 'Algorithms', facultyName: 'Prof. Emily Chen', room: 'Room 102', department: 'CSE', year: 3, semester: 5, section: 'A' },
      { day: 'Tuesday', time: '09:00 AM', subject: 'Web Technologies', facultyName: 'Prof. Sarah Lin', room: 'Room 301', department: 'CSE', year: 3, semester: 5, section: 'A' },
      { day: 'Wednesday', time: '02:00 PM', subject: 'Database Systems', facultyName: 'Faculty User', room: 'Room 201', department: 'CSE', year: 3, semester: 5, section: 'A' }
    ]);

    // 4. Seed Assignments
    console.log("Seeding Assignments...");
    await Assignment.create([
      {
        title: 'Binary Tree Implementation',
        description: 'Implement a binary search tree in C++ or Java and include insertion, deletion, and traversals.',
        subject: 'Data Structures',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        department: 'CSE',
        year: 3,
        semester: 5,
        section: 'A',
        faculty: facultyUser._id,
        submissions: []
      },
      {
        title: 'ER Diagram Design',
        description: 'Draw an ER diagram for a library management database and map it to relation schemas.',
        subject: 'Database Systems',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        department: 'CSE',
        year: 3,
        semester: 5,
        section: 'A',
        faculty: facultyUser._id,
        submissions: [
          {
            student: studentUser._id,
            submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            fileUrl: 'https://example.com/submissions/er-diagram.pdf',
            score: 90,
            graded: true
          }
        ]
      }
    ]);

    // 5. Seed Study Materials
    console.log("Seeding Study Materials...");
    await StudyMaterial.create([
      {
        title: 'Data Structures Notes - Chapter 1 & 2',
        subject: 'Data Structures',
        type: 'PDF',
        fileUrl: 'https://example.com/materials/ds-chap1-2.pdf',
        department: 'CSE',
        year: 3,
        semester: 5,
        faculty: facultyUser._id,
        downloads: 12
      },
      {
        title: 'Introduction to SQL Video Lecture',
        subject: 'Database Systems',
        type: 'Video',
        fileUrl: 'https://youtube.com/watch?v=intro-sql',
        department: 'CSE',
        year: 3,
        semester: 5,
        faculty: facultyUser._id,
        downloads: 45
      }
    ]);

    // 6. Seed Results/Marks
    console.log("Seeding Academic Results...");
    await Result.create([
      { student: studentUser._id, subject: 'Data Structures', credits: 4, marks: 88, grade: 'A', semester: 'Sem 5' },
      { student: studentUser._id, subject: 'Algorithms', credits: 4, marks: 92, grade: 'A+', semester: 'Sem 5' },
      { student: studentUser._id, subject: 'Database Systems', credits: 3, marks: 78, grade: 'B+', semester: 'Sem 5' }
    ]);

    // 7. Seed Leave Requests
    console.log("Seeding Leave Requests...");
    await LeaveRequest.create([
      {
        user: studentUser._id,
        type: 'Sick Leave',
        from: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        to: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        days: 2,
        reason: 'Down with a high fever',
        status: 'Approved',
        approvedBy: facultyUser._id
      }
    ]);

    // 8. Seed Complaints
    console.log("Seeding Complaints...");
    await Complaint.create([
      {
        user: studentUser._id,
        category: 'Infrastructure',
        subject: 'Lab 2 AC not working',
        description: 'The air conditioner in computer science Lab 2 is not working during class hours, causing severe heating issues.',
        status: 'Pending'
      }
    ]);

    // 9. Seed Placements
    console.log("Seeding Placements...");
    await Placement.create([
      {
        company: 'Microsoft',
        position: 'Full Stack Developer',
        appliedStudents: [
          {
            student: studentUser._id,
            status: 'Shortlisted',
            appliedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        company: 'Google',
        position: 'Software Engineer',
        appliedStudents: []
      }
    ]);

    // 10. Seed Fees
    console.log("Seeding Fees...");
    await Fee.create([
      {
        student: studentProfile._id,
        academicYear: '2025-2026',
        semester: 5,
        feeType: 'tuition',
        totalAmount: 2500,
        paidAmount: 2500,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        student: studentProfile._id,
        academicYear: '2025-2026',
        semester: 5,
        feeType: 'hostel',
        totalAmount: 800,
        paidAmount: 0,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ]);

    // 11. Seed Attendance records
    console.log("Seeding Attendance records...");
    await Attendance.create([
      { student: studentProfile._id, faculty: facultyUser._id, subject: 'Data Structures', department: 'CSE', semester: 5, section: 'A', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), status: 'present' },
      { student: studentProfile._id, faculty: facultyUser._id, subject: 'Database Systems', department: 'CSE', semester: 5, section: 'A', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: 'present' },
      { student: studentProfile._id, faculty: facultyUser._id, subject: 'Algorithms', department: 'CSE', semester: 5, section: 'A', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), status: 'absent' }
    ]);

    console.log("\n✅ All dynamic parent, student, and faculty modules seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDynamicData();
