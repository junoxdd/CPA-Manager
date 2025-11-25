
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO DO BANCO DE DADOS ---
const SUPABASE_URL = 'https://dtacgqgtobdownmjrlfl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bxKxJ0JSlIEViT8P5aIbNw_TRH8E2q1';

export const isConfigured = () => {
  return SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('http');
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  }
});
