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
      const reading = createPalaceReading(value, palace);
      const expected = fixture.palaces.find((p) => p.name === palace.name)!;
      const source = expected.majorStars.length
        ? expected
        : fixture.palaces.find(
            (candidate) =>
              [
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
              ].indexOf(candidate.earthlyBranch) ===
              ([
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
              ].indexOf(expected.earthlyBranch) +
                6) %
                12,
          )!;
      expect(reading.entries.map((e) => e.starName).sort()).toEqual(
        [...source.majorStars].sort(),
      );
      expect(
        reading.entries.every((entry) => entry.heading.endsWith('모습')),
      ).toBe(true);
      expect(reading.detailedDescription).toHaveLength(4);
      expect(reading.detailedPractice).toHaveLength(4);
      expect(
        reading.entries.every(
          (entry) =>
            entry.detailedSentences.length === 4 &&
            entry.simpleText ===
              `${entry.detailedSentences[0]} ${entry.detailedSentences[3]}`,
        ),
      ).toBe(true);
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
    const work = createPalaceReading(value, career);
    const money = createPalaceReading(value, wealth);
    expect(work.entries.map((entry) => entry.detailedSentences)).toEqual(
      money.entries.map((entry) => entry.detailedSentences),
    );
    expect(work.focus).not.toBe(money.focus);
    expect(work.practice).not.toBe(money.practice);
  });
  it('주성이 없으면 보조성이 아닌 맞은편 궁의 주성을 참고 근거로 구분한다', () => {
    const value = chart();
    const palace = value.palaces.find((p) => p.name === '자녀')!;
    palace.stars = [
      {
        name: '천상',
        category: 'adjective',
        isMajor: false,
        brightness: null,
        transformation: null,
      },
    ];
    const opposite = value.palaces.find((p) => p.earthlyBranch === '신')!;
    const result = createPalaceReading(value, palace);
    expect(result.entries.map((entry) => entry.starName)).toEqual(
      opposite.stars.filter((star) => star.isMajor).map((star) => star.name),
    );
    expect(
      result.entries.every(
        (entry) =>
          entry.borrowedFromOpposite &&
          entry.sourcePalaceName === opposite.name &&
          entry.detailedSentences.length === 4,
      ),
    ).toBe(true);
    expect(result.introduction).toContain('주성이 없습니다');
    expect(result.introduction).toContain(`맞은편 ${opposite.name}궁`);
    expect(result.introduction).not.toContain('천상');
    expect(result.scope).toContain('그대로 옮긴 결론은 아닙니다');
  });
  it('동궁의 별은 개별 의미로 표시하며 조합 풀이로 소개하지 않는다', () => {
    const value = chart();
    const palace = value.palaces.find(
      (p) => p.stars.filter((s) => s.isMajor).length > 1,
    )!;
    const result = createPalaceReading(value, palace);
    expect(result.entries.length).toBeGreaterThan(1);
    expect(result.scope).toContain('각각');
    expect(result.scope).toContain('종합한 풀이는 아닙니다');
  });
});
