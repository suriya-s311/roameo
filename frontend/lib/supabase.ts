import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrdgduymxbzyfjjkryth.supabase.co';
const cleanUrl = (rawUrl.replace(/\]https.*$/, '').trim()) || 'https://qrdgduymxbzyfjjkryth.supabase.co';
const supabaseUrl = cleanUrl.startsWith('http') ? cleanUrl : 'https://qrdgduymxbzyfjjkryth.supabase.co';
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key-placeholder').trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'traveler' | 'seller';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
}

