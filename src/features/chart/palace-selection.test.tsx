import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Provider } from 'jotai';
import { calculateChart } from '../../domain/ziwei/calculate-chart.server';
import fixture from '../../domain/ziwei/fixtures/cust-1929.json';
import { ChartRing } from './chart-ring';
import { PalaceDetail } from './palace-detail';

vi.mock('../../components/ui/term', () => ({
  Term: ({
    term,
    children,
  }: {
    term: { label: string };
    children?: React.ReactNode;
  }) => <span>{children ?? term.label}</span>,
}));
vi.mock('./styles.css', () => ({
  bodyLabel: 'bodyLabel',
  branch: 'branch',
  center: 'center',
  centerHint: 'centerHint',
  centerTitle: 'centerTitle',
  chart: 'chart',
  detail: 'detail',
  help: 'help',
  mutagen: 'mutagen',
  palace: 'palace',
  palaceSelect: 'palaceSelect',
  palaceTitle: 'palaceTitle',
  starList: 'starList',
  starRow: 'starRow',
  stars: 'stars',
}));
vi.mock('../interpretation/styles.css', () => ({
  readingBasis: 'readingBasis',
  scope: 'scope',
}));

function chart() {
  const result = calculateChart(fixture.input);
  if (!result.success) throw new Error('Fixture failed');
  return result.data.chart;
}

describe('간편 명반의 궁 선택', () => {
  it('열두 궁을 모두 선택 버튼으로 제공하고 쉬운 풀이 영역과 연결한다', () => {
    const html = renderToStaticMarkup(
      <Provider>
        <ChartRing
          chart={chart()}
          detail={false}
          controlsId="simple-palace-reading"
        />
      </Provider>,
    );
    expect(html.match(/aria-controls="simple-palace-reading"/g)).toHaveLength(
      12,
    );
    expect(html).toContain('궁을 선택해\n쉽게 살펴보세요');
  });

  it('간편 풀이에는 쉬운 제목을 표시하고 상세 별 목록은 제외한다', () => {
    const html = renderToStaticMarkup(
      <Provider>
        <PalaceDetail
          chart={chart()}
          id="simple-palace-reading"
          showTechnicalDetails={false}
        />
      </Provider>,
    );
    expect(html).toContain('어떤 생활 영역을 보여주나요?');
    expect(html).toContain('이 영역에서 나는 어떤 모습인가요?');
    expect(html).toContain('생활에서는 어떻게 활용하면 좋을까요?');
    expect(html).not.toContain('간지');
    expect(html).not.toContain('보조성');
  });
});
