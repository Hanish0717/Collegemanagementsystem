import axios from 'axios';

async function test() {
  try {
    console.log("Logging in as superadmin...");
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'superadmin@college.com',
      password: 'password123'
    });

    const token = loginRes.data.token;
    console.log("Logged in successfully. Token obtained.");

    console.log("Fetching current system config...");
    const configGet = await axios.get('http://localhost:5000/api/super-admin/config', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("✅ Current Config response:", configGet.data);

    console.log("Attempting to update toggle configuration...");
    const configTogglesRes = await axios.post('http://localhost:5000/api/super-admin/config/toggles', {
      toggles: {
        "SMTP Configuration": true,
        "SMS gateway Settings": false,
        "Internal chat server": true
      }
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("✅ Toggles Saved response:", configTogglesRes.data);

    console.log("Attempting to update institution configuration...");
    const configInstRes = await axios.post('http://localhost:5000/api/super-admin/config/institution', {
      instName: "Test University",
      acadYear: "2026-2027",
      bkInterval: "Weekly Backup",
      admEmail: "admin@test.edu",
      notifNotes: "Notification details for testing"
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("✅ Institution Saved response:", configInstRes.data);

    console.log("Fetching system config again to verify...");
    const configVerify = await axios.get('http://localhost:5000/api/super-admin/config', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("✅ Verified Config response:", configVerify.data);

  } catch (err) {
    console.error("❌ Error response:", err.response ? {
      status: err.response.status,
      data: err.response.data
    } : err.message);
  }
}

test();
