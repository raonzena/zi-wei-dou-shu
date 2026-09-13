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
    id: 'personality',
    title: '나의 성향과 새로운 환경',
    palaces: ['명궁', '천이'],
    connection:
      '평소의 판단 방식과 낯선 환경에서 드러나는 반응을 나누어 설명합니다.',
  },
  {
    id: 'career',
    title: '일과 커리어',
    palaces: ['관록'],
    connection:
      '어떤 방식으로 일할 때 강점이 드러나는지, 책임과 성과를 어떻게 다루는지 설명합니다.',
  },
  {
    id: 'money',
    title: '돈과 생활의 기반',
    palaces: ['재백', '전택'],
    connection:
      '돈을 벌고 쓰는 기준과 집·생활 기반을 관리하는 방식을 설명합니다. 재산의 규모를 예측하지는 않습니다.',
  },
  {
    id: 'relationships',
    title: '연인과 배우자 관계',
    palaces: ['부처'],
    connection:
      '관계에서 무엇을 기대하고 감정을 어떻게 표현하는지 설명합니다. 상대의 운명이나 관계의 결과를 예측하지는 않습니다.',
  },
  {
    id: 'inner',
    title: '내면과 삶의 방향',
    palaces: ['복덕'],
    connection:
      '혼자 있을 때 마음이 향하는 곳과 만족·회복에 필요한 방식을 설명합니다. 신궁의 위치는 행동과 관심사의 참고 자료입니다.',
  },
  {
    id: 'health',
    title: '건강과 컨디션',
    palaces: ['질액'],
    connection:
      '피로 신호에 반응하는 습관과 생활 리듬을 설명합니다. 질병을 진단하거나 발생 시기를 예측하지는 않습니다.',
  },
  {
    id: 'family',
    title: '가족과 주변 사람들',
    palaces: ['부모', '형제', '자녀', '노복'],
    connection:
      '부모·형제자매·자녀·친구와 도움과 책임을 나누는 방식을 관계별로 설명합니다. 한 관계의 특징을 모든 사람에게 적용하지 않습니다.',
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

const palaceExamples: Record<string, string> = {
  명궁: '이 성향은 평소 결정을 내리고 역할을 정하는 방식으로 이어질 수 있습니다. 새 일을 맡았을 때 목표부터 정하는지, 주변 사람과 먼저 상의하는지에서 판단 기준이 드러납니다.',
  형제: '이 성향은 가까운 가족과 도움과 책임을 나누는 방식으로 이어질 수 있습니다. 가족이 도움을 청했을 때 바로 나서는지, 먼저 사정과 역할을 확인하는지에서 관계의 기준이 드러납니다.',
  부처: '이 성향은 연인이나 배우자와 의견과 역할을 조율하는 방식으로 이어질 수 있습니다. 함께 주말 계획을 세우거나 집안일을 나눌 때 먼저 방향을 제안하는지, 상대의 의견을 기다리는지에 관계 방식이 나타납니다.',
  자녀: '이 성향은 누군가를 돌보거나 성장을 돕는 방식으로 이어질 수 있습니다. 답을 바로 알려주는지, 스스로 해볼 시간을 주는지에서 돌봄과 기대를 표현하는 방식이 드러납니다.',
  재백: '이 성향은 돈을 쓰고 자원을 관리하는 기준으로 이어질 수 있습니다. 예상하지 못한 지출이 생겼을 때 바로 결제하는지, 여러 선택지를 비교하는지에서 무엇을 우선하는지가 나타납니다.',
  질액: '이 성향은 피로를 알아차리는 시점과 휴식 방식을 정하는 과정으로 이어질 수 있습니다. 일정이 몰렸을 때 끝까지 밀어붙이는지, 피로를 느끼면 계획을 조정하는지에서 생활 리듬을 다루는 방식이 드러납니다.',
  천이: '이 성향은 낯선 장소에서 사람을 만나고 새로운 상황에 적응하는 방식으로 이어질 수 있습니다. 처음 가는 모임에서 먼저 말을 거는지, 분위기와 사람을 파악한 뒤 움직이는지에 바깥 환경에서의 반응이 나타납니다.',
  노복: '이 성향은 친구·동료와 관계를 만들고 일을 나누는 방식으로 이어질 수 있습니다. 공동 작업을 시작할 때 역할부터 정하는지, 분위기를 만든 뒤 일을 나누는지에서 협력 방식이 드러납니다.',
  관록: '이 성향은 업무 계획을 세우고 책임을 나누며 문제에 대응하는 방식으로 이어질 수 있습니다. 마감이 있는 일을 맡았을 때 계획을 세우는 순서와 문제가 생겼을 때 책임지는 방식에서 일할 때의 강점이 드러납니다.',
  전택: '이 성향은 집을 꾸리고 생활 기반을 안정시키는 방식으로 이어질 수 있습니다. 이사나 큰 지출을 결정할 때 안정적인 조건을 우선하는지, 더 나은 환경을 위해 변화를 택하는지에 생활 기반을 대하는 태도가 드러납니다.',
  복덕: '이 성향은 마음을 쉬게 하고 만족을 얻는 방식으로 이어질 수 있습니다. 쉬는 날 혼자 조용히 시간을 보내는지, 사람을 만나거나 새로운 활동을 찾는지에서 회복 방식이 나타납니다.',
  부모: '이 성향은 부모의 기대와 도움을 받아들이는 방식으로 이어질 수 있습니다. 진로나 생활 방식에 관한 가족의 의견을 들을 때 그대로 따르는지, 자신의 기준을 설명하는지에 가족과의 경계가 드러납니다.',
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
      const directMajor = palace.stars.filter((s) => s.isMajor);
      const opposite =
        directMajor.length === 0 ? findOppositePalace(chart, palace) : null;
      const major = (opposite ?? palace).stars.filter((s) => s.isMajor);
      const combination = createStarCombinationReading(
        major.map((star) => star.name),
      );
      const usesBasicPersonalitySummary = (opposite ?? palace).name === '명궁';
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
        example: palaceExamples[name],
        stars: major.map((star) => {
          const { heading, meaning, strength, caution } =
            palaceStarReadings[star.name];
          return { star, heading, meaning, strength, caution };
        }),
        combination: combination
          ? {
              starNames: combination.starNames,
              heading: combination.heading,
              summary: combination.summary,
              strength: combination.strength,
              caution: combination.caution,
            }
          : null,
        usesBasicPersonalitySummary,
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
