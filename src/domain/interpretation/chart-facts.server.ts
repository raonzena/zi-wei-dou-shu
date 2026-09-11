import 'server-only';
import type { Chart } from '../ziwei/chart';
import { starTerms } from '../../content/glossary';
import { consultationEvidence } from './consultation-evidence';

/** Display text is derived from the trusted chart, never from generated prose. */
export function createChartFacts(chart: Chart) {
  const evidence = consultationEvidence(chart);
  const palaceName = (id: string) =>
    evidence.palaces.find((p) => p.id === id)!.name;
  const references: Record<string, string> = {
    chart: `본명반 · ${chart.fiveElementsClass}`,
  };
  for (const p of evidence.palaces) {
    references[p.id] =
      `${p.name}${p.name === '노복' ? ' (교우궁)' : ''} · ${p.earthlyBranch}궁`;
    for (const s of p.stars)
      references[s.id] =
        `${references[p.id]} · ${starTerms[`${s.category}:${s.name}`].label}`;
  }
  for (const d of chart.timing.decadals)
    references[d.id] =
      `대한 ${d.ageRange.join('–')}세 · ${d.yearRange.join('–')}년`;
  references[chart.timing.yearly.id] =
    `${chart.timing.yearly.year}년 유년 · iztro 음력 기준`;
  for (const m of chart.timing.monthly)
    references[m.id] =
      `${m.year}년 ${m.isLeapMonth ? '윤' : ''}${m.month}월 ${m.dayRange.join('–')}일 · iztro 음력`;
  for (const f of chart.flyingTransformations)
    references[f.id] =
      `${palaceName(f.sourcePalaceId)} → ${palaceName(f.targetPalaceId)} · ${f.starName} 화${f.type}${f.self ? ' · 자화' : ''}`;
  for (const p of evidence.patterns)
    references[p.id] = `${p.name} · 배치 조건 ${p.matched ? '일치' : '불일치'}`;
  return {
    formatVersion: 'chart-facts-v1',
    summary: [
      { label: '명궁', value: `${chart.soulPalaceBranch}궁` },
      { label: '신궁', value: `${chart.bodyPalaceBranch}궁` },
      { label: '명주', value: chart.soulStar },
      { label: '신주', value: chart.bodyStar },
      { label: '오행국', value: chart.fiveElementsClass },
    ],
    policies: [
      '출생 정보: 한국 음력 입력을 지원하며, 당시 대한민국 표준시·서머타임을 반영합니다. 진태양시 보정은 적용하지 않습니다.',
      `운한: ${chart.timing.yearBoundary}에 연도가 시작합니다. 한국 음력이나 양력 날짜와 같다고 보장하지 않습니다.`,
      `계산용 나이: ${chart.timing.ageBasis}. 대한 구간은 수명을 뜻하지 않습니다.`,
      '밝기: 묘·왕·득·리·평·불·함의 전통 분류입니다. 등급 미제공을 낮은 등급으로 해석하지 않습니다.',
    ],
    source: 'iztro 2.6.1 기본표 · 한국 출생 시각 보정',
    supported: [
      '12궁, 14주성과 보조성 25개, 밝기와 생년사화',
      `전체 대한 12구간, ${chart.timing.yearly.year}년 유년과 유월 ${chart.timing.monthly.length}구간, 각 운한의 유요`,
      '본명반 궁간 사화 48개 관계와 자화 여부',
      '자부동궁·자부협명의 명궁 배치 조건 검사',
    ],
    unsupported: evidence.missing,
    sectionScopes: {
      2: '본명반의 배치와 두 격국 구조만 확인합니다. 길흉이나 성취를 확정하지 않습니다.',
      3: '제공된 전체 대한을 바탕으로 읽습니다. 시작 이전 시기와 수명은 판단하지 않습니다.',
      4: '금전 관련 상징을 살펴봅니다. 자산 규모나 투자 수익을 예측하지 않습니다.',
      5: '일을 대하는 태도와 역할을 살펴봅니다. 특정 직업이나 성과를 확정하지 않습니다.',
      6: '관계를 맺는 태도를 살펴봅니다. 만남이나 이별을 예언하지 않습니다.',
      7: '장기 관계의 생활 조건을 점검합니다. 결혼·이혼 여부를 확정하지 않습니다.',
      8: '생활 습관을 돌아보는 참고입니다. 질병·사고·수명의 진단이 아닙니다.',
      9: '관계에서 자신의 태도를 점검합니다. 타인의 성격이나 행동을 단정하지 않습니다.',
      10: chart.timing.yearly.currentDecadalId
        ? '전체 대한과 올해가 속한 구간을 구분해 읽습니다. 나이는 만 나이가 아닙니다.'
        : '올해는 제공된 대한 구간 밖입니다. 현재 대한을 임의로 만들지 않습니다.',
      11: `${chart.timing.yearly.year}년 유년과 전체 유월을 제공합니다. 월·일은 iztro 음력입니다.`,
      12: '계산 자료에 대한 AI의 해석입니다. 자신의 경험과 비교해 참고해주세요.',
    } as Record<number, string>,
    references,
  };
}
export type ChartFactsData = ReturnType<typeof createChartFacts>;
