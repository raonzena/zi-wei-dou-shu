import { expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { calculateChart } from '../../domain/ziwei/calculate-chart.server';
import fixture from '../../domain/ziwei/fixtures/cust-1929.json';
import { createBasicReading } from '../../domain/interpretation/basic-reading';
import { findOppositePalace } from '../../domain/interpretation/palace-reading';
import { BasicReading } from './basic-reading';
import { ComprehensiveReading } from './comprehensive-reading';
import { StarContentContext } from '../chart/star-content-context';

vi.mock('../../components/ui/term', () => ({
  Term: ({ children }: { children?: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));
vi.mock('./styles.css', () => ({
  entry: 'entry',
  evidence: 'evidence',
  eyebrow: 'eyebrow',
  reading: 'reading',
  scope: 'scope',
  sources: 'sources',
}));

function chart() {
  const result = calculateChart(fixture.input);
  if (!result.success) throw new Error('Fixture failed');
  return result.data.chart;
}

it('명궁이 무주성이면 간편 기본 풀이에 맞은편 궁과 참고 별을 표시한다', () => {
  const data = chart();
  const soul = data.palaces.find((palace) => palace.name === '명궁')!;
  soul.stars = soul.stars.filter((star) => !star.isMajor);
  const reading = createBasicReading(data);
  const reference = reading.evidence.oppositeReference!;
  const html = renderToStaticMarkup(<BasicReading reading={reading} />);

  expect(html).toContain(`맞은편 ${reference.palaceName}궁`);
  for (const star of reference.stars) expect(html).toContain(star);
  expect(html).toContain(
    `맞은편 ${reference.earthlyBranch} 위치의 ${reference.palaceName}궁 참고`,
  );
  expect(html).not.toContain('명궁의 주성 풀이가 아니라');
});

it('일곱 분야 종합 풀이에서 무주성 궁의 맞은편 참고 근거를 표시한다', () => {
  const data = chart();
  const empty = data.palaces.find(
    (palace) => !palace.stars.some((star) => star.isMajor),
  )!;
  const html = renderToStaticMarkup(
    <StarContentContext value={{ status: 'ready', entries: [] }}>
      <ComprehensiveReading chart={data} />
    </StarContentContext>,
  );

  expect(html).toContain(`${empty.name} · 주성: 없음`);
  expect(html).toContain('참고 주성:');
  expect(html).toContain('그대로 나타난다는 뜻은 아니며');
  expect(html).not.toMatch(/예를 들어|이 영역에서는|살펴봅니다|해보세요/);
});

it('명궁 주성 조합의 요약을 기본 풀이에서만 표시한다', () => {
  const data = chart();
  const basic = createBasicReading(data);
  const summary = basic.combination?.summary;
  if (!summary)
    throw new Error('Fixture needs two major stars in the soul palace');
  const soul = data.palaces.find((palace) => palace.name === '명궁')!;
  const opposite = findOppositePalace(data, soul);
  if (!opposite) throw new Error('Fixture needs an opposite palace');
  opposite.stars = opposite.stars.filter((star) => !star.isMajor);

  const html = renderToStaticMarkup(
    <StarContentContext value={{ status: 'ready', entries: [] }}>
      <BasicReading reading={basic} />
      <ComprehensiveReading chart={data} />
    </StarContentContext>,
  );

  expect(html.split(summary)).toHaveLength(2);
  expect(html).not.toContain('기본 성향은 위의');
});
