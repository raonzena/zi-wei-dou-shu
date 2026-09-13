import type { Chart } from '../ziwei/chart';
import {
  basicReadingRules,
  basicReadingSource,
  basicReadingVersion,
} from '../../content/basic-reading-rules';
import {
  createStarCombinationReading,
  findOppositePalace,
} from './palace-reading';
import { palaceStarReadings } from '../../content/palace-reading-rules';

export type BasicReading = {
  version: string;
  source: string;
  status: 'single' | 'multiple' | 'empty';
  evidence: {
    palaceIndex: number;
    palaceName: string;
    earthlyBranch: string;
    stars: string[];
    oppositeReference?: {
      palaceName: string;
      earthlyBranch: string;
      stars: string[];
    };
  };
  entries: {
    ruleId: string;
    starName: string;
    title: string;
    meaning: string;
  }[];
  combination: ReturnType<typeof createStarCombinationReading>;
};

export function createOverallPersonalitySummary(reading: BasicReading) {
  const source = reading.evidence.oppositeReference;
  const starNames = reading.entries.map((entry) => entry.starName);

  if (starNames.length === 0) {
    return [
      '명궁과 맞은편 궁에 주성이 없어, 주성만으로 기본 성향을 정리하기 어려운 명식입니다.',
      '성향이 없거나 명궁이 중요하지 않다는 뜻은 아닙니다.',
      '이 경우에는 명궁의 보조성과 삼방사정을 함께 확인해야 더 구체적인 특징을 읽을 수 있습니다.',
      '현재 풀이에서는 확인할 수 있는 근거의 범위까지만 안내합니다.',
    ];
  }

  const chartDescription = source
    ? `명궁에는 주성이 없고 맞은편 ${source.palaceName}궁의 주성을 참고해 기본 성향을 읽는 명식입니다.`
    : starNames.length === 2
      ? '명궁에 두 주성이 함께 자리한 명식입니다.'
      : `명궁의 주성이 ${starNames[0]}인 명식입니다.`;
  const interpretation =
    reading.combination ?? palaceStarReadings[starNames[0]];

  return [
    chartDescription,
    'summary' in interpretation
      ? interpretation.summary
      : interpretation.meaning,
    interpretation.strength,
    interpretation.caution,
    interpretation.balance,
  ];
}

/** Accepts the validated service chart. No birth details or engine calls are needed. */
export function createBasicReading(chart: Chart): BasicReading {
  const palace = chart.palaces.find((p) => p.name === '명궁');
  if (!palace) throw new Error('Missing soul palace');
  const directStars = palace.stars.filter(
    (s) => s.category === 'major' && s.isMajor,
  );
  const opposite =
    directStars.length === 0 ? findOppositePalace(chart, palace) : null;
  const stars = (opposite ?? palace).stars.filter(
    (s) => s.category === 'major' && s.isMajor,
  );
  const entries = stars
    .map((star) => {
      if (!Object.hasOwn(basicReadingRules, star.name))
        throw new Error('Unsupported major star');
      const rule = basicReadingRules[star.name];
      return {
        ruleId: rule.id,
        starName: star.name,
        title: rule.title,
        meaning: rule.meaning,
      };
    })
    .sort((a, b) => a.ruleId.localeCompare(b.ruleId, 'en'));
  return {
    version: basicReadingVersion,
    source: basicReadingSource,
    status:
      directStars.length === 0
        ? 'empty'
        : directStars.length === 1
          ? 'single'
          : 'multiple',
    evidence: {
      palaceIndex: palace.index,
      palaceName: palace.name,
      earthlyBranch: palace.earthlyBranch,
      stars: directStars.length ? entries.map((entry) => entry.starName) : [],
      ...(opposite
        ? {
            oppositeReference: {
              palaceName: opposite.name,
              earthlyBranch: opposite.earthlyBranch,
              stars: entries.map((entry) => entry.starName),
            },
          }
        : {}),
    },
    entries,
    combination: createStarCombinationReading(
      entries.map((entry) => entry.starName),
    ),
  };
}
