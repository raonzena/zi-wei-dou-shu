import type { IFunctionalAstrolabe } from 'iztro/lib/astro/FunctionalAstrolabe';
import type { HoroscopeItem } from 'iztro/lib/data/types';
import { timingSchema } from './timing';

/** Project only the supported timing layers; never expose rawDates or birth data. */
export function projectTiming(raw: IFunctionalAstrolabe, year: number) {
  const list = raw.decadalList();
  const layer = (item: HoroscopeItem, id: string) => ({
    id,
    soulPalaceId: `palace:${raw.palaces[item.index].earthlyBranch}`,
    heavenlyStem: item.heavenlyStem,
    earthlyBranch: item.earthlyBranch,
    palaceNames: item.palaceNames,
    movingStars: (item.stars ?? []).flatMap((stars, index) =>
      stars.map((s) => ({
        name: s.name,
        palaceId: `palace:${raw.palaces[index].earthlyBranch}`,
      })),
    ),
    transformations: item.mutagen.map((name, index) => {
      const palace = raw.palaces.find((p) =>
        [...p.majorStars, ...p.minorStars].some((s) => s.name === name),
      );
      if (!palace) throw new Error('Missing transformation star');
      return {
        type: (['록', '권', '과', '기'] as const)[index],
        starName: name,
        palaceId: `palace:${palace.earthlyBranch}`,
      };
    }),
  });
  const direction = (list[1].index - list[0].index + 12) % 12;
  if (direction !== 1 && direction !== 11)
    throw new Error('Invalid decadal direction');
  const decadals = list.map((item) => ({
    ...layer(item, `decadal:${item.ageRange[0]}`),
    ageRange: item.ageRange,
    yearRange: item.yearRange,
  }));
  // July 1 unambiguously selects the named lunar year, even before this year's New Year.
  // Use the native monthly list to retain lunar month boundaries and leap halves.
  const yearly = raw.horoscope(`${year}-7-1`, 0).yearly;
  return timingSchema.parse({
    policy: 'iztro-timing-v2',
    ageBasis: 'iztro 음력 연도 차이 + 1 (만 나이 아님)',
    yearBoundary: 'iztro 음력 정월 초하루',
    direction: direction === 1 ? '순행' : '역행',
    startAge: list[0].ageRange[0],
    decadals,
    monthly: raw.monthlyList(year, true).map((m) => ({
      ...layer(
        m,
        `monthly:${year}:${m.month}:${m.isLeapMonth ? 'leap' : 'regular'}:${m.part}`,
      ),
      year,
      month: m.month,
      isLeapMonth: m.isLeapMonth,
      part: m.part,
      dayRange: m.dayRange,
    })),
    yearly: {
      ...layer(yearly, `yearly:${year}`),
      year,
      currentDecadalId:
        decadals.find((d) => year >= d.yearRange[0] && year <= d.yearRange[1])
          ?.id ?? null,
    },
  });
}
