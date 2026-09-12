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
it('본명반 배치만 보내고 시기 자료와 이전 12단계 안내를 제외한다', () => {
  const e = prepare(),
    g = groundedInput(e, []);
  expect(g).not.toHaveProperty('timing');
  expect(g).not.toHaveProperty('yearlyReadingBoundary');
  expect(JSON.stringify(g)).not.toMatch(/(?:decadal|yearly|monthly):/);
  expect(g.palaces).toMatchObject(e.palaces);
  expect(g.palaces.find((p) => p.id === 'palace:묘')!.aliases).toContain(
    '신궁',
  );
  expect(g.palaces.filter((p) => p.aliases.includes('신궁'))).toHaveLength(1);
  expect(g.patterns.every((p) => p.matched)).toBe(true);
  expect(g.bodyPalace).toMatchObject({ natalPalace: '부처', branch: '묘' });
  expect(g.bodyPalace.meaning).toContain('행동과 삶의 관심사');
  expect(g.flyingTransformations).toHaveLength(48);
  for (const f of g.flyingTransformations) {
    expect(f.source.palaceId).toBe(f.sourcePalaceId);
    expect(f.target.palaceId).toBe(f.targetPalaceId);
    expect(f.target.natalMajorStars).toEqual(
      e.palaces
        .find((p) => p.id === f.targetPalaceId)!
        .stars.filter((s) => s.isMajor)
        .map((s) => s.name),
    );
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

it('사용하지 않는 유년 변경은 외부 전송 내용에 영향을 주지 않는다', () => {
  const evidence = prepare();
  const before = groundedInput(evidence, []);
  evidence.timing.yearly.year += 1;
  expect(groundedInput(evidence, [])).toEqual(before);
});
