import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("❌ Missing Supabase env variables");
}

// MAIN PROJECT
export const supabaseMain = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// alias biar kompatibel di semua file
export const supabase = supabaseMain;