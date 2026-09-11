import 'server-only';
import { headers } from 'next/headers';
import type { Chart } from '../../domain/ziwei/chart';
import type { AiExplanationResult } from '../../domain/interpretation/ai-explanation';
import { consultationEvidence } from '../../domain/interpretation/consultation-evidence';
import { isAiExplanationEnabled } from './availability';
import {
  explainChart,
  explanationModel,
  explanationPromptVersion,
} from './explain.server';
import { actorAddress, privateDigest } from './controls/identity';
import { usageStore } from './controls/store.server';
import {
  estimatedMicrousd,
  validUsage,
  type TokenUsage,
} from './controls/usage';

function unavailable(): AiExplanationResult {
  return {
    status: 'error',
    code: 'unavailable',
    message: '설명 서비스를 준비하고 있습니다. 기본 풀이는 확인할 수 있습니다.',
    retryable: false,
  };
}
function positiveInteger(name: string, fallback: number) {
  const value = process.env[name];
  const parsed = value === undefined ? fallback : Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1)
    throw new Error('Invalid limit');
  return parsed;
}
export async function requestExplanation(
  chart: Chart,
): Promise<AiExplanationResult> {
  if (!isAiExplanationEnabled()) return { status: 'not-requested' };
  if (!process.env.OPENAI_API_KEY?.trim()) return unavailable();
  let store: ReturnType<typeof usageStore>;
  let id: string;
  try {
    const secret = process.env.AI_USAGE_HMAC_SECRET?.trim();
    if (!secret || secret.length < 32) return unavailable();
    const actor = actorAddress(await headers(), process.env.VERCEL === '1');
    if (!actor) return unavailable();
    const actorHash = privateDigest(secret, 'actor', actor);
    const fingerprint = privateDigest(
      secret,
      'request',
      JSON.stringify({
        actorHash,
        model: explanationModel,
        prompt: explanationPromptVersion,
        evidence: consultationEvidence(chart),
      }),
    );
    store = usageStore();
    const admission = await store.reserve({
      p_actor: actorHash,
      p_fingerprint: fingerprint,
      p_model: explanationModel,
      p_prompt: explanationPromptVersion,
      p_hourly_limit: positiveInteger('AI_HOURLY_LIMIT', 3),
      p_daily_limit: positiveInteger('AI_DAILY_LIMIT', 20),
      p_daily_budget: positiveInteger('AI_DAILY_BUDGET_MICROUSD', 2_000_000),
    });
    if (!admission.allowed) {
      console.info(
        JSON.stringify({ event: 'ai_admission', outcome: admission.reason }),
      );
      return {
        status: 'error',
        code: 'rate-limit',
        retryable: false,
        message:
          admission.reason === 'duplicate'
            ? '최근 같은 정보로 해석을 요청했습니다. 열려 있는 결과를 확인하거나 10분 뒤 다시 시도해주세요.'
            : admission.reason === 'hourly'
              ? '시간당 설명 요청 한도에 도달했습니다. 잠시 후 다시 이용해주세요.'
              : '오늘 제공할 수 있는 설명 한도에 도달했습니다. 기본 풀이는 확인할 수 있습니다.',
      };
    }
    id = admission.id;
  } catch {
    console.warn(
      JSON.stringify({ event: 'ai_admission', outcome: 'unavailable' }),
    );
    return unavailable();
  }
  const started = performance.now();
  let usage: TokenUsage | undefined;
  let result: AiExplanationResult;
  try {
    result = await explainChart(chart, (value) => {
      if (validUsage(value)) usage = value;
    });
  } catch {
    result = {
      status: 'error',
      code: 'provider',
      message: '설명을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.',
      retryable: false,
    };
  }
  const duration = Math.round(performance.now() - started);
  const outcome =
    result.status === 'ready'
      ? 'ready'
      : result.status === 'error'
        ? result.code
        : 'unavailable';
  // Log only allowlisted operations data; never actor/fingerprint, prompt, chart or provider errors.
  console.info(
    JSON.stringify({
      event: 'ai_generation',
      requestId: id,
      model: explanationModel,
      promptVersion: explanationPromptVersion,
      outcome,
      durationMs: duration,
      usage: usage ?? null,
      estimatedMicrousd: usage ? estimatedMicrousd(usage) : null,
    }),
  );
  try {
    await store.finish({
      p_id: id,
      p_outcome: outcome,
      p_duration_ms: duration,
      p_input: usage?.input ?? null,
      p_cached: usage?.cached ?? null,
      p_output: usage?.output ?? null,
    });
  } catch {
    // The database reservation remains charged; a logging outage never grants more budget.
    console.error(
      JSON.stringify({
        event: 'ai_settlement',
        requestId: id,
        outcome: 'failed',
      }),
    );
  }
  return result;
}
