import { expect, it } from 'vitest';
import { birthInputRanges } from './input-ranges';

it('uses Gregorian leap-year rules for month length', () => {
  expect(birthInputRanges('solar', 1900, 2).day).toEqual([1, 28]);
  expect(birthInputRanges('solar', 2000, 2).day).toEqual([1, 29]);
  expect(birthInputRanges('solar', 2000, 4).day).toEqual([1, 30]);
});
it('uses the installed Korean lunar calendar for ordinary and leap month lengths', () => {
  expect(birthInputRanges('lunar', 2023, 2, false).day).toEqual([1, 30]);
  expect(birthInputRanges('lunar', 2023, 2, true).day).toEqual([1, 29]);
});
it('includes lunar 1899 without admitting it as a solar input year', () => {
  expect(birthInputRanges('lunar', 1899, 12, false, 2026).year).toEqual([
    1899, 2026,
  ]);
  expect(birthInputRanges('solar', 1900, 1, false, 2026).year).toEqual([
    1900, 2026,
  ]);
});
