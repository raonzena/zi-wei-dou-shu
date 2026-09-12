import { describe, expect, it } from 'vitest';
import { Temporal } from '@js-temporal/polyfill';
import { zodTextFormat } from 'openai/helpers/zod';
import { calculateChart } from '../ziwei/calculate-chart.server';
import { consultationEvidence, evidenceIds } from './consultation-evidence';
import { createChartFacts } from './chart-facts.server';
import {
  aiExplanationSchemaFor,
  readingSections,
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

describe('간결한 상담 결과 계약', () => {
  it.each(evaluationCases.map((c, i) => [c.id, i] as const))(
    '%s를 일곱 분야 형식으로 검증한다',
    (_, index) => {
      const { chart, evidence } = prepare(index);
      const expected = evaluationCases[index].expected;
      expect(chart.timing.monthly).toHaveLength(expected.months);
      if ('soul' in expected)
        expect(chart.soulPalaceBranch).toBe(expected.soul);
      if ('mainStars' in expected)
        expect(
          chart.palaces
            .find((palace) => palace.name === '명궁')!
            .stars.filter((star) => star.isMajor),
        ).toHaveLength(expected.mainStars);

      const schema = zodTextFormat(
        aiExplanationSchemaFor(evidence),
        'evaluation',
      ).schema;
      expect(schema.required).toEqual(['overview', 'sections', 'closing']);
      expect(schema.properties).not.toHaveProperty('monthly');
      const allowed = (
        schema.properties as Record<
          string,
          {
            items: {
              properties: { evidenceIds: { items: { enum: string[] } } };
            };
          }
        >
      ).sections.items.properties.evidenceIds.items.enum;
      expect(allowed.some((id) => id.startsWith('yearly:'))).toBe(false);
      expect(allowed.some((id) => id.startsWith('monthly:'))).toBe(false);

      const result = validateAiExplanation(mockExplanation(evidence), evidence);
      expect(result.sections.map((section) => section.id)).toEqual(
        readingSections.map((section) => section.id),
      );

      const facts = createChartFacts(chart);
      expect(new Set(Object.keys(facts.references))).toEqual(
        evidenceIds(evidence),
      );
      expect(JSON.stringify(facts)).not.toMatch(
        /rawDates|solarDate|"gender"|"hour"|"minute"/,
      );
    },
  );

  it.each(['missing', 'extra', 'legacy'] as const)(
    '%s 형식의 이전·불완전 응답을 거부한다',
    (kind) => {
      const { evidence } = prepare();
      const value = mockExplanation(evidence);
      if (kind === 'missing') value.sections.pop();
      if (kind === 'extra') value.sections.push(value.sections[0]);
      if (kind === 'legacy') Object.assign(value, { monthly: {} });
      expect(() => validateAiExplanation(value, evidence)).toThrow();
      expect(evaluateExplanation(value, evidence).evidencePass).toBe(false);
    },
  );

  it('분야 순서와 중복 근거를 거부한다', () => {
    const { evidence } = prepare();
    const reordered = mockExplanation(evidence);
    [reordered.sections[0], reordered.sections[1]] = [
      reordered.sections[1],
      reordered.sections[0],
    ];
    expect(() => validateAiExplanation(reordered, evidence)).toThrow();

    const duplicate = mockExplanation(evidence);
    duplicate.sections[0].evidenceIds = ['chart', 'chart'];
    expect(() => validateAiExplanation(duplicate, evidence)).toThrow();
  });

  it('의미 평가는 자동 통과시키지 않고 완전 중복 문단을 표시한다', () => {
    const { evidence } = prepare();
    const value = mockExplanation(evidence);
    expect(evaluateExplanation(value, evidence)).toMatchObject({
      contractPass: true,
      evidencePass: true,
      semanticReview: 'required',
      reviewFlags: [],
    });
    value.sections[1].paragraphs[0] = value.sections[0].paragraphs[0];
    expect(evaluateExplanation(value, evidence).reviewFlags).toHaveLength(1);
  });

  it('사용자 문장에 내부 근거 ID가 노출되면 거부한다', () => {
    const { evidence } = prepare();
    const value = mockExplanation(evidence);
    value.sections[0].paragraphs[0] =
      '근거는 palace:사이며 이 문장은 노출 검사용입니다.';
    expect(evaluateExplanation(value, evidence)).toMatchObject({
      contractPass: true,
      evidencePass: false,
      semanticReview: 'required',
    });
  });
});
