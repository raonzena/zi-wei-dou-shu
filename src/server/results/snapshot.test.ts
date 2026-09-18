import { expect, it } from 'vitest';
import { calculateChart } from '../../domain/ziwei/calculate-chart.server';
import { createBasicReading } from '../../domain/interpretation/basic-reading';
import { createChartFacts } from '../../domain/interpretation/chart-facts.server';
import fixture from '../../domain/ziwei/fixtures/cust-1929.json';
import { parseSnapshot } from './snapshot';

it('기존에 저장한 두 주성 풀이에도 새 예시를 복원한다', () => {
  const calculated = calculateChart(fixture.input);
  if (!calculated.success) throw new Error('fixture');
  const chart = calculated.data.chart;
  const reading = createBasicReading(chart);
  if (!reading.combination) throw new Error('two-star fixture required');
  const legacy = {
    version: 1,
    chart,
    reading: {
      ...reading,
      combination: {
        starNames: reading.combination.starNames,
        heading: reading.combination.heading,
        summary: reading.combination.summary,
        strength: reading.combination.strength,
        caution: reading.combination.caution,
        balance: reading.combination.balance,
      },
    },
    facts: createChartFacts(chart),
    ai: { status: 'not-requested' },
    content: { status: 'ready', entries: [] },
  };

  const parsed = parseSnapshot(legacy);

  expect(
    parseSnapshot({ ...legacy, characterGender: 'female' }).characterGender,
  ).toBe('female');
  expect(() =>
    parseSnapshot({ ...legacy, characterGender: 'invalid' }),
  ).toThrow();

  expect(parsed.reading.combination?.example).toContain('예를 들어');
  expect(parsed.reading.combination?.reflection).toBeTruthy();
  expect(parsed.name).toBeUndefined();
});
