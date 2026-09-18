import type { Chart } from '../ziwei/chart';
import type { StarContent } from '../content/star-content';
import { palaceStarReadings } from '../../content/palace-reading-rules';
import { consultationEvidence } from './consultation-evidence';
import {
  createStarCombinationReading,
  findOppositePalace,
} from './palace-reading';

export const readingTopics = [
  {
    id: 'core',
    title: '핵심 성향',
    palaces: ['명궁', '천이'],
  },
  {
    id: 'inner',
    title: '내면과 삶의 방향',
    palaces: ['복덕'],
  },
  {
    id: 'career',
    title: '일과 커리어',
    palaces: ['관록'],
  },
  {
    id: 'money',
    title: '재물운',
    palaces: ['재백', '전택'],
  },
  {
    id: 'relationships',
    title: '연애 및 결혼운',
    palaces: ['부처'],
  },
  {
    id: 'health',
    title: '건강과 컨디션',
    palaces: ['질액'],
  },
  {
    id: 'family',
    title: '가족과 대인관계',
    palaces: ['부모', '형제', '자녀', '노복'],
  },
] as const;

const transformationMeaning = {
  록: '좋아하고 익숙하게 느끼는 대상에 관심이 자연스럽게 모일 수 있습니다. 만족을 주는 선택을 반복하며 그 대상에 시간과 자원을 더 쓰는 경향도 나타날 수 있습니다.',
  권: '맡은 일의 방향을 스스로 정하고 책임지려는 마음이 강하게 나타날 수 있습니다. 주도권이 필요한 상황에서는 빠르게 나서지만 역할이 불분명하면 결정을 혼자 떠안을 수 있습니다.',
  과: '자신의 능력과 준비한 결과를 다른 사람에게 인정받는 일을 중요하게 여길 수 있습니다. 내용을 정돈해 보여주는 데 강점이 있지만 주변의 평가에 민감해질 수도 있습니다.',
  기: '마음에 걸리는 일을 쉽게 넘기지 못하고 오래 고민하는 경향이 나타날 수 있습니다. 작은 불확실성도 반복해서 확인하거나 부담을 혼자 안고 갈 수 있지만 좋지 않은 사건을 예고한다는 뜻은 아닙니다.',
};

const palaceQuestions: Record<string, string> = {
  명궁: '평소에는 어떤 방식으로 판단하고 선택하나요?',
  형제: '형제자매나 가까운 가족을 어떻게 대하나요?',
  부처: '연인이나 배우자와 어떤 관계를 원하나요?',
  자녀: '돌봄과 기대를 어떤 방식으로 표현하나요?',
  재백: '돈을 벌고 쓸 때 무엇을 중요하게 여기나요?',
  질액: '피로와 생활 리듬을 어떻게 다루나요?',
  천이: '낯선 환경에서는 어떤 모습이 나타나나요?',
  노복: '친구·동료와 어떤 방식으로 협력하나요?',
  관록: '어떤 방식으로 일할 때 강점이 드러나나요?',
  전택: '집과 생활 기반을 어떻게 꾸리려 하나요?',
  복덕: '무엇에서 만족을 느끼고 어떻게 쉬나요?',
  부모: '부모의 기대와 도움을 어떻게 받아들이나요?',
};

const palaceSituations: Record<string, string> = {
  명궁: '평소 판단하고 선택할 때',
  천이: '낯선 환경에 적응하고 새로운 사람을 만날 때',
  복덕: '마음의 만족과 휴식 방법을 선택할 때',
  관록: '일의 우선순위와 책임을 정할 때',
  재백: '돈을 어디에 쓰고 무엇을 위해 모을지 정할 때',
  전택: '집과 생활 환경을 꾸릴 때',
  부처: '연인이나 배우자와 서로의 기대를 이야기할 때',
  질액: '활동과 휴식의 우선순위를 정할 때',
  부모: '부모의 기대와 도움을 받아들일 때',
  형제: '형제자매나 가까운 가족과 도움을 주고받을 때',
  자녀: '누군가를 돌보거나 성장을 도울 때',
  노복: '친구나 동료와 함께할 일을 정할 때',
};

function createContextualSentences(palaceName: string, starNames: string[]) {
  if (starNames.length === 0) return [];
  const rule =
    createStarCombinationReading(starNames) ?? palaceStarReadings[starNames[0]];
  const summary = 'summary' in rule ? rule.summary : rule.meaning;
  return [
    `${palaceSituations[palaceName]} ${summary}`,
    rule.strength,
    rule.caution,
    rule.balance,
  ];
}

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
      const directMajor = palace.stars.filter((s) => s.isMajor);
      const opposite =
        directMajor.length === 0 ? findOppositePalace(chart, palace) : null;
      const major = (opposite ?? palace).stars.filter((s) => s.isMajor);
      const combination = createStarCombinationReading(
        major.map((star) => star.name),
      );
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
                text: '새로운 가능성을 찾고 싶은 마음과 충분히 확인한 뒤 움직이고 싶은 마음이 함께 나타날 수 있습니다. 변화를 바라면서도 준비가 충분하다고 느낄 때까지 결정을 미루는 식으로 두 태도가 번갈아 나타날 수 있습니다.',
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
        question: palaceQuestions[name],
        sentences: createContextualSentences(
          name,
          major.map((star) => star.name),
        ),
        stars: major.map((star) => ({
          star,
          heading: palaceStarReadings[star.name].heading,
        })),
        combination: combination
          ? {
              starNames: combination.starNames,
              heading: combination.heading,
            }
          : null,
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
      };
    }),
  }));
}
