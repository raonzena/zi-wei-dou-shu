import fixture from '../../ziwei/fixtures/cust-1929.json';

/** Synthetic inputs only. Frozen years make evaluation reproducible. */
export const evaluationCases = [
  {
    id: 'reference',
    input: fixture.input,
    now: '2026-09-12T03:00Z',
    expected: { months: 12, soul: '사', mainStars: 2, pattern: null },
  },
  {
    id: 'leap',
    input: fixture.input,
    now: '2025-09-12T03:00Z',
    expected: { months: 14, soul: '사', mainStars: 2, pattern: null },
  },
  {
    id: 'late-rat',
    input: { ...fixture.input, hour: 23 },
    now: '2025-09-12T03:00Z',
    expected: { months: 14 },
  },
  {
    id: 'empty-soul',
    input: { ...fixture.input, year: 2000, month: 1, day: 1, hour: 2 },
    now: '2026-09-12T03:00Z',
    expected: { months: 12, soul: '해', mainStars: 0 },
  },
  {
    id: 'zi-fu-tong-gong',
    input: { ...fixture.input, year: 2000, month: 1, day: 4, hour: 8 },
    now: '2026-09-12T03:00Z',
    expected: {
      months: 12,
      soul: '신',
      mainStars: 2,
      pattern: 'pattern:zi-fu-tong-gong',
    },
  },
  {
    id: 'zi-fu-jia-ming',
    input: { ...fixture.input, year: 2000, month: 1, day: 3, hour: 20 },
    now: '2026-09-12T03:00Z',
    expected: {
      months: 12,
      soul: '인',
      mainStars: 2,
      pattern: 'pattern:zi-fu-jia-ming',
    },
  },
] as const;
