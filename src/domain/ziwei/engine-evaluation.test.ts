import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { astro, util } from 'iztro';
import KoreanLunarCalendar from 'korean-lunar-calendar';

// Evaluation only: passing these tests does not approve a production calendar policy.
// Fixture provenance and limitations: docs/decisions/0002-calculation-engine-evaluation.md.
const resetConfig = () =>
  astro.config({
    yearDivide: 'normal',
    ageDivide: 'normal',
    dayDivide: 'forward',
    horoscopeDivide: 'normal',
    algorithm: 'default',
  });

beforeEach(resetConfig);
afterEach(resetConfig);

const solar = (date: string, time = 2, fixLeap = true) =>
  astro.bySolar(date, time, 'male', fixLeap, 'zh-TW');
const placement = (chart: ReturnType<typeof solar>) =>
  chart.palaces.map((palace) => ({
    branch: palace.earthlyBranch,
    name: palace.name,
    stars: palace.majorStars
      .filter((star) => star.type === 'major')
      .map((star) => star.name),
  }));

describe('iztro documented sample (upstream regression, not independent verification)', () => {
  it('preserves the documented soul/body palaces and fourteen main stars', () => {
    const chart = solar('2000-8-16');
    expect(chart.earthlyBranchOfSoulPalace).toBe('午');
    expect(chart.earthlyBranchOfBodyPalace).toBe('戌');
    expect(chart.fiveElementsClass).toBe('木三局');
    expect(chart.palaces).toHaveLength(12);
    expect(placement(chart).flatMap((palace) => palace.stars)).toHaveLength(14);
    expect(
      placement(chart).find((palace) => palace.name === '命宮')?.stars,
    ).toEqual(['紫微']);
    expect(
      placement(chart).find((palace) => palace.name === '官祿')?.stars,
    ).toEqual(['廉貞', '天府']);
  });

  it('agrees between solar and lunar entry points for the documented sample', () => {
    expect(
      placement(astro.byLunar('2000-7-17', 2, 'male', false, true, 'zh-TW')),
    ).toEqual(placement(solar('2000-8-16')));
  });
});

describe('calendar compatibility', () => {
  it('reproduces the different Korean and Chinese 2012 lunar April eighth (KASI)', () => {
    const korean = new KoreanLunarCalendar();
    expect(korean.setLunarDate(2012, 4, 8, false)).toBe(true);
    expect(korean.getSolarCalendar()).toMatchObject({
      year: 2012,
      month: 5,
      day: 28,
    });
    expect(
      astro.byLunar('2012-4-8', 2, 'male', false, true, 'zh-TW').solarDate,
    ).toBe('2012-4-28');
    // Converting the Korean input to solar first still uses a different lunar calendar internally.
    expect(solar('2012-5-28').rawDates.lunarDate).toMatchObject({
      lunarYear: 2012,
      lunarMonth: 4,
      lunarDay: 8,
      isLeap: true,
    });
  });

  it('reproduces the Korean calendar package example for the 2017 leap month', () => {
    const korean = new KoreanLunarCalendar();
    expect(korean.setSolarDate(2017, 6, 24)).toBe(true);
    expect(korean.getLunarCalendar()).toMatchObject({
      year: 2017,
      month: 5,
      day: 1,
      intercalation: true,
    });
    expect(solar('2017-6-24').rawDates.lunarDate).toMatchObject({
      lunarMonth: 6,
      lunarDay: 1,
      isLeap: false,
    });
  });

  it.each([
    ['2023-4-5', 15],
    ['2023-4-6', 16],
  ] as const)('matches HKO lunar date for %s', (date, day) => {
    expect(solar(date).rawDates.lunarDate).toMatchObject({
      lunarYear: 2023,
      lunarMonth: 2,
      lunarDay: day,
      isLeap: true,
    });
  });

  it('changes leap-month placement only after day fifteen when fixLeap is enabled', () => {
    expect(placement(solar('2023-4-5', 2, true))).toEqual(
      placement(solar('2023-4-5', 2, false)),
    );
    expect(placement(solar('2023-4-6', 2, true))).not.toEqual(
      placement(solar('2023-4-6', 2, false)),
    );
  });
});

describe('integration boundaries', () => {
  it('maps civil hours using the existing API, including both midnight indices', () => {
    expect(
      Array.from({ length: 24 }, (_, hour) => util.timeToIndex(hour)),
    ).toEqual([
      0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11,
      12,
    ]);
  });

  it('applies the global late-rat day policy to subsequent calls', () => {
    const forward = placement(solar('2000-8-16', 12));
    astro.config({ dayDivide: 'current' });
    expect(astro.getConfig().dayDivide).toBe('current');
    expect(placement(solar('2000-8-16', 12))).not.toEqual(forward);
  });

  it('demonstrates why iztro must not be used as an input validator', () => {
    expect(placement(solar('2000-2-30'))).toEqual(placement(solar('2000-3-1')));
    expect(
      astro.byLunar('2024-2-1', 2, 'male', true, true, 'zh-TW').solarDate,
    ).toBe(
      astro.byLunar('2024-2-1', 2, 'male', false, true, 'zh-TW').solarDate,
    );
    const korean = new KoreanLunarCalendar();
    expect(korean.setSolarDate(2000, 2, 30)).toBe(false);
    expect(korean.setLunarDate(2024, 2, 1, true)).toBe(false);
  });

  it('serializes without a custom serializer but includes private birth data', () => {
    const serialized: unknown = JSON.parse(JSON.stringify(solar('2000-8-16')));
    expect(serialized).toMatchObject({ solarDate: '2000-8-16' });
    expect(serialized).toHaveProperty('rawDates');
    expect(serialized).toHaveProperty('gender');
  });
});
