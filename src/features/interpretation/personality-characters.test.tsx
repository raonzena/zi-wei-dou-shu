import { expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PersonalityCharacters } from './personality-characters';
import { createBasicReading } from '../../domain/interpretation/basic-reading';
import { calculateChart } from '../../domain/ziwei/calculate-chart.server';
import fixture from '../../domain/ziwei/fixtures/cust-1929.json';

vi.mock('./personality-characters.css', () => ({
  container: 'container',
  portraits: 'portraits',
  portrait: 'portrait',
  image: 'image',
  caption: 'caption',
  context: 'context',
}));

it('궁 이름과 두 별 이름을 이미지 밖에 표시하고 여성 캐릭터만 불러온다', () => {
  const calculated = calculateChart(fixture.input);
  if (!calculated.success) throw new Error('fixture');
  const reading = createBasicReading(calculated.data.chart);
  const html = renderToStaticMarkup(
    <PersonalityCharacters reading={reading} gender="female" />,
  );
  expect(html.match(/<figure /g)).toHaveLength(2);
  expect(html).toContain('명궁의 주성으로 표현한 나의 성향');
  for (const entry of reading.entries)
    expect(html).toContain(`>${entry.starName}</figcaption>`);
  expect(html).toContain('-female.jpg');
  expect(html).not.toContain('-male.jpg');
});
