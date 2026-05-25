import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const BASE_URL = 'http://localhost:5000/api/auth';

const results = [];
function recordResult(testName, status, details) {
  results.push({ testName, status, details });
  console.log(`${status === 'PASS' ? '✅' : '❌'} ${testName}: ${details}`);
}

async function runSuite() {
  console.log('=== STARTING COMPREHENSIVE AUTH TEST SUITE ===\n');

  // Connect to database to inspect and manipulate test data
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for direct data validation.\n');
  } catch (error) {
    console.error('Failed to connect to database in test script:', error);
    process.exit(1);
  }

  const timestamp = Date.now();
  const testEmail = `user_${timestamp}@test.com`;
  const adminEmail = `admin_${timestamp}@test.com`;
  const testPassword = 'Password123!';
  const testFullName = 'John Doe';

  let studentToken = '';
  let adminToken = '';
  let studentUserId = '';

  // ==================================================
  // REGISTER TESTS
  // ==================================================
  console.log('--- RUNNING REGISTER TESTS ---');

  // Test 1: Valid registration
  try {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: testFullName,
        email: testEmail,
        password: testPassword,
        role: 'student',
        phoneNumber: '1234567890'
      })
    });
    const data = await res.json();

    if (res.status === 201 && data.success === true && data.token && data.user) {
      studentToken = data.token;
      studentUserId = data.user._id;

      if (!data.user.password) {
        recordResult('Valid Registration (201 Created)', 'PASS', 'Successfully registered user, received token, and password was NOT returned in response.');
      } else {
        recordResult('Valid Registration (201 Created)', 'FAIL', 'Password field was exposed in registration response payload.');
      }
    } else {
      recordResult('Valid Registration (201 Created)', 'FAIL', `Expected status 201 and success. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Valid Registration (201 Created)', 'FAIL', err.message);
  }

  // Test 2: Password hashing check in Database
  try {
    const userInDb = await User.findById(studentUserId).select('+password');
    if (userInDb && userInDb.password !== testPassword && userInDb.password.startsWith('$2a$')) {
      recordResult('Password Hashing Verification (DB Check)', 'PASS', 'Verified user password stored in MongoDB is hashed using bcrypt.');
    } else {
      recordResult('Password Hashing Verification (DB Check)', 'FAIL', 'Password in database is plain text or missing bcrypt signature.');
    }
  } catch (err) {
    recordResult('Password Hashing Verification (DB Check)', 'FAIL', err.message);
  }

  // Test 3: Duplicate email registration
  try {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Duplicate User',
        email: testEmail,
        password: testPassword,
        role: 'student'
      })
    });
    const data = await res.json();
    if (res.status === 400 && data.success === false) {
      recordResult('Duplicate Email Prevention (400 Bad Request)', 'PASS', `Rejected successfully. Got message: "${data.message}"`);
    } else {
      recordResult('Duplicate Email Prevention (400 Bad Request)', 'FAIL', `Expected status 400. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Duplicate Email Prevention (400 Bad Request)', 'FAIL', err.message);
  }

  // Test 4: Missing required fields
  try {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `missing_name_${timestamp}@test.com`,
        password: testPassword
      })
    });
    const data = await res.json();
    if (res.status === 400 && data.success === false) {
      recordResult('Missing Required Fields Validation (400 Bad Request)', 'PASS', `Rejected successfully. Got message: "${data.message}"`);
    } else {
      recordResult('Missing Required Fields Validation (400 Bad Request)', 'FAIL', `Expected status 400. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Missing Required Fields Validation (400 Bad Request)', 'FAIL', err.message);
  }

  // Test 5: Invalid email format
  try {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Invalid Email',
        email: 'not-an-email',
        password: testPassword,
        role: 'student'
      })
    });
    const data = await res.json();
    if (res.status === 400 || (res.status === 500 && data.message.toLowerCase().includes('validation'))) {
      recordResult('Invalid Email Format Validation (400/500 Validation Error)', 'PASS', `Got expected format rejection: "${data.message}"`);
    } else {
      recordResult('Invalid Email Format Validation (400/500 Validation Error)', 'FAIL', `Expected validation error. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Invalid Email Format Validation (400/500 Validation Error)', 'FAIL', err.message);
  }

  // Test 6: Invalid role specified
  try {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Invalid Role',
        email: `invalidrole_${timestamp}@test.com`,
        password: testPassword,
        role: 'not-a-valid-role-name'
      })
    });
    const data = await res.json();
    if (res.status === 400 || (res.status === 500 && data.message.toLowerCase().includes('validation'))) {
      recordResult('Invalid Role Validation (400/500 Validation Error)', 'PASS', `Got expected role validation error: "${data.message}"`);
    } else {
      recordResult('Invalid Role Validation (400/500 Validation Error)', 'FAIL', `Expected validation error. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Invalid Role Validation (400/500 Validation Error)', 'FAIL', err.message);
  }

  // Register a valid Admin user
  try {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Admin User',
        email: adminEmail,
        password: testPassword,
        role: 'admin'
      })
    });
    const data = await res.json();
    if (res.status === 201 && data.success === true) {
      adminToken = data.token;
      recordResult('Valid Admin User Registration (201 Created)', 'PASS', 'Successfully registered user with admin role.');
    } else {
      recordResult('Valid Admin User Registration (201 Created)', 'FAIL', `Expected 201. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Valid Admin User Registration (201 Created)', 'FAIL', err.message);
  }


  // ==================================================
  // LOGIN TESTS
  // ==================================================
  console.log('\n--- RUNNING LOGIN TESTS ---');

  // Test 7: Valid login
  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    const data = await res.json();
    if (res.status === 200 && data.success === true && data.token && data.user) {
      if (!data.user.password) {
        recordResult('Valid Login (200 OK)', 'PASS', 'Logged in successfully, token returned, password NOT in response.');
      } else {
        recordResult('Valid Login (200 OK)', 'FAIL', 'Password field exposed in login response.');
      }
    } else {
      recordResult('Valid Login (200 OK)', 'FAIL', `Expected status 200. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Valid Login (200 OK)', 'FAIL', err.message);
  }

  // Test 8: Wrong password
  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPasswordXYZ'
      })
    });
    const data = await res.json();
    if (res.status === 401 && data.success === false) {
      recordResult('Wrong Password Handling (401 Unauthorized)', 'PASS', `Rejected successfully. Got message: "${data.message}"`);
    } else {
      recordResult('Wrong Password Handling (401 Unauthorized)', 'FAIL', `Expected status 401. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Wrong Password Handling (401 Unauthorized)', 'FAIL', err.message);
  }

  // Test 9: Non-existing email login
  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistentuser@test.com',
        password: testPassword
      })
    });
    const data = await res.json();
    if (res.status === 401 && data.success === false) {
      recordResult('Non-Existing Email Login Handling (401 Unauthorized)', 'PASS', `Rejected successfully. Got message: "${data.message}"`);
    } else {
      recordResult('Non-Existing Email Login Handling (401 Unauthorized)', 'FAIL', `Expected status 401. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Non-Existing Email Login Handling (401 Unauthorized)', 'FAIL', err.message);
  }

  // Test 10: Empty fields login
  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: '',
        password: ''
      })
    });
    const data = await res.json();
    if (res.status === 400 && data.success === false) {
      recordResult('Empty Fields Login Handling (400 Bad Request)', 'PASS', `Rejected successfully. Got message: "${data.message}"`);
    } else {
      recordResult('Empty Fields Login Handling (400 Bad Request)', 'FAIL', `Expected status 400. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Empty Fields Login Handling (400 Bad Request)', 'FAIL', err.message);
  }


  // ==================================================
  // PROTECTED ROUTE TESTS
  // ==================================================
  console.log('\n--- RUNNING PROTECTED ROUTE TESTS ---');

  // Test 11: GET /api/auth/me with valid token
  try {
    const res = await fetch(`${BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${studentToken}`
      }
    });
    const data = await res.json();
    if (res.status === 200 && data.success === true && data.user) {
      if (!data.user.password) {
        recordResult('Protected Route Access (Valid Token - 200 OK)', 'PASS', 'Profile retrieved successfully, password NOT exposed.');
      } else {
        recordResult('Protected Route Access (Valid Token - 200 OK)', 'FAIL', 'Password field exposed in profile response.');
      }
    } else {
      recordResult('Protected Route Access (Valid Token - 200 OK)', 'FAIL', `Expected status 200. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Protected Route Access (Valid Token - 200 OK)', 'FAIL', err.message);
  }

  // Test 12: GET /api/auth/me with invalid token
  try {
    const res = await fetch(`${BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalidtokenstring12345'
      }
    });
    const data = await res.json();
    if (res.status === 401 && data.success === false) {
      recordResult('Protected Route Access (Invalid Token - 401 Unauthorized)', 'PASS', `Blocked successfully. Got message: "${data.message}"`);
    } else {
      recordResult('Protected Route Access (Invalid Token - 401 Unauthorized)', 'FAIL', `Expected status 401. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Protected Route Access (Invalid Token - 401 Unauthorized)', 'FAIL', err.message);
  }

  // Test 13: GET /api/auth/me with missing token
  try {
    const res = await fetch(`${BASE_URL}/me`, {
      method: 'GET'
    });
    const data = await res.json();
    if (res.status === 401 && data.success === false) {
      recordResult('Protected Route Access (Missing Token - 401 Unauthorized)', 'PASS', `Blocked successfully. Got message: "${data.message}"`);
    } else {
      recordResult('Protected Route Access (Missing Token - 401 Unauthorized)', 'FAIL', `Expected status 401. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Protected Route Access (Missing Token - 401 Unauthorized)', 'FAIL', err.message);
  }

  // Test 14: GET /api/auth/me with inactive user token
  try {
    // Manually flag the user as inactive in database
    await User.findByIdAndUpdate(studentUserId, { isActive: false });

    const res = await fetch(`${BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${studentToken}`
      }
    });
    const data = await res.json();
    if (res.status === 401 && data.success === false) {
      recordResult('Protected Route Access (Inactive User - 401 Unauthorized)', 'PASS', `Blocked successfully. Active account validation check passed: "${data.message}"`);
    } else {
      recordResult('Protected Route Access (Inactive User - 401 Unauthorized)', 'FAIL', `Expected status 401. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Protected Route Access (Inactive User - 401 Unauthorized)', 'FAIL', err.message);
  } finally {
    // Re-enable account to prevent db cleanup issues
    await User.findByIdAndUpdate(studentUserId, { isActive: true });
  }


  // ==================================================
  // ROLE TESTING
  // ==================================================
  console.log('\n--- RUNNING ROLE AUTHORIZATION TESTS ---');

  // Test 15: Allowed roles access route (admin)
  try {
    const res = await fetch(`${BASE_URL}/admin-test`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    const data = await res.json();
    if (res.status === 200 && data.success === true) {
      recordResult('Role Middleware Access Allowed (admin - 200 OK)', 'PASS', `Access granted. Got message: "${data.message}"`);
    } else {
      recordResult('Role Middleware Access Allowed (admin - 200 OK)', 'FAIL', `Expected status 200. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Role Middleware Access Allowed (admin - 200 OK)', 'FAIL', err.message);
  }

  // Test 16: Unauthorized roles blocked (student trying to access admin endpoint)
  try {
    const res = await fetch(`${BASE_URL}/admin-test`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${studentToken}`
      }
    });
    const data = await res.json();
    if (res.status === 403 && data.success === false) {
      recordResult('Role Middleware Access Blocked (student - 403 Forbidden)', 'PASS', `Access denied successfully. Got message: "${data.message}"`);
    } else {
      recordResult('Role Middleware Access Blocked (student - 403 Forbidden)', 'FAIL', `Expected status 403. Got status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordResult('Role Middleware Access Blocked (student - 403 Forbidden)', 'FAIL', err.message);
  }


  // Clean up database test entries
  console.log('\nCleaning up database test entries...');
  await User.deleteMany({ email: { $in: [testEmail, adminEmail] } });
  console.log('Database cleaned up.');

  // Disconnect mongoose
  await mongoose.disconnect();
  console.log('\n=== TEST SUITE COMPLETED ===');

  return results;
}

runSuite();
