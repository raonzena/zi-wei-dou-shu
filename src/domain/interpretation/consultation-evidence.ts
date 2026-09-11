import type { Chart } from '../ziwei/chart';
import { starTerms } from '../../content/glossary';

const branches = [
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
];
export function consultationEvidence(chart: Chart) {
  const palaces = chart.palaces.map((p) => {
    const position = branches.indexOf(p.earthlyBranch);
    if (position < 0) throw new Error('Unknown branch');
    return {
      id: `palace:${p.earthlyBranch}`,
      name: p.name,
      heavenlyStem: p.heavenlyStem,
      earthlyBranch: p.earthlyBranch,
      isBodyPalace: p.isBodyPalace,
      relatedPalaceIds: [0, 4, 8, 6].map(
        (offset) => `palace:${branches[(position + offset) % 12]}`,
      ),
      stars: p.stars
        .filter((s) => Object.hasOwn(starTerms, `${s.category}:${s.name}`))
        .map((s) => ({
          id: `star:${p.earthlyBranch}:${s.category}:${s.name}`,
          name: s.name,
          category: s.category,
          isMajor: s.isMajor,
          natalTransformation: s.transformation,
        })),
    };
  });
  return {
    source: 'server-calculated-natal-chart',
    engine: 'iztro 2.6.1 / ADR-0003',
    chartType: '본명반',
    metadata: {
      id: 'chart',
      fiveElementsClass: chart.fiveElementsClass,
      soulPalaceBranch: chart.soulPalaceBranch,
      bodyPalaceBranch: chart.bodyPalaceBranch,
    },
    palaceAliases: { 노복: '교우궁', 부처: '부처궁', 관록: '관록궁' },
    relationOrder: '본궁, 두 삼합궁, 대궁',
    transformationLayer: '생년사화만 제공',
    missing: [
      '캡처 이미지',
      '원본 출생 날짜·시각·성별·지역 (외부 전송 제외)',
      '명주·신주',
      '별의 밝기 (미검증)',
      '표시 범위 외 성요',
      '대한·대한사화·시작 나이·진행 방향',
      '유년·유년사화·연도·나이 환산 기준',
      '유월',
      '자화·비화',
      '격국 성립 판정',
      '과거 경험',
    ],
    palaces,
  };
}
export type ConsultationEvidence = ReturnType<typeof consultationEvidence>;
export function evidenceIds(evidence: ConsultationEvidence) {
  return new Set([
    'chart',
    ...evidence.palaces.flatMap((p) => [p.id, ...p.stars.map((s) => s.id)]),
  ]);
}
