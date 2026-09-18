import { existsSync } from 'node:fs';
import { expect, it } from 'vitest';
import { personalityCharacters } from './personality-characters';
import { basicReadingRules } from './basic-reading-rules';
import {
  createBasicReading,
  type BasicReading,
} from '../domain/interpretation/basic-reading';
import { calculateChart } from '../domain/ziwei/calculate-chart.server';
import fixture from '../domain/ziwei/fixtures/cust-1929.json';

function reading() {
  const result = calculateChart(fixture.input);
  if (!result.success) throw new Error('fixture');
  return createBasicReading(result.data.chart);
}

it('14주성 모두 남녀별 실제 이미지 파일이 있으며 서로 다르다', () => {
  const data = reading();
  data.entries = Object.keys(basicReadingRules).map((starName) => ({
    ...data.entries[0],
    starName,
  }));
  const male = personalityCharacters(data, 'male');
  const female = personalityCharacters(data, 'female');
  expect(male).toHaveLength(14);
  expect(new Set([...male, ...female].map((image) => image.src)).size).toBe(28);
  for (const image of [...male, ...female])
    expect(existsSync(`public${image.src}`), image.src).toBe(true);
});

it('두 주성 모두 풀이 순서대로 선택하고 성별 미상에는 지정하지 않는다', () => {
  const data = reading();
  expect(data.entries).toHaveLength(2);
  expect(
    personalityCharacters(data, 'female').map((image) => image.starName),
  ).toEqual(data.entries.map((entry) => entry.starName));
  expect(personalityCharacters(data)).toEqual([]);
});

it('무주성 명궁은 대궁 참고 entries를 사용하고 참고 별도 없으면 비워 둔다', () => {
  const result = calculateChart({
    ...fixture.input,
    year: 2000,
    month: 1,
    day: 1,
    hour: 2,
  });
  if (!result.success) throw new Error('fixture');
  const data = createBasicReading(result.data.chart);
  expect(data.status).toBe('empty');
  expect(
    personalityCharacters(data, 'male').map((image) => image.starName),
  ).toEqual(data.evidence.oppositeReference?.stars);
  expect(personalityCharacters({ ...data, entries: [] }, 'male')).toEqual([]);
});

it('허용되지 않은 별 이름으로 파일 경로를 만들지 않는다', () => {
  const data: BasicReading = reading();
  data.entries[0].starName = '../../private';
  expect(() => personalityCharacters(data, 'male')).toThrow(
    'Unknown character star',
  );
});
