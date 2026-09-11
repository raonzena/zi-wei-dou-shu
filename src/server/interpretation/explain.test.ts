import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { explainChart } from './explain.server';
import { consultationEvidence } from '../../domain/interpretation/consultation-evidence';
import { userConsultationPrompt } from './consultation-prompt';
import { calculateChart } from '../../domain/ziwei/calculate-chart.server';
import fixture from '../../domain/ziwei/fixtures/cust-1929.json';

function reading() {
  const result = calculateChart(fixture.input);
  if (!result.success) throw new Error(result.error.code);
  return result.data.chart;
}
const fetchMock = vi.fn<typeof fetch>();
beforeEach(() => {
  vi.stubEnv('OPENAI_API_KEY', 'test-key-not-real');
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
function response(value: unknown, status = 'completed') {
  return new Response(
    JSON.stringify({
      id: 'resp_test',
      object: 'response',
      status,
      output: [
        {
          id: 'msg_test',
          type: 'message',
          role: 'assistant',
          status: 'completed',
          content: [
            {
              type: 'output_text',
              text: JSON.stringify(value),
              annotations: [],
            },
          ],
        },
      ],
    }),
    { headers: { 'content-type': 'application/json' } },
  );
}
function valid() {
  return {
    sections: Array.from({ length: 12 }, (_, i) => ({
      step: i + 1,
      status: [3, 10, 11].includes(i + 1) ? 'unavailable' : 'limited',
      limitation: '이것은 실제 해석이 아닌 검증용 제한 안내입니다.',
      paragraphs: [3, 10, 11].includes(i + 1)
        ? []
        : [
            {
              evidenceIds: ['palace:사'],
              terms: '명궁은 기본 성향을 살피는 궁입니다.',
              interpretation: '테스트를 위한 설명이며 실제 AI 해석이 아닙니다.',
              check: '이 문장은 화면과 데이터 검증용입니다.',
            },
          ],
    })),
  };
}

describe('OpenAI 설명 요청과 검증', () => {
  it('키가 없으면 외부 호출 없이 설정 오류를 반환한다', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    expect(await explainChart(reading())).toMatchObject({
      status: 'error',
      code: 'unavailable',
      retryable: false,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('명궁에 주성이 없어도 다른 궁을 포함한 본명반 해석을 요청한다', async () => {
    const chart = reading();
    chart.palaces.find((p) => p.name === '명궁')!.stars = [];
    fetchMock.mockResolvedValue(response(valid()));
    expect((await explainChart(chart)).status).toBe('ready');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('원본 출생 정보를 제외하고 보충된 본명반·운한을 전송한다', async () => {
    fetchMock.mockResolvedValue(response(valid()));
    const result = await explainChart(reading());
    expect(result.status).toBe('ready');
    const request = JSON.parse(fetchMock.mock.calls[0][1]!.body as string);
    expect(request).toMatchObject({
      store: false,
      model: 'gpt-5.4-mini-2026-03-17',
      max_output_tokens: 16000,
      reasoning: { effort: 'none' },
    });
    expect(JSON.parse(request.input)).toEqual(consultationEvidence(reading()));
    expect(request.instructions).toContain(userConsultationPrompt);
    expect(
      JSON.parse(request.input).palaces.every((p: { stars: object[] }) =>
        p.stars.every((s) => 'brightness' in s),
      ),
    ).toBe(true);
    expect(request.tools).toBeUndefined();
    expect(request.text.format.strict).toBe(true);
    const allowed =
      request.text.format.schema.properties.sections.items.properties.paragraphs
        .items.properties.evidenceIds.items.enum;
    expect(allowed).toContain('star:사:adjective:팔좌');
    expect(allowed).not.toContain('star:사:minor:팔좌');
    expect(request.instructions).toContain('7: 결혼과 장기 관계 분석');
    expect(request.instructions).toContain('8: 건강과 생활관리 분석');
    expect(JSON.stringify(result)).not.toContain('test-key');
  });
  it.each(['unknown', 'duplicate', 'missing', 'extra'])(
    '근거가 %s인 응답을 거부한다',
    async (kind) => {
      const value = valid();
      if (kind === 'unknown')
        value.sections[0].paragraphs[0].evidenceIds = ['invented'];
      if (kind === 'duplicate')
        value.sections[0].paragraphs[0].evidenceIds = ['chart', 'chart'];
      if (kind === 'missing') value.sections.pop();
      if (kind === 'extra') value.sections.push(value.sections[0]);
      fetchMock.mockResolvedValue(response(value));
      expect(await explainChart(reading())).toMatchObject({
        status: 'error',
      });
    },
  );
  it('미완료 응답은 성공으로 표시하지 않는다', async () => {
    fetchMock.mockResolvedValue(response(valid(), 'incomplete'));
    expect(await explainChart(reading())).toMatchObject({
      status: 'error',
      code: 'invalid-response',
    });
  });
  it('refusal 응답은 설명으로 표시하지 않는다', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          status: 'completed',
          output: [
            {
              type: 'message',
              role: 'assistant',
              content: [{ type: 'refusal', refusal: 'no' }],
            },
          ],
        }),
        { headers: { 'content-type': 'application/json' } },
      ),
    );
    expect(await explainChart(reading())).toMatchObject({
      status: 'error',
      code: 'invalid-response',
    });
  });
  it.each([
    [429, 'rate-limit', true],
    [401, 'unavailable', false],
    [500, 'provider', true],
  ] as const)(
    'HTTP %s를 분류하고 자동 재요청하지 않는다',
    async (status, code, retryable) => {
      fetchMock.mockResolvedValue(
        new Response(
          JSON.stringify({ error: { message: 'private provider detail' } }),
          { status, headers: { 'content-type': 'application/json' } },
        ),
      );
      const result = await explainChart(reading());
      expect(result).toMatchObject({ status: 'error', code, retryable });
      expect(JSON.stringify(result)).not.toContain('private provider detail');
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );
  it('90초가 지나면 요청을 중단하고 재시도 가능한 오류로 반환한다', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError')),
          );
        }),
    );
    const pending = explainChart(reading());
    await vi.advanceTimersByTimeAsync(90_100);
    expect(await pending).toMatchObject({
      status: 'error',
      code: 'timeout',
      retryable: true,
    });
  });
});

it('대한 근거 ID 없이 시기 해석을 반환하면 거부한다', async () => {
  const value = valid();
  value.sections[9] = { ...value.sections[0], step: 10 };
  fetchMock.mockResolvedValue(response(value));
  expect(await explainChart(reading())).toMatchObject({
    status: 'error',
    code: 'invalid-response',
  });
});
it('분석 단계가 뒤바뀌면 거부한다', async () => {
  const value = valid();
  [value.sections[0], value.sections[1]] = [
    value.sections[1],
    value.sections[0],
  ];
  fetchMock.mockResolvedValue(response(value));
  expect(await explainChart(reading())).toMatchObject({
    status: 'error',
    code: 'invalid-response',
  });
});
it('삼방사정은 지지 위치로 구성하고 원본 데이터와 표시 범위를 유지한다', () => {
  const chart = reading();
  const before = JSON.stringify(chart);
  const input = consultationEvidence(chart);
  expect(
    input.palaces.find((p) => p.earthlyBranch === '사')!.relatedPalaceIds,
  ).toEqual(['palace:사', 'palace:유', 'palace:축', 'palace:해']);
  expect(
    input.palaces.find((p) => p.earthlyBranch === '신')!.relatedPalaceIds,
  ).toEqual(['palace:신', 'palace:자', 'palace:진', 'palace:인']);
  const stars = input.palaces.flatMap((p) => p.stars);
  expect(stars).toHaveLength(39);
  expect(stars.filter((s) => s.natalTransformation)).toHaveLength(4);
  expect(stars.filter((s) => s.name === '천월')).toHaveLength(1);
  expect(input.palaces.filter((p) => p.isBodyPalace)).toHaveLength(1);
  expect(JSON.stringify(chart)).toBe(before);
  expect(input).not.toHaveProperty('birth');
});

it.each([
  ['credit_balance_exhausted', undefined],
  ['organization_spend_limit_exceeded', undefined],
  ['project_spend_limit_exceeded', undefined],
  ['organization_usage_limit_exceeded', undefined],
  [undefined, 'insufficient_quota'],
])('결제·사용량 한도 %s/%s는 재시도를 제공하지 않는다', async (code, type) => {
  fetchMock.mockResolvedValue(
    new Response(
      JSON.stringify({
        error: {
          code,
          type,
          message: 'private billing detail',
        },
      }),
      { status: 429, headers: { 'content-type': 'application/json' } },
    ),
  );
  const result = await explainChart(reading());
  expect(result).toMatchObject({
    status: 'error',
    code: 'quota',
    retryable: false,
  });
  expect(JSON.stringify(result)).not.toContain('private billing detail');
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
it.each(['rate_limit_exceeded', 'slow_down'])(
  '일시적인 제한 %s는 명시적인 재시도를 제공한다',
  async (code) => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code,
            type: 'rate_limit_error',
            message: 'private rate detail',
          },
        }),
        { status: 429, headers: { 'content-type': 'application/json' } },
      ),
    );
    expect(await explainChart(reading())).toMatchObject({
      status: 'error',
      code: 'rate-limit',
      retryable: true,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  },
);

it('전달한 대한·유년 근거를 사용한 시기 해석은 허용한다', async () => {
  const value = valid();
  for (const step of [3, 10, 11])
    value.sections[step - 1] = {
      ...value.sections[0],
      step,
      paragraphs: [
        {
          ...value.sections[0].paragraphs[0],
          evidenceIds: [
            step === 11
              ? consultationEvidence(reading()).timing.yearly.id
              : 'decadal:3',
            ...(step === 11
              ? consultationEvidence(reading()).timing.monthly.map((m) => m.id)
              : []),
          ],
        },
      ],
    };
  fetchMock.mockResolvedValue(response(value));
  expect((await explainChart(reading())).status).toBe('ready');
});
it('다른 연도의 유년 ID나 대한만으로 올해 유년 해석을 만들면 거부한다', async () => {
  for (const id of ['yearly:1800', 'decadal:3']) {
    const value = valid();
    value.sections[10] = {
      ...value.sections[0],
      step: 11,
      paragraphs: [{ ...value.sections[0].paragraphs[0], evidenceIds: [id] }],
    };
    fetchMock.mockResolvedValue(response(value));
    expect(await explainChart(reading())).toMatchObject({
      status: 'error',
      code: 'invalid-response',
    });
  }
});

it('유년 해석에서 일부 월 구간을 누락하면 거부한다', async () => {
  const value = valid();
  const evidence = consultationEvidence(reading());
  value.sections[10] = {
    ...value.sections[0],
    step: 11,
    paragraphs: [
      {
        ...value.sections[0].paragraphs[0],
        evidenceIds: [
          evidence.timing.yearly.id,
          ...evidence.timing.monthly.slice(1).map((m) => m.id),
        ],
      },
    ],
  };
  fetchMock.mockResolvedValue(response(value));
  expect(await explainChart(reading())).toMatchObject({
    status: 'error',
    code: 'invalid-response',
  });
});

it.each([
  '유월은 별도로 계산할 근거가 없어 여기서는 다루지 않습니다.',
  '현재 대한인 decadal:93에서는 책임이 커집니다.',
])(
  '실호출에서 발견한 모순·내부 ID 노출을 거부한다: %s',
  async (interpretation) => {
    const value = valid();
    value.sections[0].paragraphs[0].interpretation = interpretation;
    fetchMock.mockResolvedValue(response(value));
    expect(await explainChart(reading())).toMatchObject({
      status: 'error',
      code: 'invalid-response',
    });
  },
);
