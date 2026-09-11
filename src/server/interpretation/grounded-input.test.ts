import { it, expect, afterEach, vi } from 'vitest';
import { Temporal } from '@js-temporal/polyfill';
import { calculateChart } from '../../domain/ziwei/calculate-chart.server';
import { consultationEvidence } from '../../domain/interpretation/consultation-evidence';
import { validateTransformationClaims } from '../../domain/interpretation/transformation-claims';
import { evaluationCases } from '../../domain/interpretation/fixtures/evaluation-cases';
import { groundedInput } from './grounded-input';
import { isAiExplanationEnabled } from './availability';
function prepare() {
  const c = evaluationCases[0];
  const r = calculateChart(c.input, Temporal.Instant.from(c.now));
  if (!r.success) throw new Error('Calculation failed');
  return consultationEvidence(r.data.chart);
}
afterEach(() => vi.unstubAllEnvs());
it('대한·유년의 궁과 별을 서버에서 연결해 배열 추론을 없앤다', () => {
  const e = prepare(),
    g = groundedInput(e);
  expect(g.timing.yearly).not.toHaveProperty('palaceNames');
  expect(
    g.timing.decadals.find((d) => d.id === 'decadal:93')!.soulPalace,
  ).toMatchObject({
    natalPalace: '전택',
    natalMajorStars: ['천기', '태음'],
    timingPalace: '명궁',
  });
  expect(
    g.timing.yearly.transformations.find((t) => t.type === '록'),
  ).toMatchObject({ starName: '천동', natalPalace: '형제' });
  expect(
    g.timing.yearly.transformations.find((t) => t.type === '기'),
  ).toMatchObject({ starName: '염정', natalPalace: '재백' });
  for (const layer of [
    ...g.timing.decadals,
    g.timing.yearly,
    ...g.timing.monthly,
  ]) {
    expect(layer.placements).toHaveLength(12);
    for (const t of layer.transformations)
      expect(
        e.palaces
          .find((p) => p.id === t.palaceId)!
          .stars.some((s) => s.name === t.starName),
      ).toBe(true);
  }
});
it('실제 관찰한 유년·대한 사화 혼동을 거부하고 계산된 쌍은 허용한다', () => {
  const e = prepare();
  expect(() =>
    validateTransformationClaims(
      '태양 록이 명궁에 작용합니다.',
      ['yearly:2026'],
      e,
    ),
  ).toThrow();
  expect(() =>
    validateTransformationClaims(
      '천량 화과와 문곡 화기가 함께 작용합니다.',
      ['decadal:93'],
      e,
    ),
  ).toThrow();
  expect(() =>
    validateTransformationClaims(
      '천동 화록과 염정 화기를 참고합니다.',
      ['yearly:2026'],
      e,
    ),
  ).not.toThrow();
  expect(() =>
    validateTransformationClaims('무곡과 파군의 뜻입니다.', ['yearly:2026'], e),
  ).not.toThrow();
});
it('AI는 기본 활성화되며 서버 플래그 false로 중단할 수 있다', () => {
  vi.stubEnv('AI_EXPLANATION_ENABLED', undefined);
  expect(isAiExplanationEnabled()).toBe(true);
  vi.stubEnv('AI_EXPLANATION_ENABLED', 'false');
  expect(isAiExplanationEnabled()).toBe(false);
  vi.stubEnv('AI_EXPLANATION_ENABLED', 'true');
  expect(isAiExplanationEnabled()).toBe(true);
});

it('유년 명궁이 있는 궁의 천간과 연간이 다름을 명시한다', () => {
  const e = prepare(),
    g = groundedInput(e);
  const natalFlying = e.flyingTransformations.find(
    (f) => f.sourcePalaceId === e.timing.yearly.soulPalaceId && f.type === '록',
  )!;
  expect(natalFlying).toMatchObject({ heavenlyStem: '경', starName: '태양' });
  expect(g.yearlyReadingBoundary.yearStem).toBe('병');
  expect(g.yearlyReadingBoundary.transformationStatements).toContain(
    '2026년 유년 사화: 천동 화록 · 본명반 형제궁 · 진 위치',
  );
  expect(
    g.yearlyReadingBoundary.transformationStatements.join(' '),
  ).not.toContain('태양 화록');
});
