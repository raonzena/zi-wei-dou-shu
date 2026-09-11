import type { Chart } from '../ziwei/chart';
import {
  basicReadingRules,
  basicReadingSource,
  basicReadingVersion,
} from '../../content/basic-reading-rules';

export type BasicReading = {
  version: string;
  source: string;
  status: 'single' | 'multiple' | 'empty';
  evidence: {
    palaceIndex: number;
    palaceName: string;
    earthlyBranch: string;
    stars: string[];
  };
  entries: {
    ruleId: string;
    starName: string;
    title: string;
    meaning: string;
  }[];
};

/** Accepts the validated service chart. No birth details or engine calls are needed. */
export function createBasicReading(chart: Chart): BasicReading {
  const palace = chart.palaces.find((p) => p.name === '명궁');
  if (!palace) throw new Error('Missing soul palace');
  const stars = palace.stars.filter((s) => s.category === 'major' && s.isMajor);
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
      stars.length === 0 ? 'empty' : stars.length === 1 ? 'single' : 'multiple',
    evidence: {
      palaceIndex: palace.index,
      palaceName: palace.name,
      earthlyBranch: palace.earthlyBranch,
      stars: entries.map((e) => e.starName),
    },
    entries,
  };
}
