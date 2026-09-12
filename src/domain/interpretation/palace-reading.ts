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
    return { starName: star.name, ...rule };
  });
  return {
    ...context,
    entries,
    introduction: entries.length
      ? `명반에서 이 영역에 놓인 중심 별은 ${entries.map((entry) => entry.starName).join('·')}입니다. 각 별이 상징하는 기본적인 모습을 ${context.focus}에 맞춰 풀어보면 다음과 같습니다.`
      : '명반에서 이 영역에는 중심 별이 없습니다. 이 영역이 중요하지 않거나 좋지 않다는 뜻은 아닙니다. 지금 제공하는 기본 풀이만으로는 나의 모습을 설명하기 어려우므로 다른 별과 궁의 관계를 함께 살펴야 합니다.',
    scope:
      entries.length > 1
        ? '함께 놓인 별의 기본 의미를 각각 풀었습니다. 별들이 서로 보완하거나 달라지는 부분까지 종합한 풀이는 아닙니다.'
        : '이 궁의 주성에서 읽는 기본적인 모습입니다. 보조성·밝기·사화와 다른 궁의 관계에 따라 해석은 달라질 수 있습니다.',
  };
}
