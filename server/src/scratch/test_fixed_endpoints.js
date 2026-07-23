import http from 'http';

function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve) => {
    const payload = data ? JSON.stringify(data) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', err => resolve({ error: err }));
    if (payload) req.write(payload);
    req.end();
  });
}

async function testWithAuth() {
  const loginRes = await makeRequest('/api/auth/login', 'POST', {
    email: 'superadmin@college.com',
    password: 'password123'
  });

  const token = loginRes.data?.data?.token || loginRes.data?.token;

  const transportRes = await makeRequest('/api/transport/dashboard', 'GET', null, token);
  console.log("=== TRANSPORT DASHBOARD API RESPONSE ===");
  console.log("Status:", transportRes.status);
  console.log("Response payload:", JSON.stringify(transportRes.data, null, 2));
}

testWithAuth();
