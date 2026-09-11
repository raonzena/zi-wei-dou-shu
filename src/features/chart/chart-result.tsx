'use client';

import { AiExplanation } from '../interpretation/ai-explanation';
import type { AiExplanationResult } from '../../domain/interpretation/ai-explanation';
import type { BasicReading as Reading } from '../../domain/interpretation/basic-reading';
import { BasicReading } from '../interpretation/basic-reading';
import { Brand } from '../../components/ui/brand';
import { Provider } from 'jotai';
import { Tabs } from '@base-ui/react/tabs';
import { useSearchParams } from 'next/navigation';
import type { Chart } from '../../domain/ziwei/chart';
import { Term } from '../../components/ui/term';
import { terms } from '../../content/glossary';
import { ChartRing } from './chart-ring';
import { PalaceDetail } from './palace-detail';
import * as styles from './styles.css';

export function ChartResult({
  chart,
  reading,
  ai,
  aiPending,
  onRetryAi,
  onBack,
}: {
  chart: Chart;
  reading: Reading;
  ai: AiExplanationResult;
  aiPending: boolean;
  onRetryAi: () => void;
  onBack: () => void;
}) {
  const params = useSearchParams();
  const view = params.get('view') === 'detail' ? 'detail' : 'simple';
  return (
    <Provider>
      <section className={styles.result} aria-labelledby="preview-title">
        <Brand />
        <h1 id="preview-title" tabIndex={-1} className={styles.title}>
          나의 명반
        </h1>
        <p>
          입력한 출생 정보로 계산한 <Term term={terms.명반} />
          입니다. 궁과 별을 하나씩 살펴보세요.
        </p>
        <p className={styles.help}>
          점선이 있는 용어를 누르거나 마우스를 올리면 설명을 볼 수 있습니다.
          키보드로도 확인할 수 있습니다.
        </p>
        <Tabs.Root
          value={view}
          onValueChange={(value) => {
            const url = new URL(window.location.href);
            if (value === 'detail') url.searchParams.set('view', 'detail');
            else url.searchParams.delete('view');
            window.history.pushState(
              null,
              '',
              url.pathname + url.search + url.hash,
            );
          }}
        >
          <Tabs.List
            className={styles.tabs}
            aria-label="명반 보기 방식"
            activateOnFocus
          >
            <Tabs.Tab className={styles.tab} value="simple">
              간편 명반
            </Tabs.Tab>
            <Tabs.Tab className={styles.tab} value="detail">
              상세 명반
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="simple">
            <ChartRing chart={chart} detail={false} />
            <BasicReading reading={reading} />
            <AiExplanation
              result={ai}
              chart={chart}
              pending={aiPending}
              onRetry={onRetryAi}
            />
            <section className={styles.reading} aria-labelledby="reading-title">
              <h2 id="reading-title">명반을 읽는 방법</h2>
              <p>
                열두 칸은 삶의 영역을 나눈 <Term term={terms.궁} />
                입니다. 각 궁의 <Term term={terms.주성} />
                부터 확인해보세요. 자세한 별의 배치는 상세 명반에서 볼 수
                있습니다.
              </p>
              <p>
                ‘주성 없음’은 그 궁에 14주성이 없다는 뜻입니다. 다른 별도 없거나
                좋지 않은 결과라는 의미는 아닙니다.
              </p>
              <p className={styles.help}>
                위의 기본 풀이와 함께 참고할 명반의 공통적인 읽는 법입니다.
              </p>
            </section>
          </Tabs.Panel>
          <Tabs.Panel value="detail">
            <p className={styles.help}>
              궁을 선택하면 아래에서 별의 한자 이름과 사화를 확인할 수 있습니다.
            </p>
            <ChartRing chart={chart} detail />
            <PalaceDetail chart={chart} />
            <p className={styles.help}>
              현재는 14주성과 일부 보조성을 표시합니다. 별의 밝기와 나머지 별은
              추가 검증 후 제공할 예정입니다.
            </p>
          </Tabs.Panel>
        </Tabs.Root>
        <p className={styles.help}>
          결과는 저장되지 않습니다. 새로고침하면 입력 화면으로 돌아갑니다. 공유
          기능은 아직 제공하지 않습니다.
        </p>
        <button
          type="button"
          className={styles.back}
          onClick={onBack}
          disabled={aiPending}
        >
          출생 정보 수정
        </button>
      </section>
    </Provider>
  );
}
