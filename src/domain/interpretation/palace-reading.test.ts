import { describe, expect, it } from 'vitest';
import { calculateChart } from '../ziwei/calculate-chart.server';
import fixture from '../ziwei/fixtures/cust-1929.json';
import { createPalaceReading } from './palace-reading';

function chart() {
  const result = calculateChart(fixture.input);
  if (!result.success) throw new Error('Fixture failed');
  return result.data.chart;
}

describe('선택한 궁의 기본 풀이', () => {
  it('12궁마다 해당 궁의 실제 주성만 사용하며 같은 명반을 변경하지 않는다', () => {
    const value = chart();
    const before = structuredClone(value);
    const readings = value.palaces.map((palace) => {
      const reading = createPalaceReading(palace);
      const expected = fixture.palaces.find((p) => p.name === palace.name)!;
      expect(reading.entries.map((e) => e.starName).sort()).toEqual(
        [...expected.majorStars].sort(),
      );
      return reading;
    });
    expect(new Set(readings.map((r) => r.focus)).size).toBe(12);
    expect(value).toEqual(before);
  });
  it('같은 별이라도 선택한 궁에 맞는 맥락과 생활 조언을 제공한다', () => {
    const value = chart();
    const career = value.palaces.find((p) => p.name === '관록')!;
    const wealth = value.palaces.find((p) => p.name === '재백')!;
    wealth.stars = structuredClone(career.stars);
    const work = createPalaceReading(career);
    const money = createPalaceReading(wealth);
    expect(work.entries).toEqual(money.entries);
    expect(work.focus).not.toBe(money.focus);
    expect(work.practice).not.toBe(money.practice);
  });
  it('주성이 없으면 보조성이나 대궁의 주성을 대신 해석하지 않는다', () => {
    const palace = chart().palaces[0];
    palace.stars = [
      {
        name: '천상',
        category: 'adjective',
        isMajor: false,
        brightness: null,
        transformation: null,
      },
    ];
    const result = createPalaceReading(palace);
    expect(result.entries).toEqual([]);
    expect(result.introduction).toContain('주성이 없습니다');
    expect(result.introduction).not.toContain('천상');
  });
  it('동궁의 별은 개별 의미로 표시하며 조합 풀이로 소개하지 않는다', () => {
    const value = chart();
    const palace = value.palaces.find(
      (p) => p.stars.filter((s) => s.isMajor).length > 1,
    )!;
    const result = createPalaceReading(palace);
    expect(result.entries.length).toBeGreaterThan(1);
    expect(result.scope).toContain('각각');
    expect(result.scope).toContain('종합한 풀이는 아닙니다');
  });
});
