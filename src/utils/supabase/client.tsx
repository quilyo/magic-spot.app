import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Read Supabase credentials from environment variables
const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that environment variables are set
if (!projectId || !publicAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Please check your .env file and ensure ' +
    'VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_ANON_KEY are set. ' +
    'See .env.example for reference.'
  );
}

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createSupabaseClient(supabaseUrl, publicAnonKey);

