import type { Chart } from '../ziwei/chart';
import type { StarContent } from '../content/star-content';
import {
  palaceReadingContexts,
  palaceStarReadings,
} from '../../content/palace-reading-rules';
import { consultationEvidence } from './consultation-evidence';
import { findOppositePalace } from './palace-reading';

export const readingTopics = [
  {
    id: 'personality',
    title: '나의 성향과 새로운 환경',
    palaces: ['명궁', '천이'],
    connection:
      '익숙한 곳에서의 선택과 낯선 곳에서의 반응을 함께 살펴, 상황에 따라 달라지는 내 모습을 이해합니다.',
  },
  {
    id: 'career',
    title: '일과 커리어',
    palaces: ['관록'],
    connection: '직업명보다 일을 맡고 수행하는 태도에 초점을 맞춥니다.',
  },
  {
    id: 'money',
    title: '돈과 생활의 기반',
    palaces: ['재백', '전택'],
    connection:
      '돈을 얻고 쓰는 태도와 생활의 기반을 유지하는 태도를 함께 살펴봅니다. 집을 꾸리고 함께 생활하는 데 돈과 자원을 어떻게 사용하는지 살펴보는 내용입니다. 재산의 규모를 예측하지는 않습니다.',
  },
  {
    id: 'relationships',
    title: '연인과 배우자 관계',
    palaces: ['부처'],
    connection:
      '상대의 운명을 예측하기보다 관계에서 기대하고 표현하는 방식을 살펴봅니다.',
  },
  {
    id: 'inner',
    title: '내면과 삶의 방향',
    palaces: ['복덕'],
    connection:
      '만족과 휴식의 기준을 살펴봅니다. 신궁의 위치는 행동과 관심사의 참고 자료로 함께 확인합니다.',
  },
  {
    id: 'health',
    title: '건강과 컨디션',
    palaces: ['질액'],
    connection:
      '생활을 관리하는 태도와 무리·휴식의 균형을 살핍니다. 질병의 진단이나 발생 시기를 계산하지 않습니다.',
  },
  {
    id: 'family',
    title: '가족과 주변 사람들',
    palaces: ['부모', '형제', '자녀', '노복'],
    connection:
      '기대와 돌봄, 가까운 가족을 존중하는 태도, 친구·동료와의 협력을 나누어 살펴봅니다. 한 관계의 특징을 모든 사람에게 적용하지 않습니다.',
  },
] as const;

const transformationMeaning = {
  록: '이 영역에서 무엇에 관심을 갖고 만족하는지 살펴봅니다. 편안하게 여기는 방식과 실제로 도움이 되는 방식이 같은지도 돌아보세요.',
  권: '이 영역에서는 스스로 방향을 정하고 책임지려는 마음에 주목합니다. 책임을 맡는 것과 모든 결정을 혼자 하는 것을 구분해보세요.',
  과: '이 영역에서는 다른 사람에게 자신을 어떻게 보여주고 어떤 인정을 받고 싶은지 살펴봅니다. 외부의 평가와 스스로 납득하는 기준을 나누어 생각해보세요.',
  기: '이 영역에서 무엇을 오래 고민하고 부담스러워하는지 살펴봅니다. 좋지 않은 사건의 예고로 받아들이기보다 반복해서 신경 쓰이는 상황을 돌아보세요.',
};

export function createComprehensiveReading(
  chart: Chart,
  content: StarContent[],
) {
  const facts = consultationEvidence(chart);
  return readingTopics.map((topic) => ({
    ...topic,
    readings: topic.palaces.map((name) => {
      const palace = chart.palaces.find((p) => p.name === name)!;
      const fact = facts.palaces.find((p) => p.name === name)!;
      const context = palaceReadingContexts[name];
      const directMajor = palace.stars.filter((s) => s.isMajor);
      const opposite =
        directMajor.length === 0 ? findOppositePalace(chart, palace) : null;
      const major = (opposite ?? palace).stars.filter((s) => s.isMajor);
      const supporting = palace.stars
        .filter((s) => !s.isMajor)
        .flatMap((star) => {
          const entry = content.find(
            (c) => c.star_key === `${star.category}:${star.name}`,
          );
          return entry ? [{ star, entry }] : [];
        });
      const names = new Set(palace.stars.map((s) => s.name));
      const interactions = [
        ...(names.has('천마') && names.has('타라')
          ? [
              {
                stars: ['천마', '타라'],
                text: '새로운 가능성을 찾고 싶은 마음과 충분히 살핀 뒤 움직이고 싶은 마음이 함께 나타날 수 있습니다. 변화의 속도와 준비할 시간을 나누어 정하면 두 태도를 함께 활용할 수 있습니다.',
              },
            ]
          : []),
        ...(names.has('경양') && names.has('령성')
          ? [
              {
                stars: ['경양', '령성'],
                text: '행동으로 빠르게 옮기려는 힘과 결과를 신중하게 따지는 마음이 함께 나타날 수 있습니다. 겉으로는 빠르게 행동해도 마음속으로는 결과를 오래 고민할 수 있습니다.',
              },
            ]
          : []),
      ];
      return {
        name,
        focus: context.focus,
        description: context.description,
        stars: major.map((star) => ({
          star,
          ...palaceStarReadings[star.name],
        })),
        empty: directMajor.length === 0,
        oppositeReference: opposite
          ? {
              name: opposite.name,
              earthlyBranch: opposite.earthlyBranch,
            }
          : null,
        supporting,
        interactions,
        transformations: palace.stars
          .filter((s) => s.transformation)
          .map((star) => ({
            star,
            text: transformationMeaning[star.transformation!],
          })),
        related: fact.relatedPalaceIds
          .slice(1)
          .map((id) => facts.palaces.find((p) => p.id === id)!),
        practice: context.practice,
      };
    }),
  }));
}
