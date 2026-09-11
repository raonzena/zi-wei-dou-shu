import { describe, expect, it } from 'vitest';
import { Temporal } from '@js-temporal/polyfill';
import { calculateChart } from './calculate-chart.server';
import fixture from './fixtures/cust-1929.json';
import { consultationEvidence } from '../interpretation/consultation-evidence';

const now = Temporal.Instant.from('2026-09-11T03:00Z');
function chart(input: unknown = fixture.input, instant = now) {
  const result = calculateChart(input, instant);
  if (!result.success) throw new Error(result.error.code);
  return result.data.chart;
}
describe('보충 본명반·대한·유년', () => {
  it('사 명궁의 명주는 무곡, 사년의 신주는 천기로 명궁·신궁과 구분한다', () => {
    expect(chart()).toMatchObject({
      soulStar: '무곡',
      bodyStar: '천기',
      soulPalaceBranch: '사',
      bodyPalaceBranch: '묘',
    });
  });
  it('음남 역행과 목삼국의 3세 시작 규칙을 적용한다', () => {
    const { timing } = chart();
    expect(timing.direction).toBe('역행');
    expect(timing.startAge).toBe(3);
    expect(
      timing.decadals
        .slice(0, 3)
        .map((d) => [d.soulPalaceId, d.ageRange, d.yearRange]),
    ).toEqual([
      ['palace:사', [3, 12], [1931, 1940]],
      ['palace:진', [13, 22], [1941, 1950]],
      ['palace:묘', [23, 32], [1951, 1960]],
    ]);
    expect(timing.decadals[11].ageRange).toEqual([113, 122]);
    expect(timing.decadals[0].transformations).toEqual([
      { type: '록', starName: '무곡', palaceId: 'palace:사' },
      { type: '권', starName: '탐랑', palaceId: 'palace:유' },
      { type: '과', starName: '천량', palaceId: 'palace:자' },
      { type: '기', starName: '문곡', palaceId: 'palace:묘' },
    ]);
  });
  it.each([
    [1929, 'female', '순행'],
    [2000, 'male', '순행'],
    [2000, 'female', '역행'],
  ] as const)('%s %s의 대한 방향은 %s이다', (year, gender, direction) => {
    const c = chart({ ...fixture.input, year, gender });
    expect(c.timing.direction).toBe(direction);
    expect(c.timing.decadals[0].soulPalaceId).toBe(
      `palace:${c.soulPalaceBranch}`,
    );
  });
  it('2026 병오 유년의 명궁과 병간 사화를 본명반 별에 연결한다', () => {
    const y = chart().timing.yearly;
    expect(y).toMatchObject({
      year: 2026,
      heavenlyStem: '병',
      earthlyBranch: '오',
      soulPalaceId: 'palace:오',
      currentDecadalId: 'decadal:93',
    });
    expect(y.transformations).toEqual([
      { type: '록', starName: '천동', palaceId: 'palace:진' },
      { type: '권', starName: '천기', palaceId: 'palace:신' },
      { type: '과', starName: '문창', palaceId: 'palace:해' },
      { type: '기', starName: '염정', palaceId: 'palace:축' },
    ]);
  });
  it('올해는 한국 시간의 연도로 선택하며 정월 전에도 선택 연도의 유년을 반환한다', () => {
    const before = chart(
      fixture.input,
      Temporal.Instant.from('2026-12-31T14:59:59Z'),
    );
    const after = chart(
      fixture.input,
      Temporal.Instant.from('2026-12-31T15:00:00Z'),
    );
    expect(before.timing.yearly.year).toBe(2026);
    expect(after.timing.yearly).toMatchObject({
      year: 2027,
      heavenlyStem: '정',
      earthlyBranch: '미',
    });
  });
  it.each([1900, 2026])(
    '대한 범위 밖인 %s 출생도 본명반·유년을 유지하며 대한을 꾸며내지 않는다',
    (year) => {
      expect(
        chart({ ...fixture.input, year }).timing.yearly.currentDecadalId,
      ).toBeNull();
    },
  );
  it('기본표 밝기를 공식 밝기표의 등급으로 해석하고 null을 유지한다', () => {
    const e = consultationEvidence(chart());
    expect(
      e.palaces
        .find((p) => p.name === '명궁')!
        .stars.find((s) => s.name === '무곡')!.brightness,
    ).toBe('[-1]');
    expect(e.brightnessScale['[-1]']).toBe('평');
    expect(
      e.palaces
        .find((p) => p.name === '관록')!
        .stars.find((s) => s.name === '자미')!.brightness,
    ).toBe('[+2]');
    expect(
      e.palaces.flatMap((p) => p.stars).some((s) => s.brightness === null),
    ).toBe(true);
    expect(e.metadata).toMatchObject({ soulStar: '무곡', bodyStar: '천기' });
    expect(e).not.toHaveProperty('birth');
    expect(e).not.toHaveProperty('rawDates');
    expect(e.timing.monthly).toHaveLength(12);
  });
});
