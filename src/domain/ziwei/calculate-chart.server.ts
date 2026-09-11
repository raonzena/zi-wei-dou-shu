import { Temporal } from '@js-temporal/polyfill';
import { astro } from 'iztro';
import { version as engineVersion } from 'iztro/package.json';
import {
  normalizeBirth,
  type BirthError,
  type NormalizedBirth,
} from '../birth/normalize-birth.server';
import { chartSchema, type Chart } from './chart';

const config = {
  yearDivide: 'normal',
  ageDivide: 'normal',
  dayDivide: 'forward',
  horoscopeDivide: 'normal',
  algorithm: 'default',
} as const;

// One server policy, never request-provided configuration or plugins.
astro.config(config);

export type ChartCalculationResult =
  | {
      success: true;
      data: {
        chart: Chart;
        birth: NormalizedBirth;
        engine: { name: 'iztro'; version: string };
      };
    }
  | {
      success: false;
      error:
        | BirthError
        | {
            code: 'calculation_failed';
            message: string;
          };
    };

/** Internal server entry point. `birth` is private; this result is not a share response. */
export function calculateChart(
  input: unknown,
  now: Temporal.Instant = Temporal.Now.instant(),
): ChartCalculationResult {
  const normalized = normalizeBirth(input, now);
  if (!normalized.success) return normalized;

  try {
    const active = astro.getConfig();
    if (
      Object.entries(config).some(
        ([key, value]) => active[key as keyof typeof config] !== value,
      ) ||
      Object.keys(active.mutagens).length > 0 ||
      Object.keys(active.brightness).length > 0
    ) {
      throw new Error('Unexpected engine configuration');
    }
    const { engineInput, gender } = normalized.data;
    // No awaits between language selection, calculation and projection.
    const raw = astro.bySolar(
      engineInput.solarDate,
      engineInput.timeIndex,
      gender,
      true,
      'ko-KR',
    );
    const chart = chartSchema.parse({
      soulPalaceBranch: raw.earthlyBranchOfSoulPalace,
      bodyPalaceBranch: raw.earthlyBranchOfBodyPalace,
      fiveElementsClass: raw.fiveElementsClass,
      palaces: raw.palaces.map((palace) => ({
        index: palace.index,
        name: palace.name,
        heavenlyStem: palace.heavenlyStem,
        earthlyBranch: palace.earthlyBranch,
        isBodyPalace: palace.isBodyPalace,
        stars: (
          [
            ['major', palace.majorStars],
            ['minor', palace.minorStars],
            ['adjective', palace.adjectiveStars],
          ] as const
        ).flatMap(([category, stars]) =>
          stars.map((star) => ({
            name: star.name,
            category,
            isMajor: star.type === 'major',
            brightness: star.brightness || null,
            transformation: star.mutagen || null,
          })),
        ),
      })),
    });
    return {
      success: true,
      data: {
        chart,
        birth: normalized.data,
        engine: { name: 'iztro', version: engineVersion },
      },
    };
  } catch {
    // Engine exceptions can contain birth details. Do not expose or log the raw exception.
    return {
      success: false,
      error: {
        code: 'calculation_failed',
        message: '명반을 계산하지 못했습니다. 잠시 후 다시 시도해주세요.',
      },
    };
  }
}
