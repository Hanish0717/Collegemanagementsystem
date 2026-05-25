import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Fee from '../models/Fee.js';

dotenv.config();

const AUTH_URL = 'http://localhost:5000/api/auth';
const STUDENT_URL = 'http://localhost:5000/api/students';
const FEES_URL = 'http://localhost:5000/api/fees';

const results = [];
function recordResult(testName, status, details) {
  results.push({ testName, status, details });
  console.log(`${status === 'PASS' ? '✅' : '❌'} ${testName}: ${details}`);
}

async function runSuite() {
  console.log('=== STARTING FEES MANAGEMENT TEST SUITE ===\n');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for direct state verification.\n');
  } catch (error) {
    console.error('Failed to connect to database in test script:', error);
    process.exit(1);
  }

  const timestamp = Date.now();
  const adminEmail = `admin_${timestamp}@test.com`;
  const studentUserEmail = `student_${timestamp}@test.com`;
  const otherStudentUserEmail = `other_student_${timestamp}@test.com`;
  const password = 'Password123!';

  let adminToken = '';
  let studentToken = '';
  let otherStudentToken = '';
  let testStudentId = '';
  let otherStudentId = '';

  // Setup: Register tokens & create students
  try {
    // Admin Token
    let res = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Admin User', email: adminEmail, password, role: 'admin' })
    });
    let data = await res.json();
    adminToken = data.token;

    // Student User Token
    res = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Test Student User', email: studentUserEmail, password, role: 'student' })
    });
    data = await res.json();
    studentToken = data.token;

    // Other Student User Token
    res = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Other Student User', email: otherStudentUserEmail, password, role: 'student' })
    });
    data = await res.json();
    otherStudentToken = data.token;

    // Create main test Student record using Admin Token
    res = await fetch(STUDENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        fullName: 'Test Student',
        rollNumber: `ROLL${timestamp}`,
        email: studentUserEmail,
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

    // Create other test Student record using Admin Token
    res = await fetch(STUDENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        fullName: 'Other Student',
        rollNumber: `OTHER${timestamp}`,
        email: otherStudentUserEmail,
        phoneNumber: '7777777777',
        gender: 'Female',
        department: 'ECE',
        year: 2,
        semester: 4,
        section: 'B',
        parentName: 'Other Parent',
        parentPhone: '7776665555'
      })
    });
    data = await res.json();
    otherStudentId = data.data._id;

    console.log(`Setup Complete: Main Student ID: ${testStudentId}, Other Student ID: ${otherStudentId}\n`);
  } catch (err) {
    console.error('Setup failed:', err);
    await mongoose.disconnect();
    process.exit(1);
  }

  // ----------------------------------------------------
  // SECURITY & ACCESS PROTECTION TESTS
  // ----------------------------------------------------
  console.log('--- RUNNING SECURITY & ACCESS PROTECTION TESTS ---');

  // Test 1: Create fee without admin role (Student Token)
  try {
    const res = await fetch(FEES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({ student: testStudentId, academicYear: '2025-2026', semester: 6, feeType: 'tuition', totalAmount: 1000, dueDate: '2026-06-01' })
    });
    const data = await res.json();
    if (res.status === 403 && data.success === false) {
      recordResult('Unauthorized Fee Creation Check', 'PASS', 'Correctly rejected request with status 403.');
    } else {
      recordResult('Unauthorized Fee Creation Check', 'FAIL', `Expected status 403. Got status ${res.status}`);
    }
  } catch (err) {
    recordResult('Unauthorized Fee Creation Check', 'FAIL', err.message);
  }

  // Test 2: View own fees (Student accessing their own studentId)
  try {
    const res = await fetch(`${FEES_URL}/student/${testStudentId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.success === true) {
      recordResult('Self Fee Retrieval Access', 'PASS', 'Correctly allowed student to view their own fee profile.');
    } else {
      recordResult('Self Fee Retrieval Access', 'FAIL', `Expected status 200. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Self Fee Retrieval Access', 'FAIL', err.message);
  }

  // Test 3: View other student's fees (Student accessing another studentId - Forbidden)
  try {
    const res = await fetch(`${FEES_URL}/student/${otherStudentId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const data = await res.json();
    if (res.status === 403 && data.success === false) {
      recordResult('Cross-Student Fee Access Guard', 'PASS', 'Correctly rejected cross-profile retrieval with status 403.');
    } else {
      recordResult('Cross-Student Fee Access Guard', 'FAIL', `Expected status 403. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Cross-Student Fee Access Guard', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // CREATE FEE & OVERDUE DETECTION TESTS
  // ----------------------------------------------------
  console.log('\n--- RUNNING CREATE FEE & OVERDUE TESTS ---');

  let tuitionFeeId = '';
  let libraryFeeId = '';

  // Test 4: Create a Tuition Fee (Valid pending status)
  try {
    const res = await fetch(FEES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        student: testStudentId,
        academicYear: '2025-2026',
        semester: 6,
        feeType: 'tuition',
        totalAmount: 1000,
        dueDate: '2026-12-31' // Future date
      })
    });
    const data = await res.json();
    if (res.status === 201 && data.success === true && data.data.paymentStatus === 'pending') {
      tuitionFeeId = data.data._id;
      recordResult('Create Tuition Fee (Pending)', 'PASS', `Status 201. Tuition fee created. ID: ${tuitionFeeId}, Status: ${data.data.paymentStatus}`);
    } else {
      recordResult('Create Tuition Fee (Pending)', 'FAIL', `Expected status 201 and pending. Got: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Create Tuition Fee (Pending)', 'FAIL', err.message);
  }

  // Test 5: Create a Library Fee with past due date (Overdue Detection)
  try {
    // 5 days ago
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);

    const res = await fetch(FEES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        student: testStudentId,
        academicYear: '2025-2026',
        semester: 6,
        feeType: 'library',
        totalAmount: 200,
        dueDate: pastDate.toISOString() // Past date
      })
    });
    const data = await res.json();

    // Query student fees to trigger updateOverdueFees()
    const retrievalRes = await fetch(`${FEES_URL}/student/${testStudentId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const retrievalData = await retrievalRes.json();
    const libRecord = retrievalData.data.fees.find(f => f.feeType === 'library');

    if (libRecord && libRecord.paymentStatus === 'overdue') {
      libraryFeeId = libRecord._id;
      recordResult('Overdue Fee Automatic Detection', 'PASS', `Verified fee created in past shows status 'overdue' on retrieval.`);
    } else {
      recordResult('Overdue Fee Automatic Detection', 'FAIL', `Expected overdue status. Got: ${JSON.stringify(libRecord)}`);
    }
  } catch (err) {
    recordResult('Overdue Fee Automatic Detection', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // PAYMENT PROCESSING TESTS
  // ----------------------------------------------------
  console.log('\n--- RUNNING PAYMENT PROCESSING TESTS ---');

  // Test 6: Partial payment of $400 on Tuition Fee ($1000)
  try {
    const res = await fetch(`${FEES_URL}/pay/${tuitionFeeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        amount: 400,
        paymentMethod: 'upi',
        transactionId: 'TXN12345'
      })
    });
    const data = await res.json();
    if (res.status === 200 && data.data.paymentStatus === 'partial' && data.data.remainingAmount === 600) {
      recordResult('Process Partial Payment', 'PASS', `Status 200. Paid: $400, Remaining: $${data.data.remainingAmount}, Status: ${data.data.paymentStatus}`);
    } else {
      recordResult('Process Partial Payment', 'FAIL', `Expected partial status and $600 remaining. Got: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Process Partial Payment', 'FAIL', err.message);
  }

  // Test 7: Excess payment check (Pay $700 on Tuition Fee - Remaining is $600) -> should fail
  try {
    const res = await fetch(`${FEES_URL}/pay/${tuitionFeeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        amount: 700,
        paymentMethod: 'upi'
      })
    });
    const data = await res.json();
    if (res.status === 400 && data.success === false) {
      recordResult('Block Excess Payment Amount', 'PASS', `Status 400. Correctly blocked: "${data.message}"`);
    } else {
      recordResult('Block Excess Payment Amount', 'FAIL', `Expected status 400. Got: ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Block Excess Payment Amount', 'FAIL', err.message);
  }

  // Test 8: Full payment of remaining $600
  try {
    const res = await fetch(`${FEES_URL}/pay/${tuitionFeeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        amount: 600,
        paymentMethod: 'bank-transfer'
      })
    });
    const data = await res.json();
    if (res.status === 200 && data.data.paymentStatus === 'paid' && data.data.remainingAmount === 0) {
      recordResult('Process Full Payment', 'PASS', `Status 200. Total Paid: $${data.data.paidAmount}, Remaining: $${data.data.remainingAmount}, Status: ${data.data.paymentStatus}`);
    } else {
      recordResult('Process Full Payment', 'FAIL', `Expected paid status and $0 remaining. Got: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Process Full Payment', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // ANALYTICS & REPORTS TESTS
  // ----------------------------------------------------
  console.log('\n--- RUNNING REVENUE ANALYTICS & REPORT TESTS ---');

  // Test 9: Generate Report
  try {
    const res = await fetch(`${FEES_URL}/report?academicYear=2025-2026`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (
      res.status === 200 &&
      data.data.totals.totalRevenue === 1200 &&
      data.data.totals.collectedFees === 1000 &&
      data.data.totals.pendingFees === 200 &&
      data.data.totals.overdueFees === 200
    ) {
      recordResult('GET Financial Analytics Report', 'PASS', `Totals match. Revenue: $1200, Collected: $1000, Pending/Overdue: $200.`);
    } else {
      recordResult('GET Financial Analytics Report', 'FAIL', `Report totals mismatch: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('GET Financial Analytics Report', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // DATABASE CLEANUP
  // ----------------------------------------------------
  console.log('\nCleaning up database test entries...');
  try {
    const testEmailPattern = new RegExp(`_${timestamp}@test.com$`);
    await User.deleteMany({ email: { $in: [adminEmail, studentUserEmail, otherStudentUserEmail] } });
    await Student.deleteMany({ email: { $regex: testEmailPattern } });
    await Fee.deleteMany({ student: { $in: [testStudentId, otherStudentId] } });
    console.log('Database cleaned up successfully.');
  } catch (err) {
    console.error('Cleanup failed:', err);
  }

  await mongoose.disconnect();
  console.log('\n=== TEST SUITE COMPLETED ===');
}

runSuite();
