import { inspectPatterns } from './patterns';
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
          brightness: s.brightness,
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
      soulStar: chart.soulStar,
      bodyStar: chart.bodyStar,
      fiveElementsClass: chart.fiveElementsClass,
      soulPalaceBranch: chart.soulPalaceBranch,
      bodyPalaceBranch: chart.bodyPalaceBranch,
    },
    palaceAliases: { 노복: '교우궁', 부처: '부처궁', 관록: '관록궁' },
    relationOrder: '본궁, 두 삼합궁, 대궁',
    transformationLayer:
      'palaces는 생년사화, timing은 각 대한·유년·유월의 사화; flyingTransformations는 본명반 궁간 사화',
    brightnessScale: {
      '[+3]': '묘',
      '[+2]': '왕',
      '[+1]': '득',
      '[0]': '리',
      '[-1]': '평',
      '[-2]': '불',
      '[-3]': '함',
    },
    brightnessSource:
      'iztro 2.6.1 기본표; null은 등급 미제공이며 낮은 등급이 아님',
    timing: chart.timing,
    flyingTransformations: chart.flyingTransformations,
    patterns: inspectPatterns(chart),
    excluded: [
      '캡처 이미지 (서버 계산 명반으로 대체)',
      '원본 출생 날짜·시각·성별·지역 (개인정보 보호)',
    ],
    missing: [
      '표시 범위 밖 잡요·신살',
      '등록한 두 구조 외 격국 및 길흉·성패 판정',
      '운한 궁간 비화와 연쇄 비화·학파별 확장 규칙',
      '과거 경험 (사용자 선택 정보)',
    ],
    palaces,
  };
}
export type ConsultationEvidence = ReturnType<typeof consultationEvidence>;
export function evidenceIds(evidence: ConsultationEvidence) {
  return new Set([
    'chart',
    ...evidence.timing.decadals.map((d) => d.id),
    evidence.timing.yearly.id,
    ...evidence.timing.monthly.map((m) => m.id),
    ...evidence.flyingTransformations.map((f) => f.id),
    ...evidence.patterns.map((p) => p.id),
    ...evidence.palaces.flatMap((p) => [p.id, ...p.stars.map((s) => s.id)]),
  ]);
}
