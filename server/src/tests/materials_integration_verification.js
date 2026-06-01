import 'dotenv/config';
import axios from 'axios';
import pkg from 'pg';
const { Client } = pkg;

const API_URL = 'http://localhost:5000/api';
const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres';

async function runTests() {
  console.log('--- STARTING STUDY MATERIALS INTEGRATION VERIFICATION ---');
  let token = '';
  let testMaterialId = '';
  let dbClient;

  try {
    // 1. Connect to PostgreSQL
    dbClient = new Client({
      connectionString: DB_URL,
      ssl: DB_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });
    await dbClient.connect();
    console.log('✅ Connected to database.');

    // 2. Fetch student user and profile to retrieve department info
    console.log('Logging in as hanish@gmail.com...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'hanish@gmail.com',
      password: 'password123'
    });
    token = loginRes.data.token;
    console.log('Successfully logged in. Token acquired.');

    const headers = { Authorization: `Bearer ${token}` };

    // Get student details
    const studentRes = await dbClient.query("SELECT * FROM students WHERE email = 'hanish@gmail.com'");
    if (studentRes.rows.length === 0) {
      throw new Error('Demo student hanish@gmail.com not found in database.');
    }
    const student = studentRes.rows[0];
    console.log(`Student cohort: Department ${student.department}, Year ${student.year}, Semester ${student.semester}`);

    // 3. Create a temporary study material in database matching the student's cohort
    console.log('Inserting a temporary study material...');
    const insertRes = await dbClient.query(`
      INSERT INTO study_materials (title, subject, type, file_url, department, year, semester, downloads)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, downloads
    `, [
      'Advanced Integration Testing Manual',
      'Algorithms',
      'PDF',
      'https://example.com/materials/test-manual.pdf',
      student.department,
      student.year,
      student.semester,
      0
    ]);
    testMaterialId = insertRes.rows[0].id;
    console.log(`Successfully created temporary material with ID: ${testMaterialId}`);

    // 4. Retrieve study materials as student and assert the newly inserted material is present
    console.log('Fetching study materials as student...');
    const getRes = await axios.get(`${API_URL}/student-module/materials`, { headers });
    const foundMaterial = getRes.data.data.find(m => m.id === testMaterialId || m._id === testMaterialId);
    if (!foundMaterial) {
      throw new Error(`❌ Failed to retrieve study material matching student cohort (ID: ${testMaterialId})`);
    }
    console.log(`✅ Material retrieved successfully. Current downloads count: ${foundMaterial.downloads}`);

    // 5. Trigger download event tracking endpoint
    console.log(`Triggering download count increment for material: ${testMaterialId}...`);
    const trackRes = await axios.post(`${API_URL}/student-module/materials/${testMaterialId}/download`, {}, { headers });
    if (!trackRes.data.success) {
      throw new Error('❌ Failed to increment download count via API.');
    }
    console.log('Download tracking API returned success.');

    // 6. Verify downloads count increased in DB
    const verifyRes = await dbClient.query("SELECT downloads FROM study_materials WHERE id = $1", [testMaterialId]);
    const downloadsCount = verifyRes.rows[0].downloads;
    console.log(`Verification: downloads count in DB is ${downloadsCount}`);

    if (downloadsCount === 1) {
      console.log('✅ Downloads counter increment validated successfully in PostgreSQL database.');
    } else {
      throw new Error(`❌ Incorrect downloads count. Expected 1, found ${downloadsCount}`);
    }

  } catch (err) {
    console.error('❌ Integration Test Failed:', err.response?.data || err.message);
    process.exit(1);
  } finally {
    if (dbClient) {
      console.log('Cleaning up temporary study material...');
      await dbClient.query("DELETE FROM study_materials WHERE id = $1", [testMaterialId]);
      await dbClient.end();
      console.log('Clean up complete.');
    }
  }

  console.log('✅ ALL STUDY MATERIALS API INTEGRATION TESTS PASSED!');
}

runTests();
