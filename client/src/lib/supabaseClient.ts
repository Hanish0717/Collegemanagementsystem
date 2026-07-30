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
const targetKey = supabaseAnonKey && supabaseAnonKey !== "placeholder_key" ? supabaseAnonKey : "";

if (import.meta.env.DEV) {
  console.log("⚡ Supabase initialized with URL:", targetUrl);
}

export const supabase = createClient(targetUrl, targetKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

