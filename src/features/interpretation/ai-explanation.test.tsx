import { it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Temporal } from '@js-temporal/polyfill';
import { AiExplanation } from './ai-explanation';
import { calculateChart } from '../../domain/ziwei/calculate-chart.server';
import { consultationEvidence } from '../../domain/interpretation/consultation-evidence';
import { createChartFacts } from '../../domain/interpretation/chart-facts.server';
import { mockExplanation } from '../../domain/interpretation/fixtures/mock-explanation';
import { validateAiExplanation } from '../../domain/interpretation/ai-explanation';
import { evaluationCases } from '../../domain/interpretation/fixtures/evaluation-cases';

vi.mock('./styles.css', () => ({
  evidence: 'evidence',
  evidenceSummary: 'summary',
  evidenceReason: 'reason',
  reading: 'reading',
  eyebrow: 'eyebrow',
  retry: 'retry',
  overview: 'overview',
  readingSection: 'section',
  closing: 'closing',
}));
vi.mock('./evidence-reference', () => ({
  EvidenceReference: () => <span>명반 배치</span>,
}));

it('쉬운 풀이 밖의 연결 설명을 기본으로 접힌 풀이 근거에만 표시한다', () => {
  const c = evaluationCases[0];
  const calculated = calculateChart(c.input, Temporal.Instant.from(c.now));
  if (!calculated.success) throw new Error('Fixture calculation failed');
  const chart = calculated.data.chart;
  const evidence = consultationEvidence(chart);
  const raw = mockExplanation(evidence);
  const text = '중요한 결정을 내리기 전에 기준을 정리해 두면 도움이 됩니다.';
  raw.sections[0].paragraphs[0].text = text;
  const reason =
    '명궁을 기본 성향으로 읽어 판단 기준을 세우는 조언에 연결했습니다.';
  raw.sections[0].paragraphs[0].evidence[0].interpretation = reason;
  const html = renderToStaticMarkup(
    <AiExplanation
      result={{
        status: 'ready',
        model: 'test',
        promptVersion: 'test',
        ...validateAiExplanation(raw, evidence),
      }}
      chart={chart}
      facts={createChartFacts(chart)}
      pending={false}
      onRetry={() => {}}
    />,
  );
  expect(html).toContain(text);
  expect(html).toContain(reason);
  expect(html).toContain('풀이 근거');
  expect(html).toContain('문단 1');
  expect(html).toContain('조언 1 · 문단 1에서 이어지는 조언');
  expect(html).toContain('이 주제와의 관련성');
  expect(html).toContain(raw.sections[1].bulletPoints[0].reason);
  expect(html.replace(/<details[\s\S]*?<\/details>/g, '')).not.toContain(
    raw.sections[1].bulletPoints[0].reason,
  );
  expect(html).not.toMatch(/<details[^>]*\bopen(?:[=>\s])/);
  expect(html.replace(/<details[\s\S]*?<\/details>/g, '')).not.toContain(
    reason,
  );
  expect(html).not.toContain('palace:');
});
