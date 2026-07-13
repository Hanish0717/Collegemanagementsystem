import dotenv from 'dotenv';
import crypto from 'crypto';
import { supabase } from '../config/supabase.js';

dotenv.config();

const AUTH_URL = 'http://localhost:5000/api/auth';
const STUDENT_URL = 'http://localhost:5000/api/students';

async function loginAndGetToken(email, password) {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(data)}`);
  }
  return data.token;
}

const results = [];
function recordResult(testName, status, details) {
  results.push({ testName, status, details });
  console.log(`${status === 'PASS' ? '✅' : '❌'} ${testName}: ${details}`);
}

async function runSuite() {
  console.log('=== STARTING STUDENT MANAGEMENT TEST SUITE ===\n');

  console.log('Using Supabase client for direct database verification.\n');

  const timestamp = Date.now();
  const adminEmail = `admin_${timestamp}@test.com`;
  const password = 'Password123!';

  let adminToken = '';
  let studentUserToken = '';

  // Setup 1: Register an admin and a student user for auth headers
  try {
    // Register unique admin
    const regRes = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: 'Admin User', email: adminEmail, password, role: 'admin', phoneNumber: '1234567890' })
    });
    
    if (regRes.status !== 201) {
      const regData = await regRes.json();
      throw new Error(`Admin registration failed: ${JSON.stringify(regData)}`);
    }

    // Login admin
    adminToken = await loginAndGetToken(adminEmail, password);

    // Login pre-seeded student
    studentUserToken = await loginAndGetToken('student@college.com', 'password123');

    console.log('Setup: Registered test admin and student user tokens successfully.\n');
  } catch (err) {
    console.error('Setup failed:', err);
    process.exit(1);
  }

  // ----------------------------------------------------
  // SECURITY & ACCESS PROTECTION TESTS
  // ----------------------------------------------------
  console.log('--- RUNNING SECURITY & ACCESS PROTECTION TESTS ---');

  // Test 1: Request without token
  try {
    const res = await fetch(STUDENT_URL, { method: 'GET' });
    const data = await res.json();
    if (res.status === 401 && data.success === false) {
      recordResult('Missing Token Access Control', 'PASS', 'Correctly rejected request with status 401.');
    } else {
      recordResult('Missing Token Access Control', 'FAIL', `Expected status 401. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Missing Token Access Control', 'FAIL', err.message);
  }

  // Test 2: Request with non-admin role (student user)
  try {
    const res = await fetch(STUDENT_URL, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${studentUserToken}` }
    });
    const data = await res.json();
    if (res.status === 403 && data.success === false) {
      recordResult('Role-based Access Control (student role blocked)', 'PASS', 'Correctly rejected request with status 403.');
    } else {
      recordResult('Role-based Access Control (student role blocked)', 'FAIL', `Expected status 403. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Role-based Access Control (student role blocked)', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // CREATE STUDENT TESTS
  // ----------------------------------------------------
  console.log('\n--- RUNNING CREATE STUDENT TESTS ---');

  const studentA = {
    fullName: 'Alice Smith',
    rollNumber: `CSE${timestamp}A`,
    email: `alice_${timestamp}@test.com`,
    phoneNumber: '1112223333',
    gender: 'Female',
    dateOfBirth: '2005-04-12',
    department: 'CSE',
    year: 2,
    semester: 4,
    section: 'A',
    parentName: 'Bob Smith',
    parentPhone: '9998887777',
    parentEmail: `bob_smith_${timestamp}@test.com`,
    password: 'Password123!',
    cgpa: 9.2,
    attendancePercentage: 95
  };

  const studentB = {
    fullName: 'David Jones',
    rollNumber: `ECE${timestamp}B`,
    email: `david_${timestamp}@test.com`,
    phoneNumber: '4445556666',
    gender: 'Male',
    dateOfBirth: '2004-11-20',
    department: 'ECE',
    year: 3,
    semester: 6,
    section: 'B',
    parentName: 'Sara Jones',
    parentPhone: '8887776666',
    parentEmail: `sara_jones_${timestamp}@test.com`,
    password: 'Password123!',
    cgpa: 8.5,
    attendancePercentage: 88
  };

  const studentC = {
    fullName: 'Charlie Green',
    rollNumber: `CSE${timestamp}C`,
    email: `charlie_${timestamp}@test.com`,
    phoneNumber: '7778889999',
    gender: 'Other',
    dateOfBirth: '2006-01-05',
    department: 'CSE',
    year: 1,
    semester: 2,
    section: 'A',
    parentName: 'Mary Green',
    parentPhone: '7776665555',
    parentEmail: `mary_green_${timestamp}@test.com`,
    password: 'Password123!',
    cgpa: 7.8,
    attendancePercentage: 92
  };

  let studentAId = '';

  // Test 3: Create Student A (Valid)
  try {
    const res = await fetch(STUDENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(studentA)
    });
    const data = await res.json();
    if (res.status === 201 && data.success === true && data.data) {
      studentAId = data.data._id;
      recordResult('Create Student (Valid)', 'PASS', `Status 201. Student created successfully. ID: ${studentAId}`);
    } else {
      recordResult('Create Student (Valid)', 'FAIL', `Expected status 201. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Create Student (Valid)', 'FAIL', err.message);
  }

  // Create Student B & C for pagination/filtering tests
  try {
    await fetch(STUDENT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify(studentB)
    });
    await fetch(STUDENT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify(studentC)
    });
  } catch (err) {
    console.error('Setup of students B & C failed:', err);
  }

  // Test 4: Duplicate rollNumber validation
  try {
    const res = await fetch(STUDENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        ...studentC,
        email: `charlie_new_${timestamp}@test.com` // Change email to only test rollNumber
      })
    });
    const data = await res.json();
    if (res.status === 400 && data.success === false) {
      recordResult('Duplicate Roll Number Prevention', 'PASS', `Status 400. Rejection message: "${data.message}"`);
    } else {
      recordResult('Duplicate Roll Number Prevention', 'FAIL', `Expected status 400. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Duplicate Roll Number Prevention', 'FAIL', err.message);
  }

  // Test 5: Duplicate email validation
  try {
    const res = await fetch(STUDENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        ...studentC,
        rollNumber: `CSE${timestamp}NEW` // Change rollNumber to only test email
      })
    });
    const data = await res.json();
    if (res.status === 400 && data.success === false) {
      recordResult('Duplicate Email Prevention', 'PASS', `Status 400. Rejection message: "${data.message}"`);
    } else {
      recordResult('Duplicate Email Prevention (Student)', 'FAIL', `Expected status 400. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Duplicate Email Prevention (Student)', 'FAIL', err.message);
  }

  // Test 6: Missing required field validation
  try {
    const res = await fetch(STUDENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        fullName: 'Missing Fields Person',
        rollNumber: `MISS${timestamp}`
        // Missing email, department, parent, etc.
      })
    });
    const data = await res.json();
    if (res.status === 400 && data.success === false) {
      recordResult('Missing Required Fields Validation', 'PASS', `Status 400. Rejection message: "${data.message}"`);
    } else {
      recordResult('Missing Required Fields Validation', 'FAIL', `Expected status 400. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Missing Required Fields Validation', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // GET ALL & FILTERING & PAGINATION TESTS
  // ----------------------------------------------------
  console.log('\n--- RUNNING GET ALL & FILTERING & PAGINATION TESTS ---');

  // Test 7: GET all students (no filters)
  try {
    const res = await fetch(STUDENT_URL, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.success === true && data.data.students.length >= 3) {
      recordResult('GET All Students (Default)', 'PASS', `Status 200. Retrieved ${data.data.students.length} students. totalStudents count: ${data.data.pagination.totalStudents}`);
    } else {
      recordResult('GET All Students (Default)', 'FAIL', `Expected 200. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('GET All Students (Default)', 'FAIL', err.message);
  }

  // Test 8: Search by name (search="Alice")
  try {
    const res = await fetch(`${STUDENT_URL}?search=Alice`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    const matchesAllAlice = data.data.students.every(s => s.fullName.includes('Alice'));
    if (res.status === 200 && data.data.students.length >= 1 && matchesAllAlice) {
      recordResult('Search Students (Name)', 'PASS', `Status 200. Found ${data.data.students.length} matching students.`);
    } else {
      recordResult('Search Students (Name)', 'FAIL', `Expected matching search results. Got: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Search Students (Name)', 'FAIL', err.message);
  }

  // Test 9: Filter by department (department=CSE)
  try {
    const res = await fetch(`${STUDENT_URL}?department=CSE`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    const cseStudents = data.data.students.filter(s => s.email.endsWith('@test.com')); // filter only our test students
    const allCse = cseStudents.every(s => s.department === 'CSE');
    if (res.status === 200 && cseStudents.length === 2 && allCse) {
      recordResult('Filter Students (Department)', 'PASS', 'Status 200. Correctly retrieved E2E filtered department records.');
    } else {
      recordResult('Filter Students (Department)', 'FAIL', `Expected 2 CSE test students. Got: ${JSON.stringify(data.data.students)}`);
    }
  } catch (err) {
    recordResult('Filter Students (Department)', 'FAIL', err.message);
  }

  // Test 10: Pagination (limit=2, page=1)
  try {
    const res = await fetch(`${STUDENT_URL}?limit=2&page=1`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (
      res.status === 200 &&
      data.data.students.length === 2 &&
      data.data.pagination.currentPage === 1 &&
      data.data.pagination.limit === 2
    ) {
      recordResult('Pagination Logic (limit=2)', 'PASS', 'Status 200. Paginated output structure verified.');
    } else {
      recordResult('Pagination Logic (limit=2)', 'FAIL', `Pagination response values mismatch: ${JSON.stringify(data.data.pagination)}`);
    }
  } catch (err) {
    recordResult('Pagination Logic (limit=2)', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // GET SINGLE & UPDATE TESTS
  // ----------------------------------------------------
  console.log('\n--- RUNNING GET SINGLE & UPDATE TESTS ---');

  // Test 11: GET Student by valid ID
  try {
    const res = await fetch(`${STUDENT_URL}/${studentAId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.success === true && data.data.fullName === 'Alice Smith') {
      recordResult('GET Student By ID (Valid)', 'PASS', 'Retrieved correct student record.');
    } else {
      recordResult('GET Student By ID (Valid)', 'FAIL', `Expected status 200 with Alice. Got: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('GET Student By ID (Valid)', 'FAIL', err.message);
  }

  // Test 12: GET Student by invalid cast ID
  try {
    const res = await fetch(`${STUDENT_URL}/invalidmongooseid123`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status === 400 && data.success === false) {
      recordResult('GET Student By ID (Invalid Format Check)', 'PASS', `Status 400. Error message: "${data.message}"`);
    } else {
      recordResult('GET Student By ID (Invalid Format Check)', 'FAIL', `Expected status 400. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('GET Student By ID (Invalid Format Check)', 'FAIL', err.message);
  }

  // Test 13: GET Student by non-existing ID
  try {
    const fakeId = '99999999-9999-9999-9999-999999999999';
    const res = await fetch(`${STUDENT_URL}/${fakeId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status === 404 && data.success === false) {
      recordResult('GET Student By ID (Non-existent Check)', 'PASS', `Status 404. Error message: "${data.message}"`);
    } else {
      recordResult('GET Student By ID (Non-existent Check)', 'FAIL', `Expected status 404. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('GET Student By ID (Non-existent Check)', 'FAIL', err.message);
  }

  // Test 14: UPDATE Student (Valid CGPA & phone update)
  try {
    const res = await fetch(`${STUDENT_URL}/${studentAId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ cgpa: 9.8, phoneNumber: '5556667777' })
    });
    const data = await res.json();
    if (res.status === 200 && data.success === true && data.data.cgpa === 9.8 && data.data.phoneNumber === '5556667777') {
      recordResult('UPDATE Student (Valid Fields)', 'PASS', 'Status 200. Fields updated and returned correctly.');
    } else {
      recordResult('UPDATE Student (Valid Fields)', 'FAIL', `Expected status 200. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('UPDATE Student (Valid Fields)', 'FAIL', err.message);
  }

  // Test 15: UPDATE Student to duplicate rollNumber (should fail)
  try {
    // Attempt to set Student A's roll number to Student B's roll number
    const listRes = await fetch(STUDENT_URL, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const listData = await listRes.json();
    const studentsList = listData.data?.students || [];
    const studentBRecord = studentsList.find(s => s.email === `david_${timestamp}@test.com`);
    const res = await fetch(`${STUDENT_URL}/${studentAId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ rollNumber: studentBRecord ? (studentBRecord.rollNumber || studentBRecord.roll_number) : 'ECE_DUP' })
    });
    const data = await res.json();
    if (res.status === 400 && data.success === false) {
      recordResult('UPDATE Student Duplicate Roll Number Block', 'PASS', `Status 400. Correctly blocked: "${data.message}"`);
    } else {
      recordResult('UPDATE Student Duplicate Roll Number Block', 'FAIL', `Expected status 400. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('UPDATE Student Duplicate Roll Number Block', 'FAIL', err.message);
  }

  // ----------------------------------------------------
  // SOFT DELETE TESTS
  // ----------------------------------------------------
  console.log('\n--- RUNNING SOFT DELETE TESTS ---');

  // Test 16: DELETE Student (Soft Delete)
  try {
    const res = await fetch(`${STUDENT_URL}/${studentAId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status === 200 && data.success === true && data.data.isActive === false) {
      recordResult('DELETE Student (Soft Delete)', 'PASS', 'Status 200. Record flag isActive updated to false.');
    } else {
      recordResult('DELETE Student (Soft Delete)', 'FAIL', `Expected status 200. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('DELETE Student (Soft Delete)', 'FAIL', err.message);
  }

  // Test 17: Verify soft deleted student is omitted in default list
  try {
    const res = await fetch(STUDENT_URL, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    const containsAlice = data.data.students.some(s => s._id === studentAId);
    if (res.status === 200 && !containsAlice) {
      recordResult('Verify Soft-Deleted Student Omitted from List', 'PASS', 'Student Alice was not found in the standard active student list.');
    } else {
      recordResult('Verify Soft-Deleted Student Omitted from List', 'FAIL', 'Failed. Soft-deleted student still appeared in active list.');
    }
  } catch (err) {
    recordResult('Verify Soft-Deleted Student Omitted from List', 'FAIL', err.message);
  }

  // Test 18: Verify soft deleted student is omitted in GET by ID
  try {
    const res = await fetch(`${STUDENT_URL}/${studentAId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (res.status === 404 && data.success === false) {
      recordResult('Verify Soft-Deleted Student Omitted from GET by ID', 'PASS', `Status 404. Blocked access successfully: "${data.message}"`);
    } else {
      recordResult('Verify Soft-Deleted Student Omitted from GET by ID', 'FAIL', `Expected status 404. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Verify Soft-Deleted Student Omitted from GET by ID', 'FAIL', err.message);
  }


  // ----------------------------------------------------
  // DATABASE CLEANUP
  // ----------------------------------------------------
  console.log('\nCleaning up database test entries...');
  try {
    await supabase.from('users').delete().in('email', [adminEmail]);
    await supabase.from('students').delete().like('email', `%_${timestamp}@test.com`);
    console.log('Database cleaned up successfully.');
  } catch (err) {
    console.error('Cleanup failed:', err);
  }

  console.log('\n=== TEST SUITE COMPLETED ===');
}

runSuite();
