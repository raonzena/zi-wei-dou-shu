import { getStarContent } from '../content/star-content.server';
import { expect, it } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { Temporal } from '@js-temporal/polyfill';
import { calculateChart } from '../../domain/ziwei/calculate-chart.server';
import { evaluationCases } from '../../domain/interpretation/fixtures/evaluation-cases';
import { consultationEvidence } from '../../domain/interpretation/consultation-evidence';
import { evaluateExplanation } from '../../domain/interpretation/quality';
import {
  explainChart,
  explanationModel,
  explanationPromptVersion,
} from './explain.server';

// Paid, opt-in integration check. Regular pnpm test never calls the provider.
it.skipIf(process.env.ZIWEI_LIVE_EVAL !== '1')(
  '선택한 고정 사례를 최대 한 번 실호출하고 평가 자료를 저장한다',
  async () => {
    const selected = evaluationCases.find(
      (c) => c.id === process.env.ZIWEI_EVAL_CASE,
    );
    if (!selected) throw new Error('Choose one documented ZIWEI_EVAL_CASE');
    if (process.env.OPENAI_BASE_URL)
      throw new Error('Live evaluation requires the default OpenAI endpoint');
    process.loadEnvFile('.env.local');
    if (process.env.OPENAI_BASE_URL)
      throw new Error('Live evaluation requires the default OpenAI endpoint');
    const chart = calculateChart(
      selected.input,
      Temporal.Instant.from(selected.now),
    );
    if (!chart.success) throw new Error('Evaluation case calculation failed');
    const evidence = consultationEvidence(chart.data.chart);
    const published = await getStarContent();
    if (published.status !== 'ready' || !published.entries.length)
      throw new Error('Published content required');
    const original = globalThis.fetch;
    let calls = 0;
    let usage: unknown;
    let providerOutput: unknown;
    let providerStatus: unknown;
    let providerError: unknown;
    let generated: unknown;
    globalThis.fetch = async (...args) => {
      if (++calls > 1) throw new Error('Live evaluation call limit exceeded');
      const response = await original(...args);
      const body = await response.clone().json();
      usage = body.usage;
      providerStatus = response.status;
      if (body.error)
        providerError = { code: body.error.code, type: body.error.type };
      providerOutput = body.output?.filter(
        (item: { type: string }) => item.type === 'message',
      );
      const message = body.output?.find(
        (item: { type: string }) => item.type === 'message',
      );
      const content = message?.content?.find(
        (item: { type: string }) => item.type === 'output_text',
      );
      if (content) {
        try {
          generated = JSON.parse(content.text);
        } catch {
          generated = undefined;
        }
      }
      return response;
    };
    const started = performance.now();
    try {
      const result = await explainChart(chart.data.chart, published.entries);
      const report = {
        caseId: selected.id,
        model: explanationModel,
        promptVersion: explanationPromptVersion,
        calls,
        providerStatus,
        providerError,
        resultCode: result.status === 'error' ? result.code : undefined,
        durationMs: Math.round(performance.now() - started),
        usage,
        resultStatus: result.status,
        checks: evaluateExplanation(generated, evidence),
        semanticReview: { status: 'pending', rubric: 'ai-quality-v1' },
        providerOutput,
      };
      mkdirSync('work/ai-evaluations', { recursive: true });
      const path = `work/ai-evaluations/${selected.id}-${Date.now()}.json`;
      writeFileSync(path, JSON.stringify(report, null, 2), { mode: 0o600 });
      console.log(JSON.stringify({ path, calls, resultStatus: result.status }));
      expect(calls).toBe(1);
      expect(result.status).toBe('ready');
    } finally {
      globalThis.fetch = original;
    }
  },
  160_000,
);
