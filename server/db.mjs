import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { env } from './env.mjs';

export const SUPABASE_PROJECT_REF = 'npjsersrmvltoxmqdkzd';

let supabaseAdminClient;

export function getSupabaseAdminClient() {
  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      realtime: {
        transport: WebSocket,
      },
    });
  }

  return supabaseAdminClient;
}

export async function checkSupabaseConnection() {
  const startedAt = Date.now();

  try {
    const { count, error, status } = await getSupabaseAdminClient()
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    if (error) {
      return {
        ok: false,
        projectRef: SUPABASE_PROJECT_REF,
        table: 'profiles',
        status,
        errorCode: error.code,
        errorName: error.name,
        durationMs: Date.now() - startedAt,
      };
    }

    return {
      ok: true,
      projectRef: SUPABASE_PROJECT_REF,
      table: 'profiles',
      status,
      rowCount: count,
      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    return {
      ok: false,
      projectRef: SUPABASE_PROJECT_REF,
      table: 'profiles',
      errorName: error?.name || 'Error',
      durationMs: Date.now() - startedAt,
    };
  }
}
