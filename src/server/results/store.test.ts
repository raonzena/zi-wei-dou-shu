import { beforeEach, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { calculateChart } from '../../domain/ziwei/calculate-chart.server';
import fixture from '../../domain/ziwei/fixtures/cust-1929.json';
import { createBasicReading } from '../../domain/interpretation/basic-reading';
import { createChartFacts } from '../../domain/interpretation/chart-facts.server';
import { parseSnapshot } from './snapshot';
import { loadResult, saveResult, updateResultAi } from './store.server';
const mocks = vi.hoisted(() => ({
  token: undefined as string | undefined,
  cookieSet: vi.fn(),
  from: vi.fn(),
  response: { data: null as unknown, error: null as unknown },
  eq: vi.fn(),
  gt: vi.fn(),
  insert: vi.fn(),
  rpc: vi.fn(),
}));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: () => (mocks.token ? { value: mocks.token } : undefined),
    set: mocks.cookieSet,
  }),
}));
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: mocks.from, rpc: mocks.rpc }),
}));
const id = 'd964c88a-966b-4147-aae1-185f0d86f2dc';
function buildSnapshot() {
  const result = calculateChart(fixture.input);
  if (!result.success) throw new Error('fixture');
  const chart = result.data.chart;
  return parseSnapshot({
    version: 1,
    chart,
    reading: createBasicReading(chart),
    facts: createChartFacts(chart),
    ai: { status: 'not-requested' },
    content: { status: 'ready', entries: [] },
  });
}
const fixtureSnapshot = buildSnapshot();
const snapshot = () => structuredClone(fixtureSnapshot);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.token = 'a'.repeat(64);
  mocks.response = { data: null, error: null };
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('SUPABASE_SECRET_KEY', 'test');
  const chain = {
    select: vi.fn(() => chain),
    eq: mocks.eq,
    gt: mocks.gt,
    insert: mocks.insert,
    update: vi.fn(() => chain),
    maybeSingle: async () => mocks.response,
    then: (resolve: (v: unknown) => void) =>
      Promise.resolve(mocks.response).then(resolve),
  };
  mocks.rpc.mockImplementation(async () => ({
    data: { id, created: true },
    error: mocks.response.error,
  }));
  mocks.from.mockReturnValue(chain);
  mocks.eq.mockReturnValue(chain);
  mocks.gt.mockReturnValue(chain);
  mocks.insert.mockReturnValue(chain);
});
it('stores a validated snapshot and an owner digest, never the owner token', async () => {
  const data = snapshot();
  expect(await saveResult(data, 'b'.repeat(64))).toEqual({ id, created: true });
  const [name, token, options] = mocks.cookieSet.mock.calls[0];
  expect(name).toBe('ziwei-result-owner');
  expect(token).toHaveLength(64);
  expect(options.httpOnly).toBe(true);
  const inserted = mocks.rpc.mock.calls[0][1];
  expect(inserted.p_owner_hash).toBe(
    createHash('sha256').update(token).digest('hex'),
  );
  expect(inserted.p_payload).toEqual(data);
  expect(JSON.stringify(inserted)).not.toContain(token);
});
it('allows link visitors to restore the stored result without ownership', async () => {
  const payload = snapshot();
  mocks.response.data = {
    payload,
    expires_at: '2030-01-01',
    owner_hash: 'other',
  };
  const saved = await loadResult(id);
  expect(saved?.snapshot).toEqual(payload);
  expect(saved?.isOwner).toBe(false);
  expect(mocks.eq).not.toHaveBeenCalledWith('owner_hash', expect.anything());
  expect(mocks.gt).toHaveBeenCalledWith('expires_at', expect.any(String));
});
it('does not query invalid IDs or owner-only reads without credentials', async () => {
  mocks.token = undefined;
  expect(await loadResult('invalid')).toBeNull();
  expect(await loadResult(id, true)).toBeNull();
  expect(mocks.from).not.toHaveBeenCalled();
});
it('constrains owner-only lookup to the current owner', async () => {
  mocks.token = 'a'.repeat(64);
  const hash = createHash('sha256').update(mocks.token).digest('hex');
  await loadResult(id, true);
  expect(mocks.eq).toHaveBeenCalledWith('id', id);
  expect(mocks.eq).toHaveBeenCalledWith('owner_hash', hash);
});
it('does not update absent or unauthorized results', async () => {
  await expect(updateResultAi(id, { status: 'not-requested' })).rejects.toThrow(
    'unavailable',
  );
});
it('distinguishes storage failure from a missing result and rejects invalid snapshots', async () => {
  mocks.response.error = {};
  await expect(loadResult(id)).rejects.toThrow('load failed');
  await expect(saveResult(snapshot(), 'b'.repeat(64))).rejects.toThrow(
    'save failed',
  );
  expect(() =>
    parseSnapshot({ ...snapshot(), birthDate: 'private' }),
  ).toThrow();
});

it('requires an established owner cookie before saving', async () => {
  mocks.token = undefined;
  await expect(saveResult(snapshot(), 'b'.repeat(64))).rejects.toThrow(
    'session unavailable',
  );
  expect(mocks.rpc).not.toHaveBeenCalled();
});
