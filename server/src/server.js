import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Validate Supabase config
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ ERROR: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined in .env! Backend cannot run without Supabase.");
  process.exit(1);
} else {
  console.log("✅ Supabase credentials detected. Ready to process queries.");
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});



