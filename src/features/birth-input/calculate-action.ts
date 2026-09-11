'use server';

import { calculateChart } from '../../domain/ziwei/calculate-chart.server';
import type { Chart } from '../../domain/ziwei/chart';
import { parseBirthForm, type InputErrors } from './form-input';

export async function calculatePreview(
  form: FormData,
): Promise<
  { success: true; chart: Chart } | { success: false; errors: InputErrors }
> {
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
  return { success: true, chart: result.data.chart };
}
