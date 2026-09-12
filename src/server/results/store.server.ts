import 'server-only';
import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { parseSnapshot, resultIdSchema, type ResultSnapshot } from './snapshot';

import {
  ownerCookieName,
  retentionSeconds,
  validOwnerToken,
} from './owner-cookie';
const digest = (value: string) =>
  createHash('sha256').update(value).digest('hex');
function database() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !key) throw new Error('Result storage unavailable');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: 'no-store',
          signal: AbortSignal.timeout(10000),
        }),
    },
  });
}
async function owner(create = false) {
  const jar = await cookies();
  const token = jar.get(ownerCookieName)?.value;
  if (!validOwnerToken(token)) {
    if (create) throw new Error('Result session unavailable');
    return null;
  }
  if (create)
    jar.set(ownerCookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: retentionSeconds,
    });
  return digest(token);
}
export async function saveResult(
  snapshot: ResultSnapshot,
  fingerprint: string,
) {
  const payload = parseSnapshot(snapshot);
  if (!/^[a-f0-9]{64}$/.test(fingerprint))
    throw new Error('Invalid result identity');
  const ownerHash = await owner(true);
  const { data, error } = await database().rpc('save_or_reuse_result', {
    p_owner_hash: ownerHash,
    p_fingerprint: fingerprint,
    p_payload: payload,
  });
  if (
    error ||
    !data ||
    !resultIdSchema.safeParse(data.id).success ||
    typeof data.created !== 'boolean'
  )
    throw new Error('Result save failed');
  return { id: data.id as string, created: data.created as boolean };
}
export async function loadResult(id: string, requireOwner = false) {
  if (!resultIdSchema.safeParse(id).success) return null;
  const ownerHash = await owner();
  if (requireOwner && !ownerHash) return null;
  let query = database()
    .from('saved_results')
    .select('payload,owner_hash')
    .eq('id', id)
    .gt('expires_at', new Date().toISOString());
  if (requireOwner) query = query.eq('owner_hash', ownerHash!);
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error('Result load failed');
  return data
    ? {
        snapshot: parseSnapshot(data.payload),
        isOwner: ownerHash === data.owner_hash,
      }
    : null;
}
export async function updateResultAi(id: string, ai: ResultSnapshot['ai']) {
  const saved = await loadResult(id, true);
  if (!saved) throw new Error('Result unavailable');
  const payload = parseSnapshot({ ...saved.snapshot, ai });
  const { data, error } = await database()
    .from('saved_results')
    .update({ payload })
    .eq('id', id)
    .eq('owner_hash', await owner())
    .gt('expires_at', new Date().toISOString())
    .select('id')
    .maybeSingle();
  if (error || !data) throw new Error('Result update failed');
}
