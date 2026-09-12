import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Temporal } from '@js-temporal/polyfill';
import { calculateChart } from '../../domain/ziwei/calculate-chart.server';
import fixture from '../../domain/ziwei/fixtures/cust-1929.json';
import { requestExplanation } from './request.server';
import { privateDigest, actorAddress } from './controls/identity';
import { estimatedMicrousd, validUsage } from './controls/usage';
vi.mock('../content/star-content.server', () => ({
  getStarContent: async () => ({
    status: 'ready',
    entries: [
      {
        star_key: 'major:자미',
        version: 1,
        title: '자미',
        translation: '테스트 설명',
        translation_kind: 'adaptation',
        source_url: 'https://iztro.com/learn/major-star',
        source_version: 'test',
        license: 'MIT',
      },
    ],
  }),
}));
const mocks = vi.hoisted(() => ({
  reserve: vi.fn(),
  finish: vi.fn(),
  explain: vi.fn(),
  headers: vi.fn(),
}));
vi.mock('next/headers', () => ({ headers: mocks.headers }));
vi.mock('./controls/store.server', () => ({
  usageStore: () => ({ reserve: mocks.reserve, finish: mocks.finish }),
}));
vi.mock('./explain.server', () => ({
  explainChart: mocks.explain,
  explanationModel: 'gpt-5.4-mini-2026-03-17',
  explanationPromptVersion: 'test-v1',
}));
const result = calculateChart(
  fixture.input,
  Temporal.Instant.from('2026-09-12T03:00Z'),
);
if (!result.success) throw new Error('Fixture failed');
const chart = result.data.chart;
const id = '187c8e9a-a671-45db-84d9-04675c9e759c';
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('AI_EXPLANATION_ENABLED', 'true');
  vi.stubEnv('OPENAI_API_KEY', 'test-key');
  vi.stubEnv('AI_USAGE_HMAC_SECRET', 'a'.repeat(64));
  vi.stubEnv('AI_HOURLY_LIMIT', '3');
  vi.stubEnv('AI_DAILY_LIMIT', '20');
  vi.stubEnv('AI_DAILY_BUDGET_MICROUSD', '2000000');
  vi.stubEnv('VERCEL', '1');
  mocks.headers.mockResolvedValue(
    new Headers({ 'x-vercel-forwarded-for': '192.0.2.42' }),
  );
  mocks.reserve.mockResolvedValue({ allowed: true, id });
  mocks.finish.mockResolvedValue(undefined);
  mocks.explain.mockResolvedValue({
    status: 'error',
    code: 'timeout',
    retryable: true,
    message: 'Timeout',
  });
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
it('비활성 상태에서는 DB와 제공자를 호출하지 않는다', async () => {
  vi.stubEnv('AI_EXPLANATION_ENABLED', 'false');
  expect(await requestExplanation(chart)).toEqual({ status: 'not-requested' });
  expect(mocks.reserve).not.toHaveBeenCalled();
  expect(mocks.explain).not.toHaveBeenCalled();
});
it('본명반이 같으면 해석에 쓰지 않는 운한 변경으로 중복 식별이 바뀌지 않는다', async () => {
  await requestExplanation(chart);
  const changed = structuredClone(chart);
  changed.timing.yearly.year += 1;
  await requestExplanation(changed);
  expect(mocks.reserve.mock.calls[0][0].p_fingerprint).toBe(
    mocks.reserve.mock.calls[1][0].p_fingerprint,
  );
});
it.each(['OPENAI_API_KEY', 'AI_USAGE_HMAC_SECRET'])(
  '필수 설정 %s 누락 시 호출하지 않는다',
  async (name) => {
    vi.stubEnv(name, '');
    expect(await requestExplanation(chart)).toMatchObject({
      code: 'unavailable',
    });
    expect(mocks.reserve).not.toHaveBeenCalled();
    expect(mocks.explain).not.toHaveBeenCalled();
  },
);
it.each(['0', '-1', 'NaN', '1.5'])(
  '잘못된 한도 %s에서는 호출하지 않는다',
  async (limit) => {
    vi.stubEnv('AI_HOURLY_LIMIT', limit);
    expect(await requestExplanation(chart)).toMatchObject({
      code: 'unavailable',
    });
    expect(mocks.explain).not.toHaveBeenCalled();
  },
);
it('저장소 장애에서는 제한을 우회하지 않는다', async () => {
  mocks.reserve.mockRejectedValue(new Error('private provider body'));
  expect(await requestExplanation(chart)).toMatchObject({
    code: 'unavailable',
  });
  expect(mocks.explain).not.toHaveBeenCalled();
  expect(JSON.stringify(vi.mocked(console.warn).mock.calls)).not.toContain(
    'private provider body',
  );
});
it.each(['duplicate', 'hourly', 'daily'])(
  '%s 거절 시 제공자를 호출하지 않는다',
  async (reason) => {
    mocks.reserve.mockResolvedValue({ allowed: false, reason });
    expect(await requestExplanation(chart)).toMatchObject({
      code: 'rate-limit',
      retryable: false,
    });
    expect(mocks.explain).not.toHaveBeenCalled();
    expect(mocks.finish).not.toHaveBeenCalled();
  },
);
it('IP·명반 원문 대신 HMAC을 전달하고 사용량 불명의 실패도 정산한다', async () => {
  await requestExplanation(chart);
  expect(mocks.reserve).toHaveBeenCalledWith(
    expect.objectContaining({
      p_actor: expect.stringMatching(/^[a-f0-9]{64}$/),
      p_fingerprint: expect.stringMatching(/^[a-f0-9]{64}$/),
      p_hourly_limit: 3,
      p_daily_limit: 20,
      p_daily_budget: 2000000,
    }),
  );
  expect(mocks.finish).toHaveBeenCalledWith({
    p_id: id,
    p_outcome: 'timeout',
    p_duration_ms: expect.any(Number),
    p_input: null,
    p_cached: null,
    p_output: null,
  });
  const calls = JSON.stringify([
    mocks.reserve.mock.calls,
    vi.mocked(console.info).mock.calls,
  ]);
  expect(calls).not.toContain('192.0.2.42');
  expect(calls).not.toContain(JSON.stringify(chart));
  expect(mocks.explain).toHaveBeenCalledTimes(1);
});
it('구조 검증 실패도 토큰 비용에 포함하고 정산 장애로 결과를 잃지 않는다', async () => {
  mocks.explain.mockImplementation(async (_, _content, onUsage) => {
    onUsage({ input: 1000, cached: 200, output: 100 });
    return {
      status: 'error',
      code: 'invalid-response',
      retryable: true,
      message: 'Invalid',
    };
  });
  mocks.finish.mockRejectedValue(new Error('private connection'));
  expect(await requestExplanation(chart)).toMatchObject({
    code: 'invalid-response',
  });
  expect(mocks.finish).toHaveBeenCalledWith(
    expect.objectContaining({
      p_input: 1000,
      p_cached: 200,
      p_output: 100,
      p_outcome: 'invalid-response',
    }),
  );
  expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain(
    'private connection',
  );
  expect(estimatedMicrousd({ input: 1000, cached: 200, output: 100 })).toBe(
    1065,
  );
});
it('잘못된 사용량은 비용을 낮추는 정산에 사용하지 않는다', async () => {
  mocks.explain.mockImplementation(async (_, _content, onUsage) => {
    onUsage({ input: 1, cached: 200, output: -1 });
    throw new Error('private provider');
  });
  expect(await requestExplanation(chart)).toMatchObject({ code: 'provider' });
  expect(mocks.finish).toHaveBeenCalledWith(
    expect.objectContaining({ p_input: null, p_cached: null, p_output: null }),
  );
  expect(validUsage({ input: 1000, cached: 200, output: 100 })).toBe(true);
});
it('Vercel 헤더가 없으면 일반 forwarded-for를 신뢰하지 않는다', async () => {
  mocks.headers.mockResolvedValue(
    new Headers({ 'x-forwarded-for': '192.0.2.42' }),
  );
  expect(await requestExplanation(chart)).toMatchObject({
    code: 'unavailable',
  });
  expect(mocks.reserve).not.toHaveBeenCalled();
});
it('동일 IPv6 표기와 HMAC 범위를 일관되게 처리한다', () => {
  expect(
    actorAddress(
      new Headers({ 'x-vercel-forwarded-for': '2001:0db8:0:0:0:0:0:1' }),
      true,
    ),
  ).toBe(
    actorAddress(
      new Headers({ 'x-vercel-forwarded-for': '2001:db8::1' }),
      true,
    ),
  );
  expect(actorAddress(new Headers(), false)).toBe('local-development');
  expect(privateDigest('secret', 'actor', 'x')).not.toBe(
    privateDigest('secret', 'request', 'x'),
  );
  expect(privateDigest('secret', 'actor', 'x')).not.toBe(
    privateDigest('other', 'actor', 'x'),
  );
});
