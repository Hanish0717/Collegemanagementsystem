import axios from 'axios';

async function test() {
  console.log("Logging in as admin...");
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@college.com',
      password: 'password123'
    });

    console.log("Login Status:", loginRes.status);
    console.log("Token retrieved:", !!loginRes.data.token);

    const token = loginRes.data.token;
    console.log("Calling /api/placement/dashboard...");
    const res = await axios.get('http://localhost:5000/api/placement/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("Status:", res.status);
    console.log("Data success:", res.data.success);
    if (res.data.success) {
      console.log("Stats count:", res.data.data.stats.length);
      console.log("Stats sample:", res.data.data.stats.slice(0, 3));
      console.log("Drives count:", res.data.data.drives.length);
      console.log("Companies count:", res.data.data.companies.length);
      console.log("Interviews count:", res.data.data.interviews.length);
      console.log("TrendData count:", res.data.data.placementTrendData.length);
    } else {
      console.error("API error:", res.data);
    }
  } catch (err) {
    if (err.response) {
      console.error("Error status:", err.response.status);
      console.error("Error data:", err.response.data);
    } else {
      console.error("Error message:", err.message);
    }
  }
}

test();
