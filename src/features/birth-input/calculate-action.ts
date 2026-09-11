'use server';

import {
  createChartFacts,
  type ChartFactsData,
} from '../../domain/interpretation/chart-facts.server';
import { isAiExplanationEnabled } from '../../server/interpretation/availability';
import { explainChart } from '../../server/interpretation/explain.server';
import type { AiExplanationResult } from '../../domain/interpretation/ai-explanation';
import { calculateChart } from '../../domain/ziwei/calculate-chart.server';
import {
  createBasicReading,
  type BasicReading,
} from '../../domain/interpretation/basic-reading';
import type { Chart } from '../../domain/ziwei/chart';
import { parseBirthForm, type InputErrors } from './form-input';

export async function calculatePreview(form: FormData): Promise<
  | {
      success: true;
      chart: Chart;
      reading: BasicReading;
      facts: ChartFactsData;
      ai: AiExplanationResult;
    }
  | { success: false; errors: InputErrors }
> {
  const aiValues = form.getAll('includeAi');
  if (aiValues.length > 1 || (aiValues.length === 1 && aiValues[0] !== 'on'))
    return {
      success: false,
      errors: { input: 'AI 설명 선택을 확인해주세요.' },
    };
  const parsed = parseBirthForm(form);
  if (!parsed.success) return parsed;
  const result = calculateChart(parsed.input);
  if (!result.success)
    return {
      success: false,
      errors: {
        ['field' in result.error ? result.error.field : 'input']:
          result.error.message,
      },
    };
  // Anonymous, stateless calculation: no stored resource or ownership credentials.
  // Do not return the private birth normalization data across this boundary.
  try {
    const reading = createBasicReading(result.data.chart);
    const facts = createChartFacts(result.data.chart);
    const ai: AiExplanationResult =
      isAiExplanationEnabled() && aiValues[0] === 'on'
        ? await explainChart(result.data.chart)
        : { status: 'not-requested' };
    return { success: true, chart: result.data.chart, reading, facts, ai };
  } catch {
    return {
      success: false,
      errors: {
        input: '기본 풀이를 준비하지 못했습니다. 잠시 후 다시 시도해주세요.',
      },
    };
  }
}
