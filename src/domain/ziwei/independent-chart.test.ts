import { describe, expect, it } from 'vitest';
import { calculateChart } from './calculate-chart.server';
import reference from './fixtures/cust-1929.json';

function chart(input: unknown = reference.input) {
  const result = calculateChart(input);
  if (!result.success) throw new Error(result.error.code);
  return result.data.chart;
}
function placements(value = chart()) {
  return value.palaces.flatMap((palace) =>
    palace.stars.map((star) => ({
      name: star.name,
      branch: palace.earthlyBranch,
    })),
  );
}

describe('independent CUST reference: verified matching scope', () => {
  it('matches the published soul/body palaces, element class and all 12 palace stems', () => {
    const actual = chart();
    expect(actual.soulPalaceBranch).toBe(reference.soulPalaceBranch);
    expect(actual.bodyPalaceBranch).toBe(reference.bodyPalaceBranch);
    expect(actual.fiveElementsClass).toBe(reference.fiveElementsClass);
    expect(
      actual.palaces.filter((p) => p.isBodyPalace).map((p) => p.earthlyBranch),
    ).toEqual(['묘']);
    expect(
      actual.palaces.map((p) => ({
        earthlyBranch: p.earthlyBranch,
        heavenlyStem: p.heavenlyStem,
        name: p.name,
        majorStars: p.stars
          .filter((s) => s.isMajor)
          .map((s) => s.name)
          .sort(),
      })),
    ).toEqual(
      reference.palaces.map((p) => ({
        ...p,
        majorStars: [...p.majorStars].sort(),
      })),
    );
  });
  it.each(reference.supportingPlacements)(
    'places $name at $branch',
    (expected) => {
      const actual = chart().palaces.flatMap((p) =>
        p.stars
          .filter(
            (s) =>
              s.name === expected.name &&
              (s.name !== '천월' || s.category === 'minor'),
          )
          .map((s) => ({ name: s.name, branch: p.earthlyBranch })),
      );
      expect(actual).toEqual([expected]);
    },
  );
  it('keeps 天鉞 and 天月 distinguishable despite the same Korean name', () => {
    expect(
      chart().palaces.flatMap((p) =>
        p.stars
          .filter((s) => s.name === '천월')
          .map((s) => ({ category: s.category, branch: p.earthlyBranch })),
      ),
    ).toEqual([
      { category: 'adjective', branch: '진' },
      { category: 'minor', branch: '신' },
    ]);
  });
  it('matches the 己 stem transformation table', () => {
    expect(
      chart()
        .palaces.flatMap((p) => p.stars)
        .filter((s) => s.transformation)
        .map(({ name, transformation }) => ({ name, transformation })),
    ).toEqual(expect.arrayContaining(reference.transformations));
  });
});

// User-selected iztro policy. Source differences are retained, not counted as independent matches.
describe('accepted iztro policy differences from CUST', () => {
  it('reproduces the opposite 火星/鈴星 locations, without accepting source equivalence', () => {
    const conflict = reference.sourceConflicts[0];
    const actual = placements().filter((s) =>
      conflict.source.some((e) => e.name === s.name),
    );
    expect(actual).toEqual(expect.arrayContaining(conflict.iztroObserved));
    expect(actual).not.toEqual(expect.arrayContaining(conflict.source));
  });
  it('reproduces 壬 化科 on 좌보 instead of the source table 천부', () => {
    const actual = chart({ ...reference.input, year: 2012, month: 8, day: 16 });
    const science = actual.palaces
      .flatMap((p) => p.stars)
      .filter((s) => s.transformation === '과');
    expect(science.map((s) => s.name)).toEqual(['좌보']);
    expect(science.map((s) => s.name)).not.toEqual(['천부']);
  });
});

// User accepted this iztro exception for v1; future change needs a new policy.
describe('accepted iztro leap late-rat exception', () => {
  it('reproduces leap-month late-rat disagreement with the general split-month description', () => {
    // HKO: April 5 = leap 2/15; April 6 = leap 2/16. CUST month/hour soul rule:
    // month 2 + 子 => 卯, month 3 + 子 => 辰. v1 uses next month after day 15.
    const input = { ...reference.input, year: 2023, month: 4, minute: 0 };
    expect(chart({ ...input, day: 5, hour: 0 }).soulPalaceBranch).toBe('묘');
    expect(chart({ ...input, day: 6, hour: 0 }).soulPalaceBranch).toBe('진');
    const late = chart({ ...input, day: 6, hour: 23 }).soulPalaceBranch;
    expect(late).toBe('묘');
    expect(late).not.toBe('진');
  });
});
