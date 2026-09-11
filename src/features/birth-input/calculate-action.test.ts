import { describe, expect, it } from 'vitest';
import { calculatePreview } from './calculate-action';
import { parseBirthForm } from './form-input';

function form(values: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    calendar: 'solar',
    year: '2000',
    month: '8',
    day: '16',
    hour: '12',
    minute: '0',
    gender: 'female',
    ...values,
  }))
    data.set(key, value);
  return data;
}
describe('birth form server boundary', () => {
  it.each(['hour', 'minute'])(
    'does not convert blank %s into midnight',
    (key) => {
      const result = parseBirthForm(form({ [key]: '' }));
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.errors[key as 'hour' | 'minute']).toBeDefined();
    },
  );
  it('rejects duplicated numeric values', async () => {
    const data = form();
    data.append('hour', '23');
    expect((await calculatePreview(data)).success).toBe(false);
  });
  it('rejects impossible dates even when client validation is bypassed', async () => {
    const result = await calculatePreview(form({ month: '2', day: '30' }));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.day).toContain('1~29');
  });
  it('rejects nonexistent historical civil time', async () => {
    const result = await calculatePreview(
      form({ year: '1988', month: '5', day: '8', hour: '2', minute: '30' }),
    );
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.time).toBeDefined();
  });
  it('returns only the chart, excluding normalized birth data', async () => {
    const result = await calculatePreview(form());
    expect(result.success).toBe(true);
    expect(Object.keys(result).sort()).toEqual(['chart', 'success']);
    if (result.success) expect(result.chart.palaces).toHaveLength(12);
  });
  it('gives the same preview for Korean lunar and solar inputs of the same birthday', async () => {
    expect(
      await calculatePreview(form({ year: '2012', month: '5', day: '28' })),
    ).toEqual(
      await calculatePreview(
        form({ calendar: 'lunar', year: '2012', month: '4', day: '8' }),
      ),
    );
  });
});

it.each([
  ['year', '1899', '1900~'],
  ['month', '0', '1~12'],
  ['month', '13', '1~12'],
  ['day', '0', '1~31'],
  ['hour', '24', '0~23'],
  ['minute', '60', '0~59'],
])(
  'rejects out-of-range %s=%s at the server form boundary',
  async (field, value, message) => {
    const result = await calculatePreview(form({ [field]: value }));
    expect(result.success).toBe(false);
    if (!result.success)
      expect(
        result.errors[field as 'year' | 'month' | 'day' | 'hour' | 'minute'],
      ).toContain(message);
  },
);
