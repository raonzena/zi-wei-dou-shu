import * as aiService from '../../server/interpretation/request.server';
import { describe, expect, it, vi } from 'vitest';
import * as interpretation from '../../domain/interpretation/basic-reading';
import { calculatePreview } from './calculate-action';
import { parseBirthForm, parseDisplayName } from './form-input';

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
  it('returns chart and basic reading without normalized birth data', async () => {
    const result = await calculatePreview(form());
    expect(result.success).toBe(true);
    expect(Object.keys(result).sort()).toEqual([
      'ai',
      'chart',
      'facts',
      'reading',
      'success',
    ]);
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

it('공유할 이름을 정리하고 비어 있거나 지나치게 긴 값은 거부한다', () => {
  expect(parseDisplayName(form({ name: '  설화  ' }))).toEqual({
    success: true,
    name: '설화',
  });
  expect(parseDisplayName(form({ name: '  ' })).success).toBe(false);
  expect(parseDisplayName(form({ name: '가'.repeat(21) })).success).toBe(false);
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

it('풀이 준비 오류를 개인정보 없는 안내로 반환한다', async () => {
  const spy = vi
    .spyOn(interpretation, 'createBasicReading')
    .mockImplementationOnce(() => {
      throw new Error('private internal detail');
    });
  try {
    const result = await calculatePreview(form());
    expect(result).toEqual({
      success: false,
      errors: {
        input: '기본 풀이를 준비하지 못했습니다. 잠시 후 다시 시도해주세요.',
      },
    });
    expect(JSON.stringify(result)).not.toContain('private internal detail');
  } finally {
    spy.mockRestore();
  }
});

it('AI를 선택하지 않으면 AI 요청 없이 기본 풀이를 제공한다', async () => {
  const result = await calculatePreview(form());
  if (!result.success) throw new Error('expected success');
  expect(result.ai).toEqual({ status: 'not-requested' });
});
it('AI 선택 값의 중복이나 임의 문자열을 거부한다', async () => {
  expect(
    (await calculatePreview(form({ includeAi: 'custom prompt' }))).success,
  ).toBe(false);
  const data = form({ includeAi: 'on' });
  data.append('includeAi', 'on');
  expect((await calculatePreview(data)).success).toBe(false);
});

it('AI가 실패해도 서버 계산 자료와 기본 풀이를 반환한다', async () => {
  const spy = vi.spyOn(aiService, 'requestExplanation').mockResolvedValueOnce({
    status: 'error',
    code: 'invalid-response',
    message: '검증 실패',
    retryable: true,
  });
  try {
    const result = await calculatePreview(form({ includeAi: 'on' }));
    expect(result.success).toBe(true);
    if (!result.success) throw new Error('Expected calculated result');
    expect(result.ai.status).toBe('error');
    expect(result.facts.formatVersion).toBe('chart-facts-v1');
    expect(result.facts.summary).toHaveLength(5);
    expect(result.reading).toBeDefined();
    expect(JSON.stringify(result.facts)).not.toContain('검증 실패');
  } finally {
    spy.mockRestore();
  }
});

it('서버 플래그가 꺼져 있으면 변조된 on 요청도 외부 호출하지 않는다', async () => {
  vi.stubEnv('AI_EXPLANATION_ENABLED', 'false');
  const spy = vi.spyOn(aiService, 'requestExplanation');
  try {
    const result = await calculatePreview(form({ includeAi: 'on' }));
    expect(result.success).toBe(true);
    if (result.success) expect(result.ai.status).toBe('not-requested');
    expect(spy).not.toHaveBeenCalled();
  } finally {
    spy.mockRestore();
    vi.unstubAllEnvs();
  }
});

it.each([
  ['year', '02000'],
  ['month', '008'],
  ['day', '016'],
  ['hour', '012'],
  ['minute', '000'],
])(
  'rejects excess digits in %s even when numerically valid',
  (field, value) => {
    const result = parseBirthForm(form({ [field]: value }));
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.errors[field as 'year']).toContain('자릿수');
  },
);

it('accepts two-digit values with a leading zero', () => {
  expect(parseBirthForm(form({ month: '08', minute: '00' })).success).toBe(
    true,
  );
});
