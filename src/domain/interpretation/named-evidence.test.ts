import { it, expect } from 'vitest';
import { calculateChart } from '../ziwei/calculate-chart.server';
import fixture from '../ziwei/fixtures/cust-1929.json';
import { consultationEvidence } from './consultation-evidence';
import { validateNamedStars } from './named-evidence';
const result = calculateChart(fixture.input);
if (!result.success) throw new Error('fixture');
const e = consultationEvidence(result.data.chart);
it('실제 응답의 미인용 타라와 다른 문단의 파군을 검출한다', () => {
  expect(() =>
    validateNamedStars(
      '천부와 지공, 타라 성향이 겹쳐 보여서',
      ['palace:미', 'star:자:minor:지공'],
      e,
    ),
  ).toThrow();
  expect(() =>
    validateNamedStars(
      '천기·태음의 조정 능력과 파군의 수정 성향이 함께 있어',
      ['palace:신', 'flying:신:1'],
      e,
    ),
  ).toThrow();
});
it('근거를 함께 인용하면 허용하고 이름을 생략한 쉬운 문장은 거부하지 않는다', () => {
  expect(() =>
    validateNamedStars(
      '천부와 지공, 타라의 기본 의미',
      ['palace:미', 'star:자:minor:지공', 'star:사:minor:타라'],
      e,
    ),
  ).not.toThrow();
  expect(() =>
    validateNamedStars(
      '생각이 많아 결정을 오래 살필 수 있습니다.',
      ['palace:미'],
      e,
    ),
  ).not.toThrow();
});
