import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const admissionSchema = z.discriminatedUnion('allowed', [
  z.object({ allowed: z.literal(true), id: z.uuid() }),
  z.object({
    allowed: z.literal(false),
    reason: z.enum(['duplicate', 'hourly', 'daily']),
  }),
]);
export function usageStore() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !key) throw new Error('Usage store unavailable');
  const db = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(5000) }),
    },
  });
  return {
    async reserve(args: Record<string, unknown>) {
      const { data, error } = await db.rpc('reserve_ai_request', args);
      if (error) throw new Error('Admission failed');
      return admissionSchema.parse(data);
    },
    async finish(args: Record<string, unknown>) {
      const { error } = await db.rpc('finish_ai_request', args);
      if (error) throw new Error('Settlement failed');
    },
  };
}
