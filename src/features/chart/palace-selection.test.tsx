import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Provider, createStore } from 'jotai';
import { selectedPalace, selectedPalaceAtom } from './selection';
import { calculateChart } from '../../domain/ziwei/calculate-chart.server';
import fixture from '../../domain/ziwei/fixtures/cust-1929.json';
import { ChartRing } from './chart-ring';
import { StarContentContext } from './star-content-context';
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
  starExplanation: 'starExplanation',
  disclosureSummary: 'disclosureSummary',
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

describe('종합 풀이의 궁 선택', () => {
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

  it('종합 풀이에는 쉬운 제목을 표시하고 상세 별 목록은 제외한다', () => {
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
    expect(html).not.toContain('최근 한 달 안에');
  });

  it('상세 풀이에만 각 항목의 네 문장 설명을 표시한다', () => {
    const html = renderToStaticMarkup(
      <Provider>
        <PalaceDetail chart={chart()} id="palace-detail" />
      </Provider>,
    );
    expect(html).toContain('최근 한 달 안에');
    expect(html).toContain('주성으로 읽는 나의 모습');
    expect(html).toContain('별의 의미 읽기');
    expect(html).toContain('별 설명을 불러오지 못했습니다');
    expect(html).not.toMatch(/<details[^>]*\sopen/);
    expect(html).toContain('강점이 있습니다');
    expect(html).toContain('한 번의 사건으로 결론을 내리기보다');
  });
  it('발행된 설명만 제공하고 미발행 별은 검수 중으로 표시한다', () => {
    const data = chart();
    const main = selectedPalace(data, null);
    const star = main.stars.find((s) => s.isMajor)!;
    const html = renderToStaticMarkup(
      <StarContentContext
        value={{
          status: 'ready',
          entries: [
            {
              star_key: `major:${star.name}`,
              version: 2,
              title: star.name,
              translation: '발행된 한국어 설명입니다.',
              translation_kind: 'adaptation',
              source_url: 'https://iztro.com/learn/major-star',
              source_version: 'test',
              license: 'MIT',
            },
          ],
        }}
      >
        <Provider>
          <PalaceDetail chart={data} id="detail" />
        </Provider>
      </StarContentContext>,
    );
    expect(html).toContain('발행된 한국어 설명입니다.');
    expect(html).toContain('설명 버전 2');
    expect(html).toContain('출처: iztro 별 설명');
    expect(html).toContain('이 별의 설명은 검수 중입니다.');
  });
});

it('궁 이름과 무관하게 왼쪽 상단을 기본 선택하고 수동 선택을 우선한다', () => {
  const data = chart();
  for (const name of ['복덕', '재백']) {
    const changed = {
      ...data,
      palaces: data.palaces.map((p) =>
        p.earthlyBranch === '사' ? { ...p, name } : p,
      ),
    };
    const first = selectedPalace(changed, null);
    expect(first.earthlyBranch).toBe('사');
    expect(first.name).toBe(name);
    const other = changed.palaces.find((p) => p.index !== first.index)!;
    expect(selectedPalace(changed, other.index)).toBe(other);
    const store = createStore();
    store.set(selectedPalaceAtom, other.index);
    const html = renderToStaticMarkup(
      <Provider store={store}>
        <ChartRing chart={changed} detail={false} controlsId="reading" />
        <PalaceDetail
          chart={changed}
          id="reading"
          showTechnicalDetails={false}
        />
      </Provider>,
    );
    expect(html).toContain(
      `aria-pressed="true" aria-controls="reading" aria-label="${other.name.endsWith('궁') ? other.name : `${other.name}궁`} 선택"`,
    );
    expect(html).toContain(`${other.name}</span>`);
  }
});
