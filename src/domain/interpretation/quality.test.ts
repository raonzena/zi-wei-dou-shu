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
      const serialized = JSON.stringify(schema);
      expect(serialized).not.toContain('yearly:');
      expect(serialized).not.toContain('monthly:');
      expect(serialized).not.toContain('evidenceIds');

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

  it('잘못된 분야 순서를 거부한다', () => {
    const { evidence } = prepare();
    const reordered = mockExplanation(evidence);
    [reordered.sections[0], reordered.sections[1]] = [
      reordered.sections[1],
      reordered.sections[0],
    ];
    expect(() => validateAiExplanation(reordered, evidence)).toThrow();
  });

  it('각 문단에서 검증한 중복 근거를 처음 등장한 순서대로 집계한다', () => {
    const { evidence } = prepare();
    const value = mockExplanation(evidence);
    const passages = [
      ...value.overview.paragraphs,
      ...value.sections.flatMap((s) => [s.title, ...s.paragraphs]),
      value.closing,
    ];
    for (const p of passages) p.evidence.push({ ...p.evidence[0] });
    const result = validateAiExplanation(value, evidence);
    for (const block of [
      ...result.overview.paragraphs,
      ...result.sections.flatMap((s) => [s.title, ...s.paragraphs]),
      result.closing,
    ]) {
      expect(block.evidence).toHaveLength(1);
    }
    expect(value.overview.paragraphs[0].evidence).toHaveLength(2);
    expect(result.overview.paragraphs[0].text).toBe(
      value.overview.paragraphs[0].text,
    );
  });

  it('같은 ID의 서로 다른 연결 이유를 삭제하지 않는다', () => {
    const { evidence } = prepare();
    const value = mockExplanation(evidence);
    const p = value.overview.paragraphs[0];
    const first = p.evidence[0].interpretation;
    const second =
      '명궁을 생활에서 판단하는 방식과 연결해 설명한 추가 근거입니다.';
    p.evidence.push(
      { ...p.evidence[0], interpretation: second },
      { ...p.evidence[0] },
    );
    const result = validateAiExplanation(value, evidence);
    expect(result.overview.paragraphs[0].evidence).toEqual([
      {
        id: p.evidence[0].id,
        interpretation: `${first} ${second}`,
        relevance: p.evidence[0].relevance,
      },
    ]);
  });

  it.each(['unknown', 'blank', 'orphan-list', 'empty', 'unmatched'])(
    '%s 근거를 거부한다',
    (kind) => {
      const { evidence } = prepare();
      const value = mockExplanation(evidence);
      const p = value.sections[0].paragraphs[0];
      if (kind === 'unknown') p.evidence[0].id = 'invented';
      if (kind === 'blank') p.evidence[0].interpretation = ' ';
      if (kind === 'orphan-list')
        Object.assign(value.sections[0], { evidenceIds: ['chart'] });
      if (kind === 'empty') p.evidence = [];
      if (kind === 'unmatched')
        p.evidence[0].id = evidence.patterns.find((p) => !p.matched)!.id;
      expect(() => validateAiExplanation(value, evidence)).toThrow();
    },
  );

  it('성립하지 않은 격국을 응답 enum에서 제외하고 성립 격국은 허용한다', () => {
    for (const index of [0, 4]) {
      const { evidence } = prepare(index);
      const serialized = JSON.stringify(
        zodTextFormat(aiExplanationSchemaFor(evidence), 'test').schema,
      );
      for (const p of evidence.patterns)
        expect(serialized.includes(p.id)).toBe(p.matched);
    }
  });

  it.each([
    'missing',
    'other-section',
    'blank-reason',
    'duplicate-paragraph',
    'legacy-evidence',
    'empty-relevance',
  ])('%s 조언 참조 또는 근거를 거부한다', (kind) => {
    const { evidence } = prepare();
    const value = mockExplanation(evidence);
    const section = value.sections[1];
    if (kind === 'missing') section.bulletPoints[0].paragraphId = 'p3';
    if (kind === 'other-section') {
      value.sections[0].paragraphs.push({
        ...value.sections[0].paragraphs[0],
        id: 'p2',
      });
      section.bulletPoints[0].paragraphId = 'p2';
    }
    if (kind === 'blank-reason') section.bulletPoints[0].reason = ' ';
    if (kind === 'duplicate-paragraph')
      section.paragraphs.push({ ...section.paragraphs[0] });
    if (kind === 'legacy-evidence')
      Object.assign(section.bulletPoints[0], {
        evidence: section.paragraphs[0].evidence,
      });
    if (kind === 'empty-relevance')
      section.paragraphs[0].evidence[0].relevance = ' ';
    expect(() => validateAiExplanation(value, evidence)).toThrow();
  });

  it('조언은 같은 분야의 실제 문단을 참조하며 빈 조언 목록도 허용한다', () => {
    const { evidence } = prepare();
    const value = mockExplanation(evidence);
    value.sections[1].paragraphs.push({
      ...value.sections[1].paragraphs[0],
      id: 'p2',
    });
    value.sections[1].bulletPoints[0].paragraphId = 'p2';
    const result = validateAiExplanation(value, evidence);
    expect(result.sections[1].bulletPoints[0].paragraphId).toBe('p2');
    expect(result.sections[0].bulletPoints).toEqual([]);
  });

  it.each(['overview', 'title', 'paragraph', 'closing'] as const)(
    '%s는 쉬운 본문과 별도의 근거 설명을 유지한다',
    (kind) => {
      const { evidence } = prepare();
      const value = mockExplanation(evidence);
      const p = {
        overview: value.overview.paragraphs[0],
        title: value.sections[1].title,
        paragraph: value.sections[1].paragraphs[0],
        closing: value.closing,
      }[kind];
      p.text = '결정하기 전에 기준을 정리해 두면 도움이 될 수 있습니다.';
      expect(p.text).not.toContain(p.evidence[0].interpretation);
      const result = validateAiExplanation(value, evidence);
      expect(JSON.stringify(result)).toContain(p.evidence[0].interpretation);
      expect(JSON.stringify(result)).toContain(p.text);
    },
  );

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
    value.sections[0].paragraphs[0].text =
      '근거는 palace:사이며 이 문장은 노출 검사용입니다.';
    expect(evaluateExplanation(value, evidence)).toMatchObject({
      contractPass: true,
      evidencePass: false,
      semanticReview: 'required',
    });
  });
});
