import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testAPIs() {
  console.log("=========================================");
  console.log("   REST API ENDPOINT INTEGRITY AUDIT     ");
  console.log("=========================================\n");

  const sessions = {};
  const rolesToTest = ['super_admin', 'admin', 'faculty', 'student', 'warden'];
  const emails = {
    super_admin: 'superadmin@college.com',
    admin: 'admin@college.com',
    faculty: 'faculty@college.com',
    student: 'student@college.com',
    warden: 'warden@college.com'
  };

  // 1. Authenticate and verify role tokens
  console.log("--- 1. Authenticating Roles ---");
  for (const role of rolesToTest) {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: emails[role],
        password: 'password123'
      });
      if (res.data && res.data.token) {
        console.log(`✅ Login successful for ${role} (${emails[role]})`);
        sessions[role] = res.data.token;
      } else {
        console.log(`❌ Login failed for ${role}: no token returned`);
      }
    } catch (err) {
      console.log(`❌ Login exception for ${role}: ${err.message}`);
    }
  }

  // 2. Test Authorization Guard (Warden dashboard access by Warden vs Student)
  console.log("\n--- 2. Testing Authorization Guarding ---");
  if (sessions.warden && sessions.student) {
    // Warden accessing hostel stats - should succeed
    try {
      const res = await axios.get(`${API_URL}/hostel/allocations`, {
        headers: { Authorization: `Bearer ${sessions.warden}` }
      });
      console.log(`✅ Warden access to hostel allocations: ALLOWED (Status ${res.status})`);
    } catch (err) {
      console.log(`❌ Warden access failed: ${err.message}`);
    }

    // Student accessing hostel allocations - should be FORBIDDEN (403)
    try {
      await axios.get(`${API_URL}/hostel/allocations`, {
        headers: { Authorization: `Bearer ${sessions.student}` }
      });
      console.log(`❌ Student access to hostel allocations: ALLOWED (Security Flaw!)`);
    } catch (err) {
      if (err.response && (err.response.status === 403 || err.response.status === 401)) {
        console.log(`✅ Student access to hostel allocations: BLOCKED/FORBIDDEN (Status ${err.response.status})`);
      } else {
        console.log(`❌ Student access got unexpected error: ${err.message}`);
      }
    }
  }

  // 3. Test Dashboard Stats API Response Consistency
  console.log("\n--- 3. Testing Dashboard Stats API Response ---");
  if (sessions.admin) {
    try {
      const res = await axios.get(`${API_URL}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${sessions.admin}` }
      });
      if (res.data && res.data.success) {
        console.log("✅ Admin dashboard stats API returns consistent JSON format.");
        console.log("   Stats count:", res.data.data.stats.length);
        console.log("   Keys present:", Object.keys(res.data.data).join(", "));
      } else {
        console.log("❌ Admin dashboard stats API returned success: false");
      }
    } catch (err) {
      console.log(`❌ Admin dashboard stats API failed: ${err.message}`);
    }
  }

  console.log("\n=========================================");
  console.log("API Integrity Audit Complete.");
}

testAPIs();
