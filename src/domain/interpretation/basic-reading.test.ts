import { describe, expect, it } from 'vitest';
import { calculateChart } from '../ziwei/calculate-chart.server';
import fixture from '../ziwei/fixtures/cust-1929.json';
import { createBasicReading } from './basic-reading';
import { basicReadingRules } from '../../content/basic-reading-rules';
import { starTerms } from '../../content/glossary';

function referenceChart() {
  const result = calculateChart(fixture.input);
  if (!result.success) throw new Error(result.error.code);
  return result.data.chart;
}

describe('명궁 기본 풀이', () => {
  it('독립 기준 명반의 명궁과 주성을 근거로 사용하고 다른 궁의 별은 섞지 않는다', () => {
    const chart = referenceChart();
    const reading = createBasicReading(chart);
    const expected = fixture.palaces.find((p) => p.name === '명궁')!;
    expect(reading.evidence.earthlyBranch).toBe(expected.earthlyBranch);
    expect([...reading.evidence.stars].sort()).toEqual(
      [...expected.majorStars].sort(),
    );
    expect(reading.entries.map((e) => e.starName).sort()).toEqual(
      [...expected.majorStars].sort(),
    );
  });
  it('같은 이름의 보조성을 주성으로 해석하지 않는다', () => {
    const chart = referenceChart();
    const soul = chart.palaces.find((p) => p.name === '명궁')!;
    soul.stars = [
      {
        name: '천상',
        category: 'adjective',
        isMajor: false,
        brightness: null,
        transformation: null,
      },
    ];
    expect(createBasicReading(chart).status).toBe('empty');
    expect(createBasicReading(chart).entries).toEqual([]);
  });
  it('주성 없음과 동궁을 단일 주성 풀이와 구분하고 대궁의 별을 임의로 빌리지 않는다', () => {
    const chart = referenceChart();
    const soul = chart.palaces.find((p) => p.name === '명궁')!;
    const major = chart.palaces
      .flatMap((p) => p.stars)
      .filter((s) => s.isMajor);
    soul.stars = [];
    expect(createBasicReading(chart)).toMatchObject({
      status: 'empty',
      entries: [],
      evidence: { stars: [] },
    });
    soul.stars = [major[0]];
    expect(createBasicReading(chart).status).toBe('single');
    soul.stars = major.slice(0, 2);
    expect(createBasicReading(chart).status).toBe('multiple');
    expect(createBasicReading(chart).entries).toHaveLength(2);
  });
  it('궁·별 배열 순서에 영향받지 않고 원본이나 반환값의 참조를 공유하지 않는다', () => {
    const chart = referenceChart();
    const before = JSON.stringify(chart);
    const first = createBasicReading(chart);
    const shuffled = structuredClone(chart);
    shuffled.palaces.reverse().forEach((p) => p.stars.reverse());
    expect(createBasicReading(shuffled)).toEqual(first);
    first.entries[0].meaning = 'changed';
    first.evidence.stars.push('changed');
    expect(createBasicReading(chart)).not.toEqual(first);
    expect(JSON.stringify(chart)).toBe(before);
  });
  it('14주성 모두 고유한 규칙과 같은 분류의 용어 설명을 갖는다', () => {
    const chart = referenceChart();
    const stars = chart.palaces
      .flatMap((p) => p.stars)
      .filter((s) => s.isMajor);
    const soul = chart.palaces.find((p) => p.name === '명궁')!;
    const ids = new Set<string>();
    for (const star of stars) {
      soul.stars = [star];
      const reading = createBasicReading(chart);
      expect(reading.status).toBe('single');
      expect(starTerms[`major:${star.name}`]).toBeDefined();
      expect(reading.entries[0].meaning.length).toBeGreaterThan(0);
      expect(reading.entries[0].question.endsWith('?')).toBe(true);
      ids.add(reading.entries[0].ruleId);
    }
    expect(ids.size).toBe(14);
    expect(Object.keys(basicReadingRules)).toHaveLength(14);
  });
  it('새로운 미지원 주성이 들어오면 일부 풀이만 조용히 반환하지 않는다', () => {
    const chart = referenceChart();
    const soul = chart.palaces.find((p) => p.name === '명궁')!;
    soul.stars = [
      {
        name: '미지원 별',
        category: 'major',
        isMajor: true,
        brightness: null,
        transformation: null,
      },
    ];
    expect(() => createBasicReading(chart)).toThrow('Unsupported major star');
  });
});
