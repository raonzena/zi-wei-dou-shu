import process from 'node:process';
import console from 'node:console';
import { createClient } from '@supabase/supabase-js';
try {
  process.loadEnvFile('.env.local');
} catch (error) {
  if (error.code !== 'ENOENT') {
    console.error('Could not load local settings');
    process.exit(1);
  }
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SECRET_KEY?.trim();
if (!url || !key)
  throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY');
const db = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    fetch: (input, init) =>
      globalThis.fetch(input, {
        ...init,
        signal: globalThis.AbortSignal.timeout(5000),
      }),
  },
});
const { data, error } = await db.rpc('ai_usage_summary');
if (error)
  throw new Error(
    'Usage report unavailable; check migration and server credentials',
  );
console.log(JSON.stringify(data, null, 2));
