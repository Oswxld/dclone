import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tspywzqhbrmuwimkvnae.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_zM8AvaSjJ2IxmS9hTcdenA_TZPEvjb9';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);