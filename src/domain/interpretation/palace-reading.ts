import type { Chart } from '../ziwei/chart';
import {
  palaceReadingContexts,
  palaceStarReadings,
} from '../../content/palace-reading-rules';

export function createPalaceReading(palace: Chart['palaces'][number]) {
  const context = palaceReadingContexts[palace.name];
  if (!context) throw new Error('Unsupported palace');
  const stars = palace.stars.filter(
    (star) => star.category === 'major' && star.isMajor,
  );
  const entries = stars.map((star) => {
    const rule = palaceStarReadings[star.name];
    if (!rule) throw new Error('Unsupported major star');
    return {
      starName: star.name,
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
  return {
    ...context,
    simpleDescription: context.description,
    entries,
    detailedDescription: [
      context.description,
      `이 궁에서 살펴볼 중심 주제는 ‘${context.focus}’입니다.`,
      '편안할 때의 모습과 부담을 느낄 때 반복하는 반응을 함께 살펴봅니다.',
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
      ? `명반에서 이 영역에 놓인 중심 별은 ${entries.map((entry) => entry.starName).join('·')}입니다. 이 별들의 기본 의미를 바탕으로 ${context.focus}을 살펴봅니다.`
      : '명반에서 이 영역에는 중심 별이 없습니다. 이 영역이 중요하지 않거나 좋지 않다는 뜻은 아닙니다. 지금 제공하는 기본 풀이만으로는 나의 모습을 설명하기 어려우므로 다른 별과 궁의 관계를 함께 살펴야 합니다.',
    scope:
      entries.length > 1
        ? '함께 놓인 별의 기본 의미를 각각 풀었습니다. 별들이 서로 보완하거나 달라지는 부분까지 종합한 풀이는 아닙니다.'
        : '이 궁의 주성에서 읽는 기본적인 모습입니다. 보조성·밝기·사화와 다른 궁의 관계에 따라 해석은 달라질 수 있습니다.',
  };
}
