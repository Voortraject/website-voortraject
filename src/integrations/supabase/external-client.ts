import { createClient } from "@supabase/supabase-js";

// Externe Supabase configuratie (productie-project Voortraject CRM)
const SUPABASE_URL = "https://lfelnfukbrxznkevnevr.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZWxuZnVrYnJ4em5rZXZuZXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NDI3MTQsImV4cCI6MjA5MzIxODcxNH0.jtOD3z4ElwfXSNaZeekWKwfBZGBIXnWRvNl72n9uYQ0";

export const supabaseExternal = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
