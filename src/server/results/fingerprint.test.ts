import { beforeEach, expect, it, vi } from 'vitest';
import { resultFingerprint } from './fingerprint.server';
import type { ResultSnapshot } from './snapshot';
import { calculateChart } from '../../domain/ziwei/calculate-chart.server';
import { createBasicReading } from '../../domain/interpretation/basic-reading';
import { createChartFacts } from '../../domain/interpretation/chart-facts.server';
import fixture from '../../domain/ziwei/fixtures/cust-1929.json';
const calculated = calculateChart(fixture.input);
if (!calculated.success) throw new Error('fixture');
const chart = calculated.data.chart;
const snapshot: ResultSnapshot = {
  version: 1,
  name: '설화',
  chart,
  reading: createBasicReading(chart),
  facts: createChartFacts(chart),
  ai: { status: 'not-requested' },
  content: { status: 'ready', entries: [] },
};
function form(overrides: Record<string, string> = {}) {
  const result = new FormData();
  for (const [key, value] of Object.entries({ ...fixture.input, ...overrides }))
    result.set(key, String(value));
  return result;
}
beforeEach(() => vi.stubEnv('AI_USAGE_HMAC_SECRET', 'a'.repeat(64)));
it('normalizes equivalent solar and lunar inputs and ignores numeric formatting', () => {
  const expected = resultFingerprint(form(), snapshot, false);
  expect(expected).toMatch(/^[a-f0-9]{64}$/);
  expect(resultFingerprint(form({ month: '04' }), snapshot, false)).toBe(
    expected,
  );
  expect(
    resultFingerprint(
      form({ calendar: 'lunar', month: '3', day: '16' }),
      snapshot,
      false,
    ),
  ).toBe(expected);
});
it('separates exact birth time, gender, AI mode and revised readings', () => {
  const expected = resultFingerprint(form(), snapshot, false);
  expect(resultFingerprint(form({ minute: '1' }), snapshot, false)).not.toBe(
    expected,
  );
  expect(
    resultFingerprint(form({ gender: 'female' }), snapshot, false),
  ).not.toBe(expected);
  expect(resultFingerprint(form(), snapshot, true)).not.toBe(expected);
  expect(
    resultFingerprint(form(), { ...snapshot, name: '다인' }, false),
  ).not.toBe(expected);
  expect(
    resultFingerprint(
      form(),
      { ...snapshot, reading: { ...snapshot.reading, version: 'updated' } },
      false,
    ),
  ).not.toBe(expected);
  const changed = structuredClone(snapshot);
  changed.facts.formatVersion = 'changed';
  expect(resultFingerprint(form(), changed, false)).not.toBe(expected);
  expect(
    resultFingerprint(
      form(),
      { ...snapshot, content: { status: 'unavailable' } },
      false,
    ),
  ).not.toBe(expected);
});
it('separates the reference period and content revision', () => {
  const changed = structuredClone(snapshot);
  changed.chart.timing.yearly = { ...changed.chart.timing.yearly, year: 2099 };
  expect(resultFingerprint(form(), changed, false)).not.toBe(
    resultFingerprint(form(), snapshot, false),
  );
  const entry = {
    star_key: 'major:자미',
    version: 1,
    title: '자미',
    translation: '설명',
    translation_kind: 'adaptation' as const,
    source_url: 'https://iztro.com/learn/major-star',
    source_version: 'original',
    license: 'MIT',
  };
  const first = {
    ...snapshot,
    content: { status: 'ready' as const, entries: [entry] },
  };
  const second = {
    ...snapshot,
    content: { status: 'ready' as const, entries: [{ ...entry, version: 2 }] },
  };
  expect(resultFingerprint(form(), first, false)).not.toBe(
    resultFingerprint(form(), second, false),
  );
});
it('fails closed for missing secrets and invalid birth inputs', () => {
  expect(() =>
    resultFingerprint(form({ day: '99' }), snapshot, false),
  ).toThrow();
  vi.stubEnv('AI_USAGE_HMAC_SECRET', '');
  expect(() => resultFingerprint(form(), snapshot, false)).toThrow(
    'identity unavailable',
  );
});
