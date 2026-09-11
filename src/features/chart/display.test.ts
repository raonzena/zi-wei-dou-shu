import { describe, expect, it } from 'vitest';
import { createStore } from 'jotai';
import { calculateChart } from '../../domain/ziwei/calculate-chart.server';
import fixture from '../../domain/ziwei/fixtures/cust-1929.json';
import { palaceTerms, starTerms } from '../../content/glossary';
import { displayedStars, positions, starKey } from './display';
import { selectedPalaceAtom } from './selection';

function referenceChart(year = 1929) {
  const result = calculateChart({ ...fixture.input, year });
  if (!result.success) throw new Error(result.error.code);
  return result.data.chart;
}

describe('명반 표시 데이터', () => {
  it('독립 대조 명반의 14주성과 보조성 18개를 빠짐없이 표시한다', () => {
    const chart = referenceChart();
    const stars = chart.palaces.flatMap(displayedStars);
    expect(stars).toHaveLength(32);
    expect(stars.filter((star) => star.isMajor)).toHaveLength(14);
    for (const palace of chart.palaces) {
      expect(palaceTerms[palace.name]).toBeDefined();
      for (const name of fixture.palaces.find(
        (p) => p.earthlyBranch === palace.earthlyBranch,
      )!.majorStars)
        expect(
          displayedStars(palace).some(
            (star) => star.name === name && star.isMajor,
          ),
        ).toBe(true);
    }
  });
  it('이름이 같은 천월과 천상을 분류까지 비교하여 잘못 표시하지 않는다', () => {
    const all = referenceChart().palaces.flatMap((p) => p.stars);
    expect(all.filter((star) => star.name === '천월')).toHaveLength(2);
    expect(all.filter((star) => star.name === '천상')).toHaveLength(2);
    expect(
      starTerms[
        starKey(all.find((s) => s.name === '천월' && s.category === 'minor')!)
      ].label,
    ).toContain('天鉞');
    expect(
      starTerms[
        starKey(
          all.find((s) => s.name === '천월' && s.category === 'adjective')!,
        )
      ],
    ).toBeUndefined();
    expect(
      starTerms[starKey(all.find((s) => s.name === '천상' && s.isMajor)!)]
        .label,
    ).toContain('天相');
    expect(
      starTerms[starKey(all.find((s) => s.name === '천상' && !s.isMajor)!)],
    ).toBeUndefined();
  });
  it('열 천간 사례에서 표시 범위가 네 종류의 사화를 모두 보존한다', () => {
    for (let year = 1990; year < 2000; year++) {
      const chart = referenceChart(year);
      const before = JSON.stringify(chart);
      expect(
        chart.palaces
          .flatMap(displayedStars)
          .flatMap((s) => (s.transformation ? [s.transformation] : []))
          .sort(),
      ).toEqual(['과', '권', '기', '록']);
      expect(JSON.stringify(chart)).toBe(before);
    }
  });
  it('궁을 고정 지지에 배치하며 중앙 네 칸과 겹치지 않는다', () => {
    const coords = referenceChart().palaces.map(
      (p) => positions[p.earthlyBranch],
    );
    expect(new Set(coords.map(String)).size).toBe(12);
    for (const [row, col] of coords)
      expect(row === 1 || row === 4 || col === 1 || col === 4).toBe(true);
  });
  it('결과별 선택 상태를 격리하고 새 결과는 명궁 선택으로 시작한다', () => {
    const first = createStore();
    first.set(selectedPalaceAtom, 3);
    const second = createStore();
    expect(first.get(selectedPalaceAtom)).toBe(3);
    expect(second.get(selectedPalaceAtom)).toBeNull();
  });
});
