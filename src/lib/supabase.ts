import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default env variables
const defaultUrl = import.meta.env.VITE_SUPABASE_URL || '';
const defaultKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Local storage key for dynamic connection override
const STORAGE_CONFIG_KEY = 'cbt_tka_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return { ...parsed, isConnected: true };
      }
    }
  } catch (e) {
    console.error('Failed to parse stored Supabase config', e);
  }

  return {
    url: defaultUrl,
    anonKey: defaultKey,
    isConnected: Boolean(defaultUrl && defaultKey)
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify({ url, anonKey }));
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_CONFIG_KEY);
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          }
        }
      });
    } catch (err) {
      console.warn('Could not initialize remote Supabase client, falling back to local engine:', err);
      return null;
    }
  }
  return supabaseInstance;
}

/**
 * Test connectivity with given Supabase credentials
 */
export async function testSupabaseConnection(url: string, key: string): Promise<{ success: boolean; message: string }> {
  try {
    const tempClient = createClient(url, key);
    const { error } = await tempClient.from('schools').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Koneksi ke Supabase PostgreSQL berhasil!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Gagal menghubungi server Supabase' };
  }
}
