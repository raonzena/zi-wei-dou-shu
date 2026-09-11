import { describe, it, expect } from 'vitest';
import { Temporal } from '@js-temporal/polyfill';
import { calculateChart } from './calculate-chart.server';
import fixture from './fixtures/cust-1929.json';
import { inspectPatterns } from '../interpretation/patterns';
import {
  consultationEvidence,
  evidenceIds,
} from '../interpretation/consultation-evidence';

function chart(year = 2026, hour = 22) {
  const r = calculateChart(
    { ...fixture.input, hour },
    Temporal.Instant.from(`${year}-09-11T03:00Z`),
  );
  if (!r.success) throw new Error(r.error.code);
  return r.data.chart;
}
describe('확장 근거의 경계와 연결', () => {
  it('2025 윤6월을 빠짐없이 겹침 없이 나누며 후반은 다음 유월로 이동한다', () => {
    const months = chart(2025).timing.monthly;
    expect(months).toHaveLength(14);
    expect(months.filter((m) => !m.isLeapMonth).map((m) => m.month)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
    const leap = months.filter((m) => m.isLeapMonth);
    expect(
      leap.map((m) => [
        m.month,
        m.part,
        m.dayRange,
        m.heavenlyStem,
        m.earthlyBranch,
      ]),
    ).toEqual([
      [6, 'first', [1, 15], '계', '미'],
      [6, 'second', [16, 29], '갑', '신'],
    ]);
    expect(leap[0].soulPalaceId).not.toBe(leap[1].soulPalaceId);
    expect(new Set(months.map((m) => m.id)).size).toBe(14);
  });
  it('23시 출생에도 엔진의 월 목록 정책으로 윤달 두 구간을 유지한다', () => {
    expect(
      chart(2025, 23)
        .timing.monthly.filter((m) => m.isLeapMonth)
        .map((m) => m.dayRange),
    ).toEqual([
      [1, 15],
      [16, 29],
    ]);
  });
  it('기궁간의 무곡 화록은 사궁 자화이고 탐랑 화권은 유궁으로 연결된다', () => {
    const c = chart();
    const flows = c.flyingTransformations.filter(
      (f) => f.sourcePalaceId === 'palace:사',
    );
    expect(flows).toHaveLength(4);
    expect(flows[0]).toMatchObject({
      heavenlyStem: '기',
      type: '록',
      starName: '무곡',
      targetPalaceId: 'palace:사',
      self: true,
    });
    expect(flows[1]).toMatchObject({
      type: '권',
      starName: '탐랑',
      targetPalaceId: 'palace:유',
      self: false,
    });
    for (const f of c.flyingTransformations) {
      expect(f.self).toBe(f.sourcePalaceId === f.targetPalaceId);
      expect(
        c.palaces
          .find((p) => `palace:${p.earthlyBranch}` === f.targetPalaceId)!
          .stars.some((s) => s.name === f.starName),
      ).toBe(true);
    }
  });
  it('유요는 운한별 위치를 보존하고 모든 새 근거 ID가 허용 목록에 들어간다', () => {
    const e = consultationEvidence(chart());
    const ids = evidenceIds(e);
    expect(e.timing.yearly.movingStars).toHaveLength(11);
    for (const layer of [...e.timing.monthly, ...e.timing.decadals])
      expect(layer.movingStars).toHaveLength(10);
    for (const item of [
      ...e.timing.monthly,
      ...e.flyingTransformations,
      ...e.patterns,
    ])
      expect(ids.has(item.id)).toBe(true);
    expect(JSON.stringify(e)).not.toMatch(
      /rawDates|solarDate|gender|"hour"|"minute"/,
    );
  });
});

describe('명궁 격국의 명시적 배치 조건', () => {
  it('같은 두 별이어도 인·신 명궁 밖이면 자부동궁으로 판정하지 않는다', () => {
    const c = chart();
    const soul = c.palaces.find((p) => p.name === '명궁')!;
    const stars = c.palaces.flatMap((p) => p.stars);
    soul.stars = ['자미', '천부'].map((name) =>
      stars.find((s) => s.name === name && s.isMajor)!,
    );
    expect(inspectPatterns(c)[0].matched).toBe(false);
    soul.earthlyBranch = '인';
    expect(inspectPatterns(c)[0].matched).toBe(true);
    soul.stars = soul.stars.slice(0, 1);
    expect(inspectPatterns(c)[0].matched).toBe(false);
  });
  it('자부협명은 천기·태음 명궁과 양옆에 나뉜 자미·천부를 모두 요구한다', () => {
    const c = chart();
    const soul = c.palaces.find((p) => p.name === '명궁')!;
    const stars = c.palaces.flatMap((p) => p.stars);
    const get = (name: string) =>
      stars.find((s) => s.name === name && s.isMajor)!;
    soul.earthlyBranch = '신';
    soul.stars = [get('천기'), get('태음')];
    const sides = c.palaces.filter((p) =>
      [1, 11].includes((p.index - soul.index + 12) % 12),
    );
    sides[0].stars = [get('자미')];
    sides[1].stars = [get('천부')];
    expect(inspectPatterns(c)[1].matched).toBe(true);
    sides[0].stars.push(get('천부'));
    sides[1].stars = [];
    expect(inspectPatterns(c)[1].matched).toBe(false);
  });
});
