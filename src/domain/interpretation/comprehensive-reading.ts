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

const starContextTraits: Record<string, string> = {
  자미: '전체 흐름을 보고 방향과 기준을 정하는 태도',
  천기: '여러 가능성을 비교하며 상황에 맞게 방법을 바꾸는 태도',
  태양: '생각을 분명히 드러내고 먼저 움직이는 태도',
  무곡: '실행할 일을 정하면 말보다 행동으로 해결하는 태도',
  천동: '갈등을 줄이고 편안한 흐름을 유지하려는 태도',
  염정: '자신의 기준에 맞는지 꼼꼼히 확인하는 태도',
  천부: '현재 조건을 안정적으로 관리하며 실속을 챙기는 태도',
  태음: '감정과 주변 변화를 세심하게 살핀 뒤 움직이는 태도',
  탐랑: '새로운 가능성과 즐거움을 적극적으로 찾는 태도',
  거문: '이유와 조건을 말로 확인하며 판단하는 태도',
  천상: '사람들의 입장과 역할을 조율하는 태도',
  천량: '원칙과 책임을 지키며 필요한 사람을 돌보는 태도',
  칠살: '필요한 결정을 스스로 내리고 꾸준히 밀고 나가는 태도',
  파군: '현재 방식이 맞지 않으면 바꾸고 새 기준을 만드는 태도',
};

const healthContextTraits: Record<string, string> = {
  자미: '생활 리듬의 전체 흐름을 보고 회복 기준을 정하는 태도',
  천기: '몸 상태의 변화에 따라 휴식과 활동 계획을 조정하는 태도',
  태양: '활력이 있을 때 적극적으로 움직이며 활동량을 넓히는 태도',
  무곡: '피로해도 하던 일을 마친 뒤에 쉬려는 태도',
  천동: '무리하기보다 편안한 리듬과 충분한 휴식을 선호하는 태도',
  염정: '몸의 작은 변화와 생활 기준을 꼼꼼히 확인하는 태도',
  천부: '익숙하고 안정적인 수면·식사 리듬을 유지하려는 태도',
  태음: '감정과 환경 변화가 컨디션에 미치는 영향을 세심히 살피는 태도',
  탐랑: '관심 있는 활동에 에너지를 많이 쓰고 다양한 자극을 찾는 태도',
  거문: '불편한 원인과 생활 조건을 자세히 확인하려는 태도',
  천상: '일정과 주변 사람을 고려해 휴식 시간을 조율하는 태도',
  천량: '회복을 위한 기준을 정하고 규칙적인 생활 리듬을 지키려는 태도',
  칠살: '피로가 있어도 정한 일정은 끝까지 밀고 나가려는 태도',
  파군: '현재 생활 리듬이 맞지 않으면 수면과 휴식 방식을 바꾸는 태도',
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
      '자신에게 중요한 기준이 분명한 상황에서는 선택의 속도와 책임지는 방식에 강점이 드러납니다.',
    tension:
      '반대로 주변의 기대와 자신의 기준이 다르면 결정을 미루거나 한쪽 입장만 고수할 수 있습니다.',
    scene:
      '새 일을 맡았을 때 목표부터 정하는지, 함께할 사람의 의견부터 듣는지에서 평소의 판단 방식이 드러납니다.',
  },
  천이: {
    situation: '낯선 환경에 적응하고 새로운 사람을 만날 때',
    strength:
      '처음 보는 상황에서도 자신이 맡을 역할과 주변 분위기를 파악하면 적응 속도가 빨라질 수 있습니다.',
    tension:
      '익숙하지 않은 자리에서 평소보다 지나치게 앞서거나 반대로 반응을 오래 살피면 본래의 장점이 잘 드러나지 않을 수 있습니다.',
    scene:
      '처음 가는 모임에서 먼저 말을 거는지, 사람과 분위기를 파악한 뒤 움직이는지에 바깥 환경에서의 반응이 나타납니다.',
  },
  복덕: {
    situation: '혼자 쉬고 마음의 만족을 찾을 때',
    strength:
      '남에게 보여주는 성과와 별개로 자신이 편안해지는 활동을 알면 감정과 에너지를 안정적으로 회복할 수 있습니다.',
    tension:
      '해야 할 일을 계속 떠올리거나 다른 사람의 기준에 맞는 휴식을 선택하면 쉬고도 마음이 개운하지 않을 수 있습니다.',
    scene:
      '일정이 없는 날 조용히 혼자 보내는지, 사람을 만나거나 새로운 활동을 찾는지에서 마음을 회복하는 방식이 드러납니다.',
  },
  관록: {
    situation: '일의 우선순위와 책임을 정할 때',
    strength:
      '자신에게 맞는 역할과 일하는 조건을 만나면 업무를 시작하고 끝내는 과정에서 강점이 분명하게 나타납니다.',
    tension:
      '성과를 내는 방식과 조직이 기대하는 방식이 다르면 능력이 있어도 불필요한 충돌이나 피로가 생길 수 있습니다.',
    scene:
      '마감이 있는 일을 맡았을 때 계획을 세우는 순서와 문제가 생겼을 때 책임지는 방식에서 일할 때의 강점이 드러납니다.',
  },
  재백: {
    situation: '수입과 지출의 기준을 정할 때',
    strength:
      '무엇에 돈과 시간을 쓸 가치가 있는지 기준을 세우면 필요한 자원을 더 안정적으로 관리할 수 있습니다.',
    tension:
      '안정감, 편리함, 즐거움 가운데 무엇을 우선하는지가 분명하지 않으면 같은 지출을 두고도 만족과 후회가 번갈아 나타날 수 있습니다.',
    scene:
      '예상하지 못한 지출이 생겼을 때 바로 결제하는지, 가격과 필요성을 비교한 뒤 결정하는지에서 돈을 대하는 기준이 드러납니다.',
  },
  전택: {
    situation: '집과 생활 기반을 관리할 때',
    strength:
      '편안함과 유지 비용을 함께 고려하면 오래 지낼 수 있는 생활 환경을 안정적으로 만들 수 있습니다.',
    tension:
      '변화와 안정 가운데 한쪽만 우선하면 더 나은 환경을 놓치거나 필요 이상의 비용을 감당할 수 있습니다.',
    scene:
      '이사나 큰 물건을 결정할 때 익숙한 조건을 지키는지, 더 나은 생활을 위해 변화를 택하는지에 생활 기반을 대하는 태도가 나타납니다.',
  },
  부처: {
    situation: '연인이나 배우자와 기대와 역할을 조율할 때',
    strength:
      '애정 표현과 생활의 책임을 서로 이해할 수 있는 방식으로 나누면 관계에서 자신의 장점이 잘 드러납니다.',
    tension:
      '상대가 알아주기를 기다리거나 자신의 방식만 당연하다고 여기면 작은 차이도 반복되는 갈등이 될 수 있습니다.',
    scene:
      '함께 주말 계획을 세우거나 집안일을 나눌 때 먼저 의견을 말하는지, 상대의 제안을 기다리는지에 관계 방식이 나타납니다.',
  },
  질액: {
    situation: '피로 신호에 반응하고 생활 리듬을 조정할 때',
    strength:
      '몸의 변화를 알아차리는 시점과 자신에게 맞는 회복 방법을 알면 일정이 많을 때도 컨디션을 안정적으로 관리할 수 있습니다.',
    tension:
      '해야 할 일을 우선해 피로를 뒤늦게 알아차리거나, 생활 습관을 한꺼번에 바꾸면 오히려 꾸준한 리듬을 만들기 어려울 수 있습니다.',
    scene:
      '일정이 몰렸을 때 끝까지 밀어붙이는지, 수면과 휴식을 위해 계획을 조정하는지에서 컨디션을 다루는 방식이 드러납니다.',
  },
  부모: {
    situation: '부모의 기대와 도움을 받아들일 때',
    strength:
      '가족의 조언과 자신의 판단을 구분할 수 있으면 도움을 받으면서도 중요한 선택의 주도권을 지킬 수 있습니다.',
    tension:
      '고마움과 부담을 한꺼번에 느끼면 필요한 대화를 미루거나 가족의 의견에 반대로만 반응할 수 있습니다.',
    scene:
      '진로나 생활 방식에 관한 가족의 의견을 들을 때 바로 따르는지, 자신의 기준과 이유를 설명하는지에 관계의 경계가 나타납니다.',
  },
  형제: {
    situation: '형제자매나 가까운 가족과 도움을 주고받을 때',
    strength:
      '친밀함과 각자의 책임을 함께 존중하면 가까운 관계를 유지하면서도 부담을 공정하게 나눌 수 있습니다.',
    tension:
      '가까운 사이라는 이유로 설명을 생략하면 도움을 주고도 서운하거나 상대의 부탁을 부담으로만 느낄 수 있습니다.',
    scene:
      '가족이 도움을 청했을 때 바로 나서는지, 먼저 사정과 맡을 범위를 확인하는지에서 가까운 사람을 대하는 방식이 드러납니다.',
  },
  자녀: {
    situation: '누군가를 돌보거나 성장을 도울 때',
    strength:
      '필요한 도움과 스스로 해볼 시간을 구분하면 상대의 성장을 지지하면서 안정적인 관계를 이어갈 수 있습니다.',
    tension:
      '잘되기를 바라는 마음이 앞서면 상대가 선택할 기회를 줄이거나 결과에 대한 책임까지 대신 떠안을 수 있습니다.',
    scene:
      '어려움을 겪는 사람에게 답을 바로 알려주는지, 스스로 시도할 시간을 주는지에서 돌봄과 기대를 표현하는 방식이 나타납니다.',
  },
  노복: {
    situation: '친구나 동료와 협력하고 역할을 나눌 때',
    strength:
      '친밀함과 별개로 역할과 약속을 분명히 하면 다양한 사람과 안정적으로 협력할 수 있습니다.',
    tension:
      '관계의 분위기나 일의 성과 가운데 한쪽만 우선하면 친한 사람과도 책임 범위를 두고 갈등이 생길 수 있습니다.',
    scene:
      '공동 작업을 시작할 때 역할과 마감부터 정하는지, 관계를 편안하게 만든 뒤 일을 나누는지에서 협력 방식이 드러납니다.',
  },
};

function createContextualSentences(palaceName: string, starNames: string[]) {
  const detail = palaceDetails[palaceName];
  const traits = starNames.map((name) =>
    palaceName === '질액' ? healthContextTraits[name] : starContextTraits[name],
  );
  const traitSentence =
    traits.length === 1
      ? `${detail.situation} ${traits[0]}가 두드러집니다.`
      : `${detail.situation} ${traits[0]}와 ${traits[1]}가 함께 나타납니다.`;

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
