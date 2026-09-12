import type { Chart } from '../ziwei/chart';
import {
  palaceReadingContexts,
  palaceStarCombinationReadings,
  palaceStarReadings,
} from '../../content/palace-reading-rules';

const earthlyBranches = [
  '자',
  '축',
  '인',
  '묘',
  '진',
  '사',
  '오',
  '미',
  '신',
  '유',
  '술',
  '해',
] as const;

export const palaceLabel = (name: string) =>
  name.endsWith('궁') ? name : `${name}궁`;

export function findOppositePalace(
  chart: Chart,
  palace: Chart['palaces'][number],
) {
  // Mirrors iztro 2.6.1 getSurroundedPalaces: the opposite is +6 by branch.
  const position = earthlyBranches.indexOf(
    palace.earthlyBranch as (typeof earthlyBranches)[number],
  );
  if (position < 0) throw new Error('Unsupported earthly branch');
  const oppositeBranch = earthlyBranches[(position + 6) % 12];
  const opposite = chart.palaces.find(
    (candidate) => candidate.earthlyBranch === oppositeBranch,
  );
  if (!opposite) throw new Error('Missing opposite palace');
  return opposite;
}

export function createStarCombinationReading(starNames: string[]) {
  if (starNames.length !== 2) return null;
  const names = [...starNames].sort();
  const rule = palaceStarCombinationReadings[names.join('+')];
  if (!rule) throw new Error('Unsupported major star combination');
  return { starNames: names, ...rule };
}

export function createPalaceReading(
  chart: Chart,
  palace: Chart['palaces'][number],
) {
  const context = palaceReadingContexts[palace.name];
  if (!context) throw new Error('Unsupported palace');
  const directStars = palace.stars.filter(
    (star) => star.category === 'major' && star.isMajor,
  );
  const opposite =
    directStars.length === 0 ? findOppositePalace(chart, palace) : null;
  const sourcePalace = opposite ?? palace;
  const stars = sourcePalace.stars.filter(
    (star) => star.category === 'major' && star.isMajor,
  );
  const entries = stars.map((star) => {
    const rule = palaceStarReadings[star.name];
    if (!rule) throw new Error('Unsupported major star');
    return {
      starName: star.name,
      sourcePalaceName: sourcePalace.name,
      borrowedFromOpposite: opposite !== null,
      heading: rule.heading,
      simpleText: `${rule.meaning} ${rule.balance}`,
      detailedSentences: [
        rule.meaning,
        rule.strength,
        rule.caution,
        rule.balance,
      ],
    };
  });
  const combination = createStarCombinationReading(
    entries.map((entry) => entry.starName),
  );
  return {
    ...context,
    simpleDescription: context.description,
    entries,
    combination,
    detailedDescription: [
      context.description,
      combination
        ? `이 궁에서는 두 별의 조합이 ${context.focus}에서 ‘${combination.heading.replace(/ 모습$/, '')} 방식’으로 드러날 수 있습니다.`
        : `이 궁에서 살펴볼 중심 주제는 ‘${context.focus}’입니다.`,
      combination
        ? '두 성향이 동시에 드러나는 때와 한쪽 성향이 더 강해지는 때를 나누어 살펴보세요.'
        : '편안할 때의 모습과 부담을 느낄 때 반복하는 반응을 함께 살펴봅니다.',
      '한 번의 사건으로 결론을 내리기보다 비슷한 상황에서 되풀이되는 선택과 감정을 관찰하는 것이 중요합니다.',
    ],
    simplePractice: context.practice,
    detailedPractice: [
      context.practice,
      '먼저 최근 한 달 안에 이 생활 영역과 관련해 기억에 남는 상황 하나를 떠올려보세요.',
      '그때 수월했던 일과 힘들었던 일을 나누어 적으면 비슷한 상황에서 어떤 선택을 반복하는지 알아보는 데 도움이 됩니다.',
      '별 설명을 자신의 경험과 비교하며, 다음 선택에서 살릴 강점과 조절할 부분을 찾아보세요.',
    ],
    introduction: entries.length
      ? opposite
        ? `명반에서 이 영역에는 주성이 없습니다. 주성이 없다고 이 영역이 비어 있거나 중요하지 않다는 뜻은 아닙니다. 이럴 때는 맞은편 ${palaceLabel(opposite.name)}에 놓인 ${entries.map((entry) => entry.starName).join('·')}의 기본 성향을 참고해 ${context.focus}을 살펴볼 수 있습니다. 다만 맞은편 궁의 뜻과 별의 성향이 이 영역에 그대로 나타난다고 단정하지 않고, 이 궁의 보조성과 주변 궁의 관계도 함께 확인해야 합니다.`
        : `명반에서 이 영역에 놓인 중심 별은 ${entries.map((entry) => entry.starName).join('·')}입니다. 이 별들의 기본 의미를 바탕으로 ${context.focus}을 살펴봅니다.`
      : '명반에서 이 영역과 맞은편 영역 모두에 주성이 없습니다. 이 영역이 비어 있거나 중요하지 않다는 뜻은 아닙니다. 지금 제공하는 기본 풀이만으로는 나의 모습을 설명하기 어려우므로 보조성과 주변 궁의 관계를 함께 살펴야 합니다.',
    scope:
      opposite && entries.length
        ? `주성이 없는 ${palaceLabel(palace.name)}을 이해하기 위해 맞은편 ${palaceLabel(opposite.name)}의 주성 기본 의미를 참고했습니다. 맞은편 궁의 의미를 ${palaceLabel(palace.name)}에 그대로 옮긴 결론은 아닙니다. 이 궁의 보조성·사화·밝기와 주변 궁의 관계를 종합한 풀이는 포함하지 않습니다.`
        : opposite
          ? `주성이 없는 ${palaceLabel(palace.name)}과 맞은편 ${palaceLabel(opposite.name)}의 주성 기본 의미만으로는 풀이를 제공하기 어렵습니다. 이 궁의 보조성과 주변 궁의 관계를 함께 살펴야 합니다.`
          : combination
            ? '두 주성의 개별 의미와 함께 두 성향이 만드는 공통 강점·주의점·균형점을 설명했습니다. 밝기·사화·보조성까지 종합한 전문 조합 풀이는 아닙니다.'
            : '이 설명은 이 궁에 있는 주요 별을 바탕으로 작성했습니다. 명반 전체를 함께 살펴보면 더 다양한 모습을 발견할 수 있습니다.',
  };
}
