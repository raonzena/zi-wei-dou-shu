import { describe, expect, it } from 'vitest';
import { Temporal } from '@js-temporal/polyfill';
import { zodTextFormat } from 'openai/helpers/zod';
import { calculateChart } from '../ziwei/calculate-chart.server';
import { consultationEvidence, evidenceIds } from './consultation-evidence';
import { createChartFacts } from './chart-facts.server';
import {
  aiExplanationSchemaFor,
  validateAiExplanation,
} from './ai-explanation';
import { evaluationCases } from './fixtures/evaluation-cases';
import { mockExplanation } from './fixtures/mock-explanation';
import { evaluateExplanation } from './quality';

function prepare(index = 0) {
  const testCase = evaluationCases[index];
  const result = calculateChart(
    testCase.input,
    Temporal.Instant.from(testCase.now),
  );
  if (!result.success) throw new Error(result.error.code);
  return {
    chart: result.data.chart,
    evidence: consultationEvidence(result.data.chart),
  };
}
describe('고정 평가 사례와 서버 표시 계약', () => {
  it.each(evaluationCases.map((c, i) => [c.id, i] as const))(
    '%s의 조건과 월별 필수 스키마를 검증한다',
    (_, index) => {
      const { chart, evidence } = prepare(index);
      const expected = evaluationCases[index].expected;
      expect(chart.timing.monthly).toHaveLength(expected.months);
      if ('soul' in expected)
        expect(chart.soulPalaceBranch).toBe(expected.soul);
      if ('mainStars' in expected)
        expect(
          chart.palaces
            .find((p) => p.name === '명궁')!
            .stars.filter((s) => s.isMajor),
        ).toHaveLength(expected.mainStars);
      if ('pattern' in expected)
        expect(
          evidence.patterns.filter((p) => p.matched).map((p) => p.id),
        ).toEqual(expected.pattern ? [expected.pattern] : []);
      const schema = zodTextFormat(
        aiExplanationSchemaFor(evidence),
        'evaluation',
      ).schema;
      const monthly = (
        schema.properties as Record<
          string,
          { required: string[]; additionalProperties: boolean }
        >
      ).monthly;
      expect(monthly.required).toEqual(chart.timing.monthly.map((m) => m.id));
      expect(monthly.additionalProperties).toBe(false);
      const facts = createChartFacts(chart);
      expect(new Set(Object.keys(facts.references))).toEqual(
        evidenceIds(evidence),
      );
      expect(facts.supported.join(' ')).toContain(
        `유월 ${expected.months}구간`,
      );
      expect(JSON.stringify(facts)).not.toMatch(
        /rawDates|solarDate|"gender"|"hour"|"minute"/,
      );
      expect(
        validateAiExplanation(mockExplanation(evidence), evidence).monthly,
      ).toHaveLength(expected.months);
    },
  );
  it('윤달 전·후반의 날짜를 서버가 구분하고 AI의 키 순서를 신뢰하지 않는다', () => {
    const { chart, evidence } = prepare(1);
    const value = mockExplanation(evidence);
    value.monthly = Object.fromEntries(Object.entries(value.monthly).reverse());
    expect(
      validateAiExplanation(value, evidence).monthly.map((m) => m.periodId),
    ).toEqual(chart.timing.monthly.map((m) => m.id));
    const facts = createChartFacts(chart);
    const leap = chart.timing.monthly.filter((m) => m.isLeapMonth);
    expect(leap.map((m) => facts.references[m.id])).toEqual([
      '2025년 윤6월 1–15일 · iztro 음력',
      '2025년 윤6월 16–29일 · iztro 음력',
    ]);
  });
  it('자화의 출발·도착과 사용자가 읽는 시기 이름을 서버가 생성한다', () => {
    const { chart } = prepare();
    const facts = createChartFacts(chart);
    expect(facts.references['flying:사:0']).toBe(
      '명궁 → 명궁 · 무곡 화록 · 자화',
    );
    expect(facts.references['decadal:93']).toBe('대한 93–102세 · 2021–2030년');
    expect(facts.references['pattern:zi-fu-tong-gong']).toContain('불일치');
    expect(facts.source).toContain('iztro 2.6.1');
  });
});
describe('월 누락·위조·품질 회귀', () => {
  it.each(['missing', 'extra', 'blank', 'date', 'foreign', 'legacy'] as const)(
    '%s 월별 응답을 거부한다',
    (kind) => {
      const { evidence } = prepare(1);
      const value = mockExplanation(evidence);
      const id = evidence.timing.monthly.find((m) => m.part === 'second')!.id;
      if (kind === 'missing') delete value.monthly[id];
      if (kind === 'extra') value.monthly['unknown'] = value.monthly[id];
      if (kind === 'blank') value.monthly[id].interpretation = '   ';
      if (kind === 'date')
        Object.assign(value.monthly[id], { title: '양력 6월' });
      if (kind === 'foreign')
        value.monthly[id].interpretation =
          'yearly:1800이라는 다른 해를 분석한 내용입니다.';
      if (kind === 'legacy') Object.assign(value, { monthly: [] });
      expect(() => validateAiExplanation(value, evidence)).toThrow();
      expect(evaluateExplanation(value, evidence).evidencePass).toBe(false);
    },
  );
  it('의미 평가는 자동 통과시키지 않고 완전 중복 문단을 검토 대상으로 남긴다', () => {
    const { evidence } = prepare();
    const value = mockExplanation(evidence);
    expect(evaluateExplanation(value, evidence)).toMatchObject({
      contractPass: true,
      evidencePass: true,
      semanticReview: 'required',
      reviewFlags: [],
    });
    const months = Object.keys(value.monthly);
    value.monthly[months[1]].interpretation =
      value.monthly[months[0]].interpretation;
    expect(evaluateExplanation(value, evidence).reviewFlags).toHaveLength(1);
  });
});

it('월별 필드가 완전해도 본문 근거 검사가 실패하면 별도로 기록한다', () => {
  const { evidence } = prepare();
  const value = mockExplanation(evidence);
  value.sections[0].paragraphs[0].check = '근거는 yearly:2026의 명궁입니다.';
  expect(evaluateExplanation(value, evidence)).toMatchObject({
    contractPass: true,
    evidencePass: false,
    monthlyCoverage: 12,
    semanticReview: 'required',
  });
});

it('유년 단계에 궁간 사화나 현재가 아닌 대한을 끼워 넣지 못한다', () => {
  const { evidence } = prepare();
  for (const id of ['flying:오:0', 'decadal:3']) {
    const value = mockExplanation(evidence);
    value.sections
      .find((s) => s.step === 11)!
      .paragraphs[0].evidenceIds.push(id);
    expect(() => validateAiExplanation(value, evidence)).toThrow();
  }
});
