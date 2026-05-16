import { createClient, type SupabaseClient, type AuthChangeEvent as SupabaseAuthChangeEvent, type Session as SupabaseSession } from '@supabase/supabase-js';

export type AuthChangeEvent = SupabaseAuthChangeEvent;
export type Session = SupabaseSession;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
