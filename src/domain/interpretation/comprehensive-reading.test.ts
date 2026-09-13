import { expect, it } from 'vitest';
import { calculateChart } from '../ziwei/calculate-chart.server';
import fixture from '../ziwei/fixtures/cust-1929.json';
import { createComprehensiveReading } from './comprehensive-reading';
function chart() {
  const result = calculateChart(fixture.input);
  if (!result.success) throw new Error('fixture');
  return result.data.chart;
}
it('일곱 분야가 열두 궁을 빠짐없이 구분하고 실제 배치만 연결한다', () => {
  const data = chart();
  const reading = createComprehensiveReading(data, []);
  expect(reading).toHaveLength(7);
  const palaces = reading.flatMap((s) => s.readings);
  expect(new Set(palaces.map((p) => p.name)).size).toBe(12);
  for (const p of palaces) {
    const original = data.palaces.find((x) => x.name === p.name)!;
    const direct = original.stars.filter((s) => s.isMajor);
    if (direct.length) {
      expect(p.stars.map((x) => x.star.name)).toEqual(
        direct.map((s) => s.name),
      );
      expect(p.oppositeReference).toBeNull();
      expect(p.combination === null).toBe(direct.length === 1);
      expect(p.usesBasicPersonalitySummary).toBe(p.name === '명궁');
    } else {
      expect(p.empty).toBe(true);
      expect(p.oppositeReference).toBeTruthy();
      const opposite = data.palaces.find(
        (candidate) => candidate.name === p.oppositeReference!.name,
      )!;
      expect(p.stars.map((x) => x.star.name)).toEqual(
        opposite.stars.filter((s) => s.isMajor).map((s) => s.name),
      );
      expect(p.combination === null).toBe(p.stars.length === 1);
      expect(p.usesBasicPersonalitySummary).toBe(
        p.oppositeReference?.name === '명궁',
      );
    }
    expect(p.related).toHaveLength(3);
    expect(p.related.some((x) => x.name === p.name)).toBe(false);
  }
  expect(palaces.flatMap((p) => p.transformations)).toHaveLength(4);
});
it('검수된 설명에 있고 해당 궁에 실제 배치된 보조성만 사용한다', () => {
  const data = chart();
  const palace = data.palaces.find((p) => p.stars.some((s) => !s.isMajor))!;
  const star = palace.stars.find((s) => !s.isMajor)!;
  const content = [
    {
      star_key: `${star.category}:${star.name}`,
      version: 1,
      title: star.name,
      translation: '확인한 설명입니다.',
      translation_kind: 'adaptation' as const,
      source_url: 'https://iztro.com/learn/minor-star',
      source_version: 'test',
      license: 'MIT',
    },
  ];
  const all = createComprehensiveReading(data, content).flatMap(
    (s) => s.readings,
  );
  expect(
    all
      .find((p) => p.name === palace.name)!
      .supporting.some((s) => s.star.name === star.name),
  ).toBe(true);
  expect(
    all
      .filter(
        (p) =>
          !data.palaces
            .find((x) => x.name === p.name)!
            .stars.some((s) => s.name === star.name),
      )
      .every((p) => p.supporting.length === 0),
  ).toBe(true);
});
it('빈 궁은 맞은편 주성을 참고 풀이로 구분한다', () => {
  const data = chart();
  const empty = data.palaces.find((p) => !p.stars.some((s) => s.isMajor))!;
  const p = createComprehensiveReading(data, [])
    .flatMap((s) => s.readings)
    .find((p) => p.name === empty.name)!;
  expect(p.empty).toBe(true);
  expect(p.oppositeReference).toBeTruthy();
  const opposite = data.palaces.find(
    (palace) => palace.name === p.oppositeReference!.name,
  )!;
  expect(p.stars.map((item) => item.star.name)).toEqual(
    opposite.stars.filter((star) => star.isMajor).map((star) => star.name),
  );
});
