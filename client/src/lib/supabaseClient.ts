import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("placeholder.supabase.co") &&
  supabaseUrl !== "https://your_supabase_project.supabase.co" &&
  supabaseAnonKey !== "placeholder_key" &&
  supabaseAnonKey !== "your_supabase_anon_key_here"
);

if (!isConfigured) {
  console.warn(
    "⚠️ Missing or placeholder VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in environment configuration. Supabase client initialized in fallback mode."
  );
}

// Ensure valid non-empty URL and Key are passed to createClient to prevent runtime throws
const targetUrl = isConfigured ? supabaseUrl : "https://placeholder.supabase.co";
const targetKey = isConfigured ? supabaseAnonKey : "placeholder_key";

if (import.meta.env.DEV) {
  console.log("⚡ Supabase client initialized. Live integration active:", isConfigured);
}

export const supabase = createClient(targetUrl, targetKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
