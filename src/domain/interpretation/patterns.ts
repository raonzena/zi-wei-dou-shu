import type { Chart } from '../ziwei/chart';

/** Explicit structural checks, not an exhaustive auspicious/inauspicious verdict. */
export function inspectPatterns(chart: Chart) {
  const soul = chart.palaces.find((p) => p.name === '명궁')!;
  const has = (p: Chart['palaces'][number], name: string) =>
    p.stars.some((s) => s.isMajor && s.name === name);
  const adjacent = chart.palaces.filter((p) =>
    [1, 11].includes((p.index - soul.index + 12) % 12),
  );
  const inYinShen = ['인', '신'].includes(soul.earthlyBranch);
  return [
    {
      id: 'pattern:zi-fu-tong-gong',
      name: '자부동궁',
      condition: '명궁이 인·신궁이고 자미와 천부가 함께 있음',
      matched: inYinShen && has(soul, '자미') && has(soul, '천부'),
      palaceIds: [`palace:${soul.earthlyBranch}`],
    },
    {
      id: 'pattern:zi-fu-jia-ming',
      name: '자부협명',
      condition:
        '인·신 명궁에 천기·태음이 있고 양옆 궁에 자미와 천부가 나뉘어 있음',
      matched:
        inYinShen &&
        has(soul, '천기') &&
        has(soul, '태음') &&
        ((has(adjacent[0], '자미') && has(adjacent[1], '천부')) ||
          (has(adjacent[1], '자미') && has(adjacent[0], '천부'))),
      palaceIds: [soul, ...adjacent].map((p) => `palace:${p.earthlyBranch}`),
    },
  ].map((p) => ({
    ...p,
    ruleVersion: 'pattern-structure-v1',
    scope:
      '명궁 기준 배치 조건만 검사. 길흉·성패 판정과 다른 학파의 추가 조건은 미검증.',
    source: 'https://iztro.com/learn/pattern',
  }));
}
