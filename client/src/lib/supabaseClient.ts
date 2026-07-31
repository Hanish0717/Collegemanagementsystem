import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder.supabase.co")) {
  console.warn(
    "⚠️ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in client/.env environment configuration."
  );
}

// Ensure valid HTTPS URL and Key are supplied to createClient
const targetUrl = supabaseUrl && !supabaseUrl.includes("placeholder.supabase.co") ? supabaseUrl : "https://rdzitvvxxdhtbzzqoasd.supabase.co";
const targetKey = supabaseAnonKey && supabaseAnonKey !== "placeholder_key" && supabaseAnonKey.trim() !== "" 
  ? supabaseAnonKey 
  : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkeml0dnZ4eGRodGJ6enFvYXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU0NTAwMDAsImV4cCI6MjAzMTAyNjAwMH0.placeholder";

if (import.meta.env.DEV) {
  console.log("⚡ Supabase initialized with URL:", targetUrl);
}

export const supabase = createClient(targetUrl, targetKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

