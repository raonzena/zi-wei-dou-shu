import { Temporal } from '@js-temporal/polyfill';
import { describe, expect, it } from 'vitest';
import { normalizeBirth, type NormalizedBirth } from './normalize-birth.server';

const now = Temporal.Instant.from('2026-09-11T03:00:00Z');
const base = {
  calendar: 'solar',
  year: 2000,
  month: 8,
  day: 16,
  hour: 3,
  minute: 30,
  gender: 'male',
};
const normalize = (input: unknown) => normalizeBirth(input, now);
const success = (input: unknown): NormalizedBirth => {
  const result = normalize(input);
  expect(result.success).toBe(true);
  if (!result.success) throw new Error(result.error.code);
  return result.data;
};

// Historical fixtures: IANA tz asia, Asia/Seoul and ROK entries.
// Calendar fixtures: KASI 2012 announcement and Korean calendar package 2017 example.
// Sources and limits: docs/tasks/2026-09-11-birth-normalization.md.
describe('birth input validation', () => {
  it.each([
    null,
    {},
    { ...base, year: '2000' },
    { ...base, hour: null },
    { ...base, hour: '' },
    { ...base, hour: 24 },
    { ...base, hour: -1 },
    { ...base, minute: 60 },
    { ...base, minute: 1.5 },
    { ...base, year: NaN },
    { ...base, gender: 'unknown' },
    { ...base, calendar: 'other' },
    { ...base, isLeapMonth: true },
    { ...base, calendar: 'lunar' },
    { ...base, timeZone: 'UTC' },
  ])('rejects malformed input %#', (input) => {
    expect(normalize(input)).toMatchObject({
      success: false,
      error: { code: 'invalid_input' },
    });
  });

  it.each([
    { ...base, month: 2, day: 30 },
    { ...base, year: 1900, month: 2, day: 29 },
    { ...base, month: 4, day: 31 },
    {
      ...base,
      calendar: 'lunar',
      year: 2024,
      month: 2,
      day: 1,
      isLeapMonth: true,
    },
  ])('rejects impossible solar or lunar dates %#', (input) => {
    expect(normalize(input)).toMatchObject({
      success: false,
      error: { code: 'invalid_date' },
    });
  });

  it('accepts Gregorian leap day', () => {
    expect(success({ ...base, month: 2, day: 29 }).localSolarDate).toBe(
      '2000-02-29',
    );
  });

  it('rejects dates before the supported solar boundary', () => {
    expect(
      normalize({ ...base, year: 1899, month: 12, day: 31 }),
    ).toMatchObject({
      success: false,
      error: { code: 'unsupported_date' },
    });
  });

  it('accepts solar 1900-01-01 even though its Korean lunar year is 1899', () => {
    const first = success({ ...base, year: 1900, month: 1, day: 1 });
    expect(first.koreanLunarDate.year).toBe(1899);
    expect(
      success({ ...base, calendar: 'lunar', ...first.koreanLunarDate }),
    ).toEqual(first);
  });

  it('rejects a future instant on today, while accepting the exact current minute', () => {
    const today = {
      ...base,
      year: 2026,
      month: 9,
      day: 11,
      hour: 12,
      minute: 0,
    };
    expect(normalize(today).success).toBe(true);
    expect(normalize({ ...today, minute: 1 })).toMatchObject({
      success: false,
      error: { code: 'future_birth' },
    });
    expect(normalize({ ...today, day: 12 })).toMatchObject({
      success: false,
      error: { code: 'future_birth' },
    });
  });
});

describe('Korean input calendar equivalence', () => {
  it.each([
    { solar: [2012, 5, 28], lunar: [2012, 4, 8], leap: false },
    { solar: [2017, 6, 24], lunar: [2017, 5, 1], leap: true },
  ])(
    'normalizes $solar equally from Korean lunar input',
    ({ solar, lunar, leap }) => {
      const fromSolar = success({
        ...base,
        year: solar[0],
        month: solar[1],
        day: solar[2],
      });
      const fromLunar = success({
        ...base,
        calendar: 'lunar',
        year: lunar[0],
        month: lunar[1],
        day: lunar[2],
        isLeapMonth: leap,
      });
      expect(fromLunar).toEqual(fromSolar);
    },
  );

  it('does not retain a previous conversion after an invalid request', () => {
    success(base);
    expect(normalize({ ...base, day: 32 }).success).toBe(false);
    expect(success({ ...base, day: 17 }).localSolarDate).toBe('2000-08-17');
  });
});

describe('historical time normalization', () => {
  it.each([
    { year: 1954, month: 3, day: 20, hour: 23, minute: 45 },
    { year: 1961, month: 8, day: 10, hour: 0, minute: 15 },
    { year: 1988, month: 5, day: 8, hour: 2, minute: 30 },
    { year: 1988, month: 10, day: 9, hour: 2, minute: 30 },
  ])('rejects skipped or repeated civil time $year-$month-$day', (date) => {
    expect(normalize({ ...base, ...date })).toMatchObject({
      success: false,
      error: { code: 'invalid_local_time' },
    });
  });

  it('preserves historical second offsets and moves the calculation date', () => {
    const result = success({
      ...base,
      year: 1900,
      month: 1,
      day: 1,
      hour: 23,
      minute: 45,
    });
    expect(result.localOffset).toBe('+08:27:52');
    expect(result.calculationDateTime).toBe('1900-01-02T00:17:08');
    expect(result.engineInput).toEqual({
      solarDate: '1900-01-02',
      timeIndex: 0,
    });
    expect(result.localSolarDate).toBe('1900-01-01');
  });

  it('applies the 1954 standard offset instead of assuming UTC+9', () => {
    const result = success({
      ...base,
      year: 1954,
      month: 3,
      day: 21,
      hour: 12,
      minute: 0,
    });
    expect(result.localOffset).toBe('+08:30');
    expect(result.calculationDateTime).toBe('1954-03-21T12:30:00');
  });

  it('subtracts summer time, preserving the previous date and late-rat index', () => {
    const result = success({
      ...base,
      year: 1988,
      month: 6,
      day: 1,
      hour: 0,
      minute: 30,
    });
    expect(result.localOffset).toBe('+10:00');
    expect(result.calculationDateTime).toBe('1988-05-31T23:30:00');
    expect(result.engineInput).toEqual({
      solarDate: '1988-05-31',
      timeIndex: 12,
    });
  });

  it.each([
    [22, 59, 11],
    [23, 0, 12],
    [23, 59, 12],
    [0, 0, 0],
    [0, 59, 0],
    [1, 0, 1],
  ])(
    'maps %i:%i without applying the engine day shift twice',
    (hour, minute, index) => {
      expect(success({ ...base, hour, minute }).engineInput).toEqual({
        solarDate: '2000-08-16',
        timeIndex: index,
      });
    },
  );

  it('keeps the same instant through fixed-offset conversion and reports tz provenance', () => {
    const result = success(base);
    expect(
      Temporal.Instant.from(`${result.calculationDateTime}+09:00`).toString(),
    ).toBe(result.birthInstant);
    expect(result.timeZoneDataVersion).toMatch(/^\d{4}[a-z]/);
  });
});
