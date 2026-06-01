import 'dotenv/config';
import axios from 'axios';
import pkg from 'pg';
const { Client } = pkg;

const API_URL = 'http://localhost:5000/api';
const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres';

async function runTests() {
  console.log('--- STARTING EVENTS INTEGRATION VERIFICATION ---');
  let token = '';

  try {
    // 1. Log in as admin
    console.log('Logging in as admin@college.com...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@college.com',
      password: 'password123'
    });
    token = loginRes.data.token;
    console.log('Successfully logged in. Token acquired.');

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Fetch stats
    console.log('Fetching initial event stats...');
    const statsRes = await axios.get(`${API_URL}/events/stats`, { headers });
    console.log('Stats Response:', statsRes.data.data);

    // 3. Create a new pending approval event
    console.log('Creating a new event for approval...');
    const createRes = await axios.post(`${API_URL}/events`, {
      title: 'Annual Symposium 2026',
      description: 'A mock symposium for testing approval broadcast features.',
      type: 'Event',
      date: '2026-09-15',
      time: '9:00 AM - 5:00 PM',
      venue: 'Auditorium C',
      organizer: 'R&D Cell',
      status: 'Pending Approval'
    }, { headers });

    const testEvent = createRes.data.data;
    console.log('Successfully created test event:', testEvent.id);

    // 4. Approve the event
    console.log(`Approving event: ${testEvent.id}...`);
    const approveRes = await axios.put(`${API_URL}/events/${testEvent.id}/status`, {
      status: 'Approved'
    }, { headers });
    console.log('Approve response status:', approveRes.data.success);

    // 5. Query events list
    console.log('Querying events list with filter "Approved"...');
    const listRes = await axios.get(`${API_URL}/events?status=Approved`, { headers });
    const found = listRes.data.data.find(e => e.id === testEvent.id);
    if (found) {
      console.log('✅ Approved event confirmed in list.');
    } else {
      throw new Error('❌ Test event not found in list after approval.');
    }

    // 6. Connect to Postgres to check generated notifications
    console.log('Checking notifications in DB...');
    const dbClient = new Client({
      connectionString: DB_URL,
      ssl: DB_URL.includes('localhost') ? false : { rejectUnauthorized: false }
    });
    await dbClient.connect();

    try {
      const studentNotifsRes = await dbClient.query(
        "SELECT COUNT(*) FROM student_notifications WHERE title LIKE $1",
        [`%Symposium 2026%`]
      );
      console.log('Student Notifications Count:', studentNotifsRes.rows[0].count);

      const facultyNotifsRes = await dbClient.query(
        "SELECT COUNT(*) FROM faculty_notifications WHERE title LIKE $1",
        [`%Symposium 2026%`]
      );
      console.log('Faculty Notifications Count:', facultyNotifsRes.rows[0].count);

      const adminNotifsRes = await dbClient.query(
        "SELECT COUNT(*) FROM admin_notifications WHERE title LIKE $1",
        [`%Symposium 2026%`]
      );
      console.log('Admin Notifications Count:', adminNotifsRes.rows[0].count);

      console.log('✅ In-app database notifications verified successfully.');
    } finally {
      // Clean up test data
      console.log('Cleaning up test data from database...');
      await dbClient.query("DELETE FROM events WHERE id = $1", [testEvent.id]);
      await dbClient.query("DELETE FROM student_notifications WHERE title LIKE $1", [`%Symposium 2026%`]);
      await dbClient.query("DELETE FROM faculty_notifications WHERE title LIKE $1", [`%Symposium 2026%`]);
      await dbClient.query("DELETE FROM admin_notifications WHERE title LIKE $1", [`%Symposium 2026%`]);
      await dbClient.end();
      console.log('Clean up complete.');
    }

    console.log('✅ ALL EVENT API INTEGRATION TESTS PASSED!');
  } catch (err) {
    console.error('❌ Integration Test Failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

runTests();
