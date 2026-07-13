import { createClient } from "@supabase/supabase-js";

// Externe Supabase configuratie (productie-project Voortraject CRM).
// De anon-key is publiek (hoort client-side thuis). We exporteren hem ook los,
// zodat directe fetch-aanroepen naar edge functions in dit project de vereiste
// `apikey`-header kunnen meesturen (de function-gateway wil die, ook bij
// verify_jwt = false).
export const SUPABASE_EXTERNAL_URL = "https://lfelnfukbrxznkevnevr.supabase.co";
export const SUPABASE_EXTERNAL_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmZWxuZnVrYnJ4em5rZXZuZXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NDI3MTQsImV4cCI6MjA5MzIxODcxNH0.jtOD3z4ElwfXSNaZeekWKwfBZGBIXnWRvNl72n9uYQ0";
const SUPABASE_URL = SUPABASE_EXTERNAL_URL;
const SUPABASE_ANON_KEY = SUPABASE_EXTERNAL_ANON_KEY;

export const supabaseExternal = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
