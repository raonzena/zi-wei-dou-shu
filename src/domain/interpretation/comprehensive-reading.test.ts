import { expect, it } from 'vitest';
import { calculateChart } from '../ziwei/calculate-chart.server';
import fixture from '../ziwei/fixtures/cust-1929.json';
import { createComprehensiveReading } from './comprehensive-reading';
import { createStarCombinationReading } from './palace-reading';
function chart() {
  const result = calculateChart(fixture.input);
  if (!result.success) throw new Error('fixture');
  return result.data.chart;
}
it('일곱 분야가 열두 궁을 빠짐없이 구분하고 실제 배치만 연결한다', () => {
  const data = chart();
  const reading = createComprehensiveReading(data, []);
  expect(reading).toHaveLength(7);
  expect(reading.map((section) => section.title)).toEqual([
    '핵심 성향',
    '내면과 삶의 방향',
    '일과 커리어',
    '재물운',
    '연애 및 결혼운',
    '건강과 컨디션',
    '가족과 대인관계',
  ]);
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

it('별의 성향을 각 궁의 생활 주제에 맞는 4문장으로 풀어낸다', () => {
  const readings = createComprehensiveReading(chart(), []);
  const health = readings.find((section) => section.id === 'health')!
    .readings[0];
  const career = readings.find((section) => section.id === 'career')!
    .readings[0];

  expect(health.sentences).toHaveLength(4);
  expect(health.sentences.join(' ')).toMatch(/피로|수면|휴식|컨디션/);
  expect(health.sentences.join(' ')).not.toMatch(/업무|마감/);
  expect(career.sentences).toHaveLength(4);
  expect(career.sentences.join(' ')).toMatch(/업무|마감|일의/);
  expect(
    health.stars.every(
      (star) =>
        !('meaning' in star) &&
        !('strength' in star) &&
        !('caution' in star) &&
        !('example' in star),
    ),
  ).toBe(true);
  expect(
    readings
      .flatMap((section) => section.readings)
      .every(
        (reading) =>
          !reading.combination ||
          (!('summary' in reading.combination) &&
            !('strength' in reading.combination) &&
            !('caution' in reading.combination) &&
            !('example' in reading.combination)),
      ),
  ).toBe(true);
});

function withMajorStars(palaceName: string, names: string[]) {
  const data = chart();
  const palace = data.palaces.find((p) => p.name === palaceName)!;
  const star = data.palaces.flatMap((p) => p.stars).find((s) => s.isMajor)!;
  palace.stars = [
    ...palace.stars.filter((s) => !s.isMajor),
    ...names.map((name) => ({ ...star, name, transformation: null })),
  ];
  return data;
}

it('같은 재백궁이라도 주성 조합에 따라 강점·주의점·조언이 달라진다', () => {
  const getMoney = (names: string[]) =>
    createComprehensiveReading(withMajorStars('재백', names), []).find(
      (section) => section.id === 'money',
    )!.readings[0];
  const action = getMoney(['무곡', '칠살']);
  const careful = getMoney(['천기', '태음']);
  for (const index of [1, 2, 3]) {
    expect(action.sentences[index]).not.toBe(careful.sentences[index]);
  }
  const combination = createStarCombinationReading(['무곡', '칠살'])!;
  expect(action.sentences.slice(1)).toEqual([
    combination.strength,
    combination.caution,
    combination.balance,
  ]);
  expect(action.sentences.join(' ')).not.toContain('짧은 시간에 변화를');
  expect(action.sentences.join(' ')).not.toContain('바로 결제하기보다');
});

it('무주성은 맞은편의 조합을 사용하고 참고 출처를 유지한다', () => {
  const data = withMajorStars('명궁', []);
  const soul = data.palaces.find((p) => p.name === '명궁')!;
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
  const oppositeBranch =
    branches[(branches.indexOf(soul.earthlyBranch) + 6) % 12];
  const opposite = data.palaces.find(
    (p) => p.earthlyBranch === oppositeBranch,
  )!;
  const star = data.palaces.flatMap((p) => p.stars).find((s) => s.isMajor)!;
  opposite.stars = ['천동', '천량'].map((name) => ({ ...star, name }));
  const reading = createComprehensiveReading(data, [])[0].readings[0];
  expect(reading.empty).toBe(true);
  expect(reading.oppositeReference?.name).toBe(opposite.name);
  expect(reading.sentences[0]).toContain(
    createStarCombinationReading(['천동', '천량'])!.summary,
  );
});
