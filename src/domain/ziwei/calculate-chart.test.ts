import { Temporal } from '@js-temporal/polyfill';
import { astro } from 'iztro';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { calculateChart } from './calculate-chart.server';
import { chartSchema } from './chart';

// CJS barrel exports are non-configurable; retain real engine functions in a mockable namespace.
vi.mock('iztro', async (importOriginal) => {
  const original = await importOriginal<typeof import('iztro')>();
  return { ...original, astro: { ...original.astro } };
});

const now = Temporal.Instant.from('2026-09-11T03:00:00Z');
const input = {
  calendar: 'solar',
  year: 2000,
  month: 8,
  day: 16,
  hour: 3,
  minute: 30,
  gender: 'male',
};
const calculate = (value: unknown) => calculateChart(value, now);
const success = (value: unknown = input) => {
  const result = calculate(value);
  expect(result.success).toBe(true);
  if (!result.success) throw new Error(result.error.code);
  return result.data;
};

afterEach(() => {
  vi.restoreAllMocks();
  astro.config({
    yearDivide: 'normal',
    ageDivide: 'normal',
    dayDivide: 'forward',
    horoscopeDivide: 'normal',
    algorithm: 'default',
  });
  // The public config API merges maps, so clean only the maps modified by these tests.
  for (const map of [
    astro.getConfig().mutagens,
    astro.getConfig().brightness,
  ]) {
    for (const key of Object.keys(map)) Reflect.deleteProperty(map, key);
  }
});

describe('normalized birth to natal chart', () => {
  it('matches the official upstream sample after Korean projection', () => {
    const { chart, engine } = success();
    expect(engine).toEqual({ name: 'iztro', version: '2.6.1' });
    expect(chart).toMatchObject({
      soulPalaceBranch: '오',
      bodyPalaceBranch: '술',
      fiveElementsClass: '목삼국',
    });
    const main = (name: string) =>
      chart.palaces
        .find((p) => p.name === name)
        ?.stars.filter((s) => s.isMajor)
        .map((s) => s.name);
    expect(main('명궁')).toEqual(['자미']);
    expect(main('관록')).toEqual(['염정', '천부']);
    expect(chart.palaces).toHaveLength(12);
    expect(
      chart.palaces.flatMap((p) => p.stars.filter((s) => s.isMajor)),
    ).toHaveLength(14);
    expect(
      chart.palaces.flatMap((p) => p.stars.filter((s) => s.transformation)),
    ).toHaveLength(4);
  });

  it.each([
    { year: 2012, month: 5, day: 28, lunarMonth: 4, lunarDay: 8, leap: false },
    { year: 2017, month: 6, day: 24, lunarMonth: 5, lunarDay: 1, leap: true },
  ])(
    'produces identical charts from Korean lunar and solar $year input',
    (date) => {
      const solar = success({
        ...input,
        year: date.year,
        month: date.month,
        day: date.day,
      });
      const lunar = success({
        ...input,
        calendar: 'lunar',
        year: date.year,
        month: date.lunarMonth,
        day: date.lunarDay,
        isLeapMonth: date.leap,
      });
      expect(lunar).toEqual(solar);
    },
  );

  it('passes the DST-normalized previous date and late-rat index exactly once', () => {
    const spy = vi.spyOn(astro, 'bySolar');
    const { birth } = success({
      ...input,
      year: 1988,
      month: 6,
      day: 1,
      hour: 0,
      minute: 30,
    });
    expect(birth.engineInput).toEqual({
      solarDate: '1988-05-31',
      timeIndex: 12,
    });
    expect(spy).toHaveBeenCalledExactlyOnceWith(
      '1988-05-31',
      12,
      'male',
      true,
      'ko-KR',
    );
  });

  it.each([
    { year: 1900, month: 1, day: 1, hour: 0, minute: 0 },
    { year: 1900, month: 1, day: 1, hour: 23, minute: 45 },
    { year: 1900, month: 1, day: 30, hour: 23, minute: 59 },
    { year: 1900, month: 1, day: 31, hour: 0, minute: 0 },
  ])(
    'returns structurally valid charts at the supported lower boundary %#',
    (date) => {
      expect(success({ ...input, ...date }).chart.palaces).toHaveLength(12);
    },
  );

  it.each([22, 23, 0])(
    'passes the civil date unchanged for hour %i without app-side next-day shift',
    (hour) => {
      const spy = vi.spyOn(astro, 'bySolar');
      success({ ...input, year: 2023, month: 12, day: 31, hour, minute: 59 });
      expect(spy).toHaveBeenCalledWith(
        '2023-12-31',
        hour === 23 ? 12 : hour === 0 ? 0 : 11,
        'male',
        true,
        'ko-KR',
      );
    },
  );

  it('characterizes the leap-sixteenth late-rat exception without claiming independent correctness', () => {
    const make = (day: number, hour: number) =>
      success({ ...input, year: 2023, month: 4, day, hour, minute: 0 }).chart;
    expect(make(5, 0).soulPalaceBranch).toBe('묘');
    expect(make(6, 0).soulPalaceBranch).toBe('진');
    expect(make(6, 23).soulPalaceBranch).toBe('묘');
  });

  it('keeps lunar-year transformations stable across lichun, changing at lunar new year', () => {
    const transformations = (day: number) =>
      success({ ...input, year: 2024, month: 2, day })
        .chart.palaces.flatMap((p) =>
          p.stars
            .filter((s) => s.transformation)
            .map((s) => `${s.name}:${s.transformation}`),
        )
        .sort();
    expect(transformations(3)).toEqual(transformations(9));
    expect(transformations(9)).not.toEqual(transformations(10));
  });
});

describe('server boundary and error isolation', () => {
  it('rejects invalid input before calling the engine', () => {
    const spy = vi.spyOn(astro, 'bySolar');
    expect(calculate({ ...input, month: 2, day: 30 })).toMatchObject({
      success: false,
      error: { code: 'invalid_date' },
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it('does not expose or log the engine exception', () => {
    vi.spyOn(astro, 'bySolar').mockImplementationOnce(() => {
      throw new Error('private birth data');
    });
    const errorLog = vi.spyOn(console, 'error');
    expect(calculate(input)).toEqual({
      success: false,
      error: {
        code: 'calculation_failed',
        message: '명반을 계산하지 못했습니다. 잠시 후 다시 시도해주세요.',
      },
    });
    expect(errorLog).not.toHaveBeenCalled();
  });

  it('rejects malformed engine output instead of returning a partial chart', () => {
    const raw = astro.bySolar('2000-8-16', 2, 'male', true, 'ko-KR');
    raw.palaces.pop();
    vi.spyOn(astro, 'bySolar').mockReturnValueOnce(raw);
    expect(calculate(input)).toMatchObject({
      success: false,
      error: { code: 'calculation_failed' },
    });
  });

  it.each(['day', 'mutagens', 'brightness'] as const)(
    'rejects global %s configuration drift',
    (setting) => {
      if (setting === 'day') astro.config({ dayDivide: 'current' });
      if (setting === 'mutagens')
        astro.config({ mutagens: { 庚: ['太陽', '武曲', '天同', '天相'] } });
      if (setting === 'brightness')
        astro.config({ brightness: { 紫微: Array(12).fill('廟') } });
      expect(calculate(input)).toMatchObject({
        success: false,
        error: { code: 'calculation_failed' },
      });
    },
  );

  it('returns detached plain chart data with no private birth fields', () => {
    const { chart } = success();
    expect(JSON.parse(JSON.stringify(chart))).toEqual(chart);
    for (const field of [
      'birth',
      'solarDate',
      'lunarDate',
      'rawDates',
      'gender',
      'time',
      'birthInstant',
    ]) {
      expect(chart).not.toHaveProperty(field);
    }
    expect(
      chartSchema.safeParse({ ...chart, solarDate: '2000-08-16' }).success,
    ).toBe(false);
    expect(
      chartSchema.safeParse({
        ...chart,
        palaces: Array(12).fill(chart.palaces[0]),
      }).success,
    ).toBe(false);
    chart.palaces[0].stars[0].name = 'changed';
    expect(success().chart.palaces[0].stars[0].name).not.toBe('changed');
  });

  it('remains deterministic across interleaved requests and a prior foreign-language call', async () => {
    const expected = success().chart;
    astro.bySolar('2017-6-24', 7, 'female', true, 'en-US');
    const results = await Promise.all(
      Array.from({ length: 8 }, (_, i) =>
        Promise.resolve().then(
          () =>
            success(i % 2 ? { ...input, day: 17, gender: 'female' } : input)
              .chart,
        ),
      ),
    );
    for (const index of [0, 2, 4, 6]) expect(results[index]).toEqual(expected);
    expect(success().chart).toEqual(expected);
  });
});
