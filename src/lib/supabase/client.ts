import { createBrowserClient as createClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { getSupabaseEnv } from './env';

export function createBrowserClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createClient<Database>(url, anonKey);
}
