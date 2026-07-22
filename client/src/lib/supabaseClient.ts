import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder_key";

const isPlaceholder = supabaseUrl.includes("placeholder.supabase.co");

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    // Disable realtime sockets if using placeholder domain to prevent WebSocket ERR_NAME_NOT_RESOLVED
    transport: isPlaceholder ? undefined : undefined,
    params: {
      eventsPerSecond: 0,
    },
  },
});
