# College Management System

![CI Status](https://github.com/Hanish0717/Collegemanagementsystem/actions/workflows/ci.yml/badge.svg)

A modern, service-based College Management System featuring live PostgreSQL/Supabase integrations, OTP verification, and an AI-powered assistant.

E2E tests
-------

There is a server-side end-to-end test for the hostel fees `recordPayment` endpoint.

To run the E2E test locally you must prepare a test database and provide a valid fee id. Example env vars:

```powershell
# point to a prepared test database where a fee record exists
$env:TEST_FEE_ID = "<fee-id-from-test-db>"
$env:TEST_SUPABASE_URL = "https://your-test.supabase.co"
$env:TEST_SUPABASE_KEY = "your-test-service-role-key"

# optionally run against an already-running server
$env:TEST_SERVER_URL = "http://localhost:5000"

# Run the E2E test
cd server
npm ci
npm run test:e2e
```

Notes:
- The test will be skipped if `TEST_FEE_ID` is not provided.
- For a fully reproducible E2E run, create a fresh test Supabase instance and seed it using `server/seed` scripts.
