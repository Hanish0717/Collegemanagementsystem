import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const API_URL = 'http://localhost:5000/api';

async function run() {
  console.log('=== TESTING SUPER ADMIN STATS ENDPOINT ===');
  try {
    // Login as Super Admin
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'superadmin@college.com',
      password: 'password123'
    });

    const token = loginRes.data.token;
    console.log('Successfully logged in as Super Admin!');

    // Fetch Stats
    const statsRes = await axios.get(`${API_URL}/super-admin/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Successfully retrieved stats!');
    console.log(JSON.stringify(statsRes.data, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error fetching stats:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

run();
