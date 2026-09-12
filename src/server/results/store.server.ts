import 'server-only';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { parseSnapshot, resultIdSchema, type ResultSnapshot } from './snapshot';

const cookieName = 'ziwei-result-owner';
export const retentionSeconds = 30 * 24 * 60 * 60;
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
  let token = jar.get(cookieName)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    if (!create) return null;
    token = randomBytes(32).toString('hex');
  }
  if (create)
    jar.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: retentionSeconds,
    });
  return digest(token);
}
export async function saveResult(snapshot: ResultSnapshot) {
  const payload = parseSnapshot(snapshot);
  const ownerHash = await owner(true);
  const id = randomUUID();
  const expiresAt = new Date(
    Date.now() + retentionSeconds * 1000,
  ).toISOString();
  const { error } = await database()
    .from('saved_results')
    .insert({ id, owner_hash: ownerHash, payload, expires_at: expiresAt });
  if (error) throw new Error('Result save failed');
  return id;
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
