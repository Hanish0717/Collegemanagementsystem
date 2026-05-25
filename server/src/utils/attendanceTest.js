import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';

dotenv.config();

const AUTH_URL = 'http://localhost:5000/api/auth';
const STUDENT_URL = 'http://localhost:5000/api/students';
const ATTENDANCE_URL = 'http://localhost:5000/api/attendance';

const results = [];
function recordResult(testName, status, details) {
  results.push({ testName, status, details });
  console.log(`${status === 'PASS' ? '✅' : '❌'} ${testName}: ${details}`);
}

async function runSuite() {
  console.log('=== STARTING ATTENDANCE MANAGEMENT TEST SUITE ===\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for direct verification.\n');
  } catch (error) {
    console.error('Failed to connect to database in test script:', error);
    process.exit(1);
  }

  const timestamp = Date.now();
  const adminEmail = `admin_${timestamp}@test.com`;
  const facultyEmail = `faculty_${timestamp}@test.com`;
  const studentUserEmail = `stud_user_${timestamp}@test.com`;
  const password = 'Password123!';

  let adminToken = '';
  let facultyToken = '';
  let studentUserToken = '';
  let testStudentId = '';

  // Setup: Register tokens & create a student
  try {
    // Admin Token
    let res = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Admin User', email: adminEmail, password, role: 'admin' })
    });
    let data = await res.json();
    adminToken = data.token;

    // Faculty Token
    res = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Faculty User', email: facultyEmail, password, role: 'faculty' })
    });
    data = await res.json();
    facultyToken = data.token;

    // Student User Token
    res = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Student User', email: studentUserEmail, password, role: 'student' })
    });
    data = await res.json();
    studentUserToken = data.token;

    // Create a student record using Admin Token
    res = await fetch(STUDENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        fullName: 'Test Student',
        rollNumber: `ROLL${timestamp}`,
        email: `student_${timestamp}@test.com`,
        phoneNumber: '9999999999',
        gender: 'Male',
        department: 'CSE',
        year: 3,
        semester: 6,
        section: 'A',
        parentName: 'Parent Name',
        parentPhone: '8888888888'
      })
    });
    data = await res.json();
    testStudentId = data.data._id;

    console.log(`Setup Complete: Test Student ID: ${testStudentId}\n`);
  } catch (err) {
    console.error('Setup failed:', err);
    await mongoose.disconnect();
    process.exit(1);
  }

  // ----------------------------------------------------
  // SECURITY & ROLE PROTECTION TESTS
  // ----------------------------------------------------
  console.log('--- RUNNING SECURITY & ACCESS PROTECTION TESTS ---');

  // Test 1: Mark attendance without token
  try {
    const res = await fetch(`${ATTENDANCE_URL}/mark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student: testStudentId, subject: 'Math', date: '2026-05-01', status: 'present', department: 'CSE', semester: 6, section: 'A' })
    });
    const data = await res.json();
    if (res.status === 401 && data.success === false) {
      recordResult('Unauthorized Mark Rejection', 'PASS', 'Correctly rejected request with status 401.');
    } else {
      recordResult('Unauthorized Mark Rejection', 'FAIL', `Expected status 401. Got status ${res.status}`);
    }
  } catch (err) {
    recordResult('Unauthorized Mark Rejection', 'FAIL', err.message);
  }

  // Test 2: Mark attendance with Student Token (unauthorized role)
  try {
    const res = await fetch(`${ATTENDANCE_URL}/mark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentUserToken}`
      },
      body: JSON.stringify({ student: testStudentId, subject: 'Math', date: '2026-05-01', status: 'present', department: 'CSE', semester: 6, section: 'A' })
    });
    const data = await res.json();
    if (res.status === 403 && data.success === false) {
      recordResult('Forbidden Mark Rejection (Student Role)', 'PASS', 'Correctly rejected request with status 403.');
    } else {
      recordResult('Forbidden Mark Rejection (Student Role)', 'FAIL', `Expected status 403. Got status ${res.status}`);
    }
  } catch (err) {
    recordResult('Forbidden Mark Rejection (Student Role)', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // MARK ATTENDANCE & DUPLICATE PREVENTION TESTS
  // ----------------------------------------------------
  console.log('\n--- RUNNING MARK ATTENDANCE TESTS ---');

  let record1Id = '';

  // Test 3: Mark valid attendance (Present)
  try {
    const res = await fetch(`${ATTENDANCE_URL}/mark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${facultyToken}`
      },
      body: JSON.stringify({
        student: testStudentId,
        subject: 'Math',
        date: '2026-05-01',
        status: 'present',
        department: 'CSE',
        semester: 6,
        section: 'A'
      })
    });
    const data = await res.json();
    if (res.status === 201 && data.success === true && data.data) {
      record1Id = data.data._id;
      recordResult('Mark Attendance (Valid)', 'PASS', `Status 201. Record created. ID: ${record1Id}`);
    } else {
      recordResult('Mark Attendance (Valid)', 'FAIL', `Expected status 201. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Mark Attendance (Valid)', 'FAIL', err.message);
  }

  // Test 4: Mark duplicate attendance (Should fail)
  try {
    const res = await fetch(`${ATTENDANCE_URL}/mark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${facultyToken}`
      },
      body: JSON.stringify({
        student: testStudentId,
        subject: 'Math',
        date: '2026-05-01',
        status: 'absent',
        department: 'CSE',
        semester: 6,
        section: 'A'
      })
    });
    const data = await res.json();
    if (res.status === 400 && data.success === false) {
      recordResult('Duplicate Attendance Prevention', 'PASS', `Status 400. Rejection message: "${data.message}"`);
    } else {
      recordResult('Duplicate Attendance Prevention', 'FAIL', `Expected status 400. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Duplicate Attendance Prevention', 'FAIL', err.message);
  }

  // Mark 3 more records (all absent) to make attendance 1/4 = 25%
  try {
    const dates = ['2026-05-02', '2026-05-03', '2026-05-04'];
    for (const dt of dates) {
      await fetch(`${ATTENDANCE_URL}/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${facultyToken}` },
        body: JSON.stringify({ student: testStudentId, subject: 'Math', date: dt, status: 'absent', department: 'CSE', semester: 6, section: 'A' })
      });
    }
    console.log('Added 3 additional absent records. Total records for student = 4 (1 present, 3 absent).\n');
  } catch (err) {
    console.error('Marking supplementary records failed:', err);
  }

  // ----------------------------------------------------
  // CALCULATIONS & STATS & WARNING TESTS
  // ----------------------------------------------------
  console.log('--- RUNNING CALCULATIONS & WARNING TESTS ---');

  // Test 5: Verify Student Model auto-updated to 25% overall attendance
  try {
    const res = await fetch(`${STUDENT_URL}/${testStudentId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.data.attendancePercentage === 25) {
      recordResult('Student Model Percentage Auto-Update', 'PASS', 'Verified student attendancePercentage in DB updated to 25%.');
    } else {
      recordResult('Student Model Percentage Auto-Update', 'FAIL', `Expected 25. Got: ${data.data?.attendancePercentage}`);
    }
  } catch (err) {
    recordResult('Student Model Percentage Auto-Update', 'FAIL', err.message);
  }

  // Test 6: Verify student stats API & Low attendance warning trigger
  try {
    const res = await fetch(`${ATTENDANCE_URL}/student/${testStudentId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${facultyToken}` }
    });
    const data = await res.json();
    if (
      res.status === 200 &&
      data.data.overallPercentage === 25 &&
      data.lowAttendance === true &&
      data.warning.includes('below 75%')
    ) {
      recordResult('Get Student Stats & Low Attendance Flag', 'PASS', 'Verified overallPercentage = 25% and warning triggered correctly.');
    } else {
      recordResult('Get Student Stats & Low Attendance Flag', 'FAIL', `Unexpected stats output: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Get Student Stats & Low Attendance Flag', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // UPDATE / DELETE / RECALCULATION TESTS
  // ----------------------------------------------------
  console.log('\n--- RUNNING UPDATE & RECALCULATION TESTS ---');

  // Test 7: Update one absent record to present (2/4 present = 50%)
  let absentRecord = null;
  try {
    absentRecord = await Attendance.findOne({ student: testStudentId, status: 'absent' });
    const res = await fetch(`${ATTENDANCE_URL}/${absentRecord._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${facultyToken}`
      },
      body: JSON.stringify({ status: 'present' })
    });
    const data = await res.json();

    // Fetch student profile to verify recalculation
    const studentRes = await fetch(`${STUDENT_URL}/${testStudentId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const studentData = await studentRes.json();

    if (res.status === 200 && studentData.data.attendancePercentage === 50) {
      recordResult('Update Record & Recalculate Percentage', 'PASS', 'Status 200. Changed absent to present. Student percentage updated to 50%.');
    } else {
      recordResult('Update Record & Recalculate Percentage', 'FAIL', `Expected updated percentage 50. Got: ${studentData.data?.attendancePercentage}`);
    }
  } catch (err) {
    recordResult('Update Record & Recalculate Percentage', 'FAIL', err.message);
  }

  // Test 8: Delete one record (now 2 present out of 3 total records = 66.7%)
  try {
    const recordToDelete = await Attendance.findOne({ student: testStudentId, status: 'absent' });
    const res = await fetch(`${ATTENDANCE_URL}/${recordToDelete._id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${facultyToken}` }
    });

    const studentRes = await fetch(`${STUDENT_URL}/${testStudentId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const studentData = await studentRes.json();

    if (res.status === 200 && studentData.data.attendancePercentage === 66.7) {
      recordResult('Delete Record & Recalculate Percentage', 'PASS', 'Status 200. Deleted record. Student percentage updated to 66.7%.');
    } else {
      recordResult('Delete Record & Recalculate Percentage', 'FAIL', `Expected updated percentage 66.7. Got: ${studentData.data?.attendancePercentage}`);
    }
  } catch (err) {
    recordResult('Delete Record & Recalculate Percentage', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // CLASS STATS & REPORT TESTS
  // ----------------------------------------------------
  console.log('\n--- RUNNING CLASS STATS & REPORT TESTS ---');

  // Test 9: Get class attendance
  try {
    const res = await fetch(`${ATTENDANCE_URL}/class?department=CSE&semester=6&section=A`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${facultyToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.data.length > 0 && data.data[0].student.fullName === 'Test Student') {
      recordResult('GET Class Attendance', 'PASS', `Retrieved successfully. Populated student name: "${data.data[0].student.fullName}"`);
    } else {
      recordResult('GET Class Attendance', 'FAIL', `Expected class records. Got: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('GET Class Attendance', 'FAIL', err.message);
  }

  // Test 10: Generate report (Admin only)
  try {
    const res = await fetch(`${ATTENDANCE_URL}/report?department=CSE&semester=6&section=A`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    const containsStudent = data.data.lowAttendanceStudents.some(s => s._id === testStudentId);
    if (res.status === 200 && data.data.overallPercentage === 66.7 && containsStudent) {
      recordResult('GET Attendance Report & Low Attendance List', 'PASS', 'Report generated. Student correctly flagged on low attendance list.');
    } else {
      recordResult('GET Attendance Report & Low Attendance List', 'FAIL', `Expected overallPercentage = 66.7 & testStudent listed. Got: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('GET Attendance Report & Low Attendance List', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // DATABASE CLEANUP
  // ----------------------------------------------------
  console.log('\nCleaning up database test entries...');
  try {
    const testEmailPattern = new RegExp(`_${timestamp}@test.com$`);
    await User.deleteMany({ email: { $in: [adminEmail, facultyEmail, studentUserEmail] } });
    await Student.deleteMany({ email: { $regex: testEmailPattern } });
    await Attendance.deleteMany({ student: testStudentId });
    console.log('Database cleaned up successfully.');
  } catch (err) {
    console.error('Cleanup failed:', err);
  }

  await mongoose.disconnect();
  console.log('\n=== TEST SUITE COMPLETED ===');
}

runSuite();
