'use server';

import { resultFingerprint } from '../../server/results/fingerprint.server';
import type { ResultSnapshot } from '../../server/results/snapshot';
import { calculatePreview } from '../birth-input/calculate-action';
import { getStarContent } from '../../server/content/star-content.server';
import {
  saveResult,
  loadResult,
  updateResultAi,
} from '../../server/results/store.server';
import { isAiExplanationEnabled } from '../../server/interpretation/availability';
import { requestExplanation } from '../../server/interpretation/request.server';
import type { AiExplanationResult } from '../../domain/interpretation/ai-explanation';
import { parseDisplayName } from '../birth-input/form-input';

export async function createSavedResult(form: FormData) {
  const aiValues = form.getAll('includeAi');
  if (aiValues.length > 1 || (aiValues.length === 1 && aiValues[0] !== 'on'))
    return {
      success: false as const,
      errors: { input: 'AI 설명 선택을 확인해주세요.' },
    };
  const wantsAi = aiValues[0] === 'on' && isAiExplanationEnabled();
  const parsedName = parseDisplayName(form);
  if (!parsedName.success) return parsedName;
  const calculationForm = new FormData();
  for (const [key, value] of form)
    if (key !== 'includeAi' && key !== 'name')
      calculationForm.append(key, value);
  const started = performance.now();
  const timings: Record<string, number> = {};
  const measured = async <T>(name: string, operation: () => Promise<T>) => {
    const stageStarted = performance.now();
    try {
      return await operation();
    } finally {
      timings[name] = Math.round(performance.now() - stageStarted);
    }
  };
  const log = (outcome: string) =>
    console.info(
      JSON.stringify({
        event: 'result_generation',
        outcome,
        durationMs: Math.round(performance.now() - started),
        stages: timings,
      }),
    );
  const [result, content] = await Promise.all([
    measured('calculationMs', () => calculatePreview(calculationForm)),
    measured('starContentMs', getStarContent),
  ]);
  if (!result.success) {
    log('invalid-input');
    return result;
  }
  try {
    const { chart, reading, facts } = result;
    const ai: AiExplanationResult = wantsAi
      ? {
          status: 'error',
          code: 'provider',
          message: '설명을 완성하지 못했습니다. 다시 시도할 수 있습니다.',
          retryable: true,
        }
      : { status: 'not-requested' };
    const snapshot: ResultSnapshot = {
      version: 1,
      name: parsedName.name,
      chart,
      reading,
      facts,
      ai,
      content,
    };
    const fingerprint = await measured('fingerprintMs', async () =>
      resultFingerprint(calculationForm, snapshot, wantsAi),
    );
    const { id, created } = await measured('saveMs', () =>
      saveResult(snapshot, fingerprint),
    );
    if (wantsAi && created) {
      try {
        const explanation = await measured('aiMs', () =>
          requestExplanation(chart),
        );
        await measured('aiSaveMs', () => updateResultAi(id, explanation));
      } catch {
        /* The saved result remains available for an explicit retry. */
      }
    }
    log(created ? 'created' : 'reused');
    return { success: true as const, id };
  } catch {
    log('storage-error');
    return {
      success: false as const,
      errors: {
        input:
          '결과를 저장하지 못했습니다. 입력값은 유지됩니다. 잠시 후 다시 시도해주세요.',
      },
    };
  }
}
export async function retrySavedExplanation(
  id: string,
): Promise<AiExplanationResult> {
  try {
    const saved = await loadResult(id, true);
    if (!saved || !isAiExplanationEnabled()) throw new Error('Unavailable');
    if (saved.snapshot.ai.status !== 'error' || !saved.snapshot.ai.retryable)
      return saved.snapshot.ai;
    const ai = await requestExplanation(saved.snapshot.chart);
    await updateResultAi(id, ai);
    return ai;
  } catch {
    return {
      status: 'error',
      code: 'unavailable',
      message: '설명을 다시 준비하지 못했습니다. 잠시 후 다시 시도해주세요.',
      retryable: true,
    };
  }
}
