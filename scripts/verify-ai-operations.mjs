import process from 'node:process';
import console from 'node:console';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { createClient } from '@supabase/supabase-js';

// Writes one synthetic, zero-token audit entry. Never contacts OpenAI.
// The entry remains identifiable by prompt_version, not mixed with paid generation.
process.loadEnvFile('.env.local');
if (process.env.ZIWEI_VERIFY_OPERATIONS !== '1')
  throw new Error('Set ZIWEI_VERIFY_OPERATIONS=1 to run');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key || key.includes('[SENSITIVE]'))
  throw new Error('Configure local Supabase server credentials');
const page = await globalThis.fetch('https://zi-wei-dou-shu-blush.vercel.app', {
  signal: globalThis.AbortSignal.timeout(10000),
});
if (!page.ok || (await page.text()).includes('name="includeAi"'))
  throw new Error('Verify production AI is disabled before this check');
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
async function rpc(name, args) {
  const { data, error } = await db.rpc(name, args);
  if (error) throw new Error(`Operational RPC failed: ${name}`);
  return data;
}
const digest = () => randomBytes(32).toString('hex');
const args = {
  p_actor: digest(),
  p_fingerprint: digest(),
  p_model: 'gpt-5.4-mini-2026-03-17',
  p_prompt: 'ops-verification-v1',
  p_hourly_limit: 3,
  p_daily_limit: 20,
  p_daily_budget: 2000000,
};
const started = performance.now();
const reservation = await rpc('reserve_ai_request', args);
if (!reservation?.allowed || typeof reservation.id !== 'string')
  throw new Error('Admission denied; check current limits before retrying');
try {
  assert.deepEqual(await rpc('reserve_ai_request', args), {
    allowed: false,
    reason: 'duplicate',
  });
  assert.deepEqual(
    await rpc('reserve_ai_request', {
      ...args,
      p_fingerprint: digest(),
      p_hourly_limit: 1,
    }),
    { allowed: false, reason: 'hourly' },
  );
  assert.deepEqual(
    await rpc('reserve_ai_request', {
      ...args,
      p_actor: digest(),
      p_fingerprint: digest(),
      p_daily_budget: 400000,
    }),
    { allowed: false, reason: 'daily' },
  );
} finally {
  // No provider request was made: zero usage is known, not an assumed timeout refund.
  const settled = await rpc('finish_ai_request', {
    p_id: reservation.id,
    p_outcome: 'unavailable',
    p_duration_ms: Math.round(performance.now() - started),
    p_input: 0,
    p_cached: 0,
    p_output: 0,
  });
  assert.equal(settled, true, 'Settlement did not complete');
}
const repeated = await rpc('finish_ai_request', {
  p_id: reservation.id,
  p_outcome: 'ready',
  p_duration_ms: 0,
  p_input: 0,
  p_cached: 0,
  p_output: 0,
});
assert.equal(repeated, false, 'Settlement must be idempotent');
const summary = await rpc('ai_usage_summary');
assert(
  summary.some(
    (row) =>
      row.prompt_version === 'ops-verification-v1' &&
      row.known_estimated_cost_microusd === 0,
  ),
);
console.log(
  JSON.stringify({
    status: 'passed',
    providerCalls: 0,
    checks: [
      'reservation',
      'duplicate',
      'hourly',
      'budget',
      'settlement',
      'idempotency',
      'summary',
    ],
    auditPrompt: args.p_prompt,
  }),
);
