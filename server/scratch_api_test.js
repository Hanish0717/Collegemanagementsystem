import axios from 'axios';

async function testApi() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'superadmin@college.com',
      password: 'password123'
    });

    const token = loginRes.data.token;
    console.log("Logged in successfully. Token length:", token.length);

    try {
      const registerRes = await axios.post('http://localhost:5000/api/super-admin/admins', {
        fullName: 'hanish',
        email: 'hanishvavilapalli@gmail.com',
        employeeId: 'ADM002',
        department: ''
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("Registered admin successfully:", registerRes.data);
    } catch (err) {
      console.error("Register admin API error status:", err.response?.status);
      console.error("Register admin API error data:", err.response?.data);
    }
  } catch (err) {
    console.error("Login failed:", err.message);
  }
}

testApi();
