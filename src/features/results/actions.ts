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
  const result = await calculatePreview(calculationForm);
  if (!result.success) return result;
  try {
    const content = await getStarContent();
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
    const { id, created } = await saveResult(
      snapshot,
      resultFingerprint(calculationForm, snapshot, wantsAi),
    );
    if (wantsAi && created) {
      try {
        const explanation = await requestExplanation(chart);
        await updateResultAi(id, explanation);
      } catch {
        /* The saved result remains available for an explicit retry. */
      }
    }
    return { success: true as const, id };
  } catch {
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
