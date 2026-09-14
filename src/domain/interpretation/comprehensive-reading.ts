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

const starContextTraits: Record<
  string,
  { sentence: string; connective: string }
> = {
  자미: {
    sentence: '전체 흐름을 먼저 살피고 방향과 기준을 정합니다.',
    connective: '전체 흐름을 먼저 살피고 방향과 기준을 정하면서',
  },
  천기: {
    sentence: '여러 가능성을 비교하고 상황에 맞게 방법을 바꿉니다.',
    connective: '여러 가능성을 비교하고 상황에 맞게 방법을 바꾸면서',
  },
  태양: {
    sentence: '생각을 분명히 밝히고 먼저 움직입니다.',
    connective: '생각을 분명히 밝히고 먼저 움직이면서',
  },
  무곡: {
    sentence: '할 일을 정하면 말보다 행동으로 해결합니다.',
    connective: '할 일을 정하면 말보다 행동으로 해결하면서',
  },
  천동: {
    sentence: '갈등을 줄이고 편안한 흐름을 유지하려 합니다.',
    connective: '갈등을 줄이고 편안한 흐름을 유지하면서',
  },
  염정: {
    sentence: '자신의 기준에 맞는지 꼼꼼히 확인합니다.',
    connective: '자신의 기준에 맞는지 꼼꼼히 확인하면서',
  },
  천부: {
    sentence: '현재 조건을 안정적으로 관리하고 실속을 챙깁니다.',
    connective: '현재 조건을 안정적으로 관리하고 실속을 챙기면서',
  },
  태음: {
    sentence: '감정과 주변 변화를 세심하게 살핀 뒤 움직입니다.',
    connective: '감정과 주변 변화를 세심하게 살핀 뒤 움직이면서',
  },
  탐랑: {
    sentence: '새로운 가능성과 즐거움을 적극적으로 찾습니다.',
    connective: '새로운 가능성과 즐거움을 적극적으로 찾으면서',
  },
  거문: {
    sentence: '이유와 조건을 말로 확인한 뒤 판단합니다.',
    connective: '이유와 조건을 말로 확인한 뒤 판단하면서',
  },
  천상: {
    sentence: '사람들의 입장과 역할을 조율합니다.',
    connective: '사람들의 입장과 역할을 조율하면서',
  },
  천량: {
    sentence: '원칙과 책임을 지키며 필요한 사람을 돌봅니다.',
    connective: '원칙과 책임을 지키며 필요한 사람을 돌보면서',
  },
  칠살: {
    sentence: '필요한 결정을 스스로 내리고 끝까지 밀고 나갑니다.',
    connective: '필요한 결정을 스스로 내리고 끝까지 밀고 나가면서',
  },
  파군: {
    sentence: '현재 방식이 맞지 않으면 과감히 바꾸고 새 기준을 만듭니다.',
    connective: '현재 방식이 맞지 않으면 과감히 바꾸고 새 기준을 만들면서',
  },
};

const healthContextTraits: typeof starContextTraits = {
  자미: {
    sentence: '생활 리듬의 전체 흐름을 살피고 회복 기준을 정합니다.',
    connective: '생활 리듬의 전체 흐름을 살피고 회복 기준을 정하면서',
  },
  천기: {
    sentence: '몸 상태에 따라 휴식과 활동 계획을 조정합니다.',
    connective: '몸 상태에 따라 휴식과 활동 계획을 조정하면서',
  },
  태양: {
    sentence: '활력이 생기면 적극적으로 움직이며 활동량을 늘립니다.',
    connective: '활력이 생기면 적극적으로 움직이며 활동량을 늘리면서',
  },
  무곡: {
    sentence: '피곤해도 하던 일을 마친 뒤에야 쉬는 편입니다.',
    connective: '피곤해도 하던 일을 마친 뒤에야 쉬는 한편',
  },
  천동: {
    sentence: '무리하기보다 편안한 리듬과 충분한 휴식을 선호합니다.',
    connective: '무리하기보다 편안한 리듬과 충분한 휴식을 선호하면서',
  },
  염정: {
    sentence: '몸의 작은 변화와 생활 습관을 꼼꼼히 확인합니다.',
    connective: '몸의 작은 변화와 생활 습관을 꼼꼼히 확인하면서',
  },
  천부: {
    sentence: '익숙하고 안정적인 수면과 식사 리듬을 지키려 합니다.',
    connective: '익숙하고 안정적인 수면과 식사 리듬을 지키면서',
  },
  태음: {
    sentence: '감정과 환경 변화가 컨디션에 미치는 영향을 세심히 살핍니다.',
    connective: '감정과 환경 변화가 컨디션에 미치는 영향을 세심히 살피면서',
  },
  탐랑: {
    sentence: '관심 있는 활동에 에너지를 많이 쓰고 다양한 자극을 찾습니다.',
    connective: '관심 있는 활동에 에너지를 많이 쓰고 다양한 자극을 찾으면서',
  },
  거문: {
    sentence: '불편함이 생긴 원인과 생활 조건을 자세히 확인합니다.',
    connective: '불편함이 생긴 원인과 생활 조건을 자세히 확인하면서',
  },
  천상: {
    sentence: '일정과 주변 사람을 고려해 휴식 시간을 조율합니다.',
    connective: '일정과 주변 사람을 고려해 휴식 시간을 조율하면서',
  },
  천량: {
    sentence: '회복 기준을 정하고 규칙적인 생활 리듬을 지킵니다.',
    connective: '회복 기준을 정하고 규칙적인 생활 리듬을 지키면서',
  },
  칠살: {
    sentence: '피로가 쌓여도 정한 일정은 끝까지 밀고 나가는 편입니다.',
    connective: '피로가 쌓여도 정한 일정은 끝까지 밀고 나가는 한편',
  },
  파군: {
    sentence: '현재 생활 리듬이 맞지 않으면 수면과 휴식 방식을 바꿉니다.',
    connective: '현재 생활 리듬이 맞지 않으면 수면과 휴식 방식을 바꾸면서',
  },
};

const palaceDetails: Record<
  string,
  {
    situation: string;
    strength: string;
    tension: string;
    scene: string;
  }
> = {
  명궁: {
    situation: '평소 판단하고 선택할 때',
    strength:
      '중요한 기준이 분명하면 결정을 내리고 그 결과를 책임지는 데 강합니다.',
    tension:
      '주변의 기대와 자신의 기준이 다르면 결정을 미루거나 한쪽 입장만 고수하기 쉽습니다.',
    scene:
      '새 일을 맡으면 목표를 먼저 정할지, 함께할 사람의 의견부터 들을지 자신의 기준에 따라 순서를 정합니다.',
  },
  천이: {
    situation: '낯선 환경에 적응하고 새로운 사람을 만날 때',
    strength:
      '처음 보는 상황에서도 자신이 맡을 역할과 주변 분위기를 파악하면 빠르게 자리를 잡습니다.',
    tension:
      '익숙하지 않은 자리에서 지나치게 앞서거나 다른 사람의 반응만 오래 살피면 평소의 장점을 제대로 쓰기 어렵습니다.',
    scene:
      '처음 가는 모임에서는 바로 말을 걸지, 사람과 분위기를 파악한 뒤 움직일지 빠르게 판단합니다.',
  },
  복덕: {
    situation: '혼자 쉬고 마음의 만족을 찾을 때',
    strength:
      '자신이 편안해지는 활동을 알고 있을 때 감정과 에너지를 안정적으로 회복합니다.',
    tension:
      '쉬는 동안에도 해야 할 일을 떠올리거나 남들이 좋다는 방법을 따르면 충분히 쉬고도 마음이 개운하지 않습니다.',
    scene:
      '일정이 없는 날에는 혼자 조용히 보내거나, 사람을 만나고 새로운 활동을 하면서 자신에게 맞는 방식으로 기분을 전환합니다.',
  },
  관록: {
    situation: '일의 우선순위와 책임을 정할 때',
    strength:
      '자신에게 맞는 역할과 조건을 만나면 업무를 계획하고 끝까지 마무리하는 힘이 살아납니다.',
    tension:
      '자신이 성과를 내는 방식과 조직의 기대가 다르면 능력과 별개로 충돌과 피로가 쌓이기 쉽습니다.',
    scene:
      '마감이 있는 일을 맡으면 계획의 순서를 정하고, 문제가 생기면 자신이 책임질 범위를 분명히 합니다.',
  },
  재백: {
    situation: '수입과 지출의 기준을 정할 때',
    strength:
      '돈과 시간을 어디에 쓸지 기준이 분명할수록 필요한 자원을 안정적으로 관리합니다.',
    tension:
      '안정감, 편리함, 즐거움 가운데 우선순위가 불분명하면 같은 지출을 두고 만족과 후회가 번갈아 생깁니다.',
    scene:
      '예상하지 못한 지출이 생기면 바로 결제하기보다 가격과 필요성을 비교하며 자신의 소비 기준을 확인합니다.',
  },
  전택: {
    situation: '집과 생활 기반을 관리할 때',
    strength:
      '편안함과 유지 비용을 함께 고려해 오래 머물 수 있는 생활 환경을 꾸립니다.',
    tension:
      '변화와 안정 가운데 한쪽만 고집하면 더 나은 환경을 놓치거나 필요 이상의 비용을 부담하기 쉽습니다.',
    scene:
      '이사나 큰 물건을 결정할 때는 익숙한 조건을 지킬지, 더 나은 생활을 위해 변화를 택할지 현실적으로 비교합니다.',
  },
  부처: {
    situation: '연인이나 배우자와 기대와 역할을 조율할 때',
    strength:
      '애정 표현과 생활의 책임을 서로 이해할 수 있는 방식으로 나눌 때 편안한 관계를 만듭니다.',
    tension:
      '상대가 알아주기만 기다리거나 자신의 방식을 당연하게 여기면 작은 차이도 반복되는 갈등으로 이어집니다.',
    scene:
      '주말 계획이나 집안일을 정할 때 먼저 의견을 말할지, 상대의 제안을 들은 뒤 조율할지 관계의 흐름을 살핍니다.',
  },
  질액: {
    situation: '피로 신호에 반응하고 생활 리듬을 조정할 때',
    strength:
      '몸의 변화를 일찍 알아차리고 자신에게 맞는 회복 방법을 찾으면 바쁜 시기에도 생활 리듬을 지킵니다.',
    tension:
      '해야 할 일을 먼저 처리하느라 피로를 뒤늦게 알아차리거나 생활 습관을 한꺼번에 바꾸면 일정한 리듬을 유지하기 어렵습니다.',
    scene:
      '일정이 몰리면 끝까지 밀어붙일지, 수면과 휴식을 위해 계획을 조정할지 평소의 회복 기준에 따라 결정합니다.',
  },
  부모: {
    situation: '부모의 기대와 도움을 받아들일 때',
    strength:
      '가족의 조언은 참고하되 중요한 선택은 자신의 기준으로 결정하려 합니다.',
    tension:
      '도움이 고맙지만 간섭처럼 느껴지면 대화를 미루거나 일부러 반대 방향을 택하기 쉽습니다.',
    scene:
      '진로나 생활 방식에 관한 의견을 들으면 그대로 따르기보다 자신의 기준과 이유를 설명하며 관계의 경계를 정합니다.',
  },
  형제: {
    situation: '형제자매나 가까운 가족과 도움을 주고받을 때',
    strength:
      '가까운 사이에서도 각자가 맡을 책임과 도움의 범위를 분명히 하는 편입니다.',
    tension:
      '가깝다는 이유로 설명을 생략하면 도움을 주고도 서운해지거나 상대의 부탁을 부담으로만 받아들이기 쉽습니다.',
    scene:
      '가족이 도움을 청하면 바로 나서기보다 먼저 사정을 듣고 자신이 맡을 범위를 확인합니다.',
  },
  자녀: {
    situation: '누군가를 돌보거나 성장을 도울 때',
    strength:
      '필요한 도움을 주면서도 상대가 스스로 해볼 시간과 선택권을 남겨두려 합니다.',
    tension:
      '잘되기를 바라는 마음이 앞서면 상대가 선택할 기회를 줄이고 결과에 대한 책임까지 대신 떠안기 쉽습니다.',
    scene:
      '누군가 어려움을 겪으면 답을 바로 알려주기보다 상황에 따라 스스로 시도할 시간을 주며 돕습니다.',
  },
  노복: {
    situation: '친구나 동료와 협력하고 역할을 나눌 때',
    strength:
      '친밀함과 별개로 역할과 약속을 분명히 하며 안정적인 협력 관계를 만듭니다.',
    tension:
      '관계의 분위기나 일의 성과 중 한쪽만 앞세우면 친한 사람과도 책임 범위를 두고 충돌하기 쉽습니다.',
    scene:
      '공동 작업을 시작하면 역할과 마감부터 정할지, 관계를 편안하게 만든 뒤 일을 나눌지 현재 조건에 맞춰 선택합니다.',
  },
};

function createContextualSentences(palaceName: string, starNames: string[]) {
  const detail = palaceDetails[palaceName];
  const traits = starNames.map((name) =>
    palaceName === '질액' ? healthContextTraits[name] : starContextTraits[name],
  );
  const traitSentence =
    traits.length === 1
      ? `${detail.situation} ${traits[0].sentence}`
      : `${detail.situation} ${traits[0].connective}, ${traits[1].sentence}`;

  return [traitSentence, detail.strength, detail.tension, detail.scene];
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
