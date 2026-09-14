'use client';
import { ShareResult } from '../results/share-result';
import { ResultAd } from '../ads/result-ad';
import { button as resultActionButton } from '../results/result-action.css';
import { ComprehensiveReading } from '../interpretation/comprehensive-reading';

import { CalculationNotice } from '../interpretation/calculation-notice';
import { ChartFacts } from '../interpretation/chart-facts';
import type { ChartFactsData } from '../../domain/interpretation/chart-facts.server';
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
import { ReadingGuide } from './reading-guide';
import { PalaceDetail } from './palace-detail';
import * as styles from './styles.css';

export function ChartResult({
  resultId,
  resultName,
  chart,
  facts,
  reading,
  ai,
  aiPending,
  onRetryAi,
  onBack,
  backLabel,
}: {
  resultId: string;
  resultName?: string;
  chart: Chart;
  facts: ChartFactsData;
  reading: Reading;
  ai: AiExplanationResult;
  aiPending: boolean;
  onRetryAi?: () => void;
  onBack: () => void;
  backLabel: string;
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
              종합 풀이
            </Tabs.Tab>
            <Tabs.Tab className={styles.tab} value="detail">
              상세 명반
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="simple">
            <ChartRing chart={chart} detail={false} />
            <BasicReading reading={reading} />
            <ComprehensiveReading chart={chart} />
            <AiExplanation
              result={ai}
              chart={chart}
              facts={facts}
              pending={aiPending}
              onRetry={onRetryAi}
            />
            <ReadingGuide id="simple-reading-guide" />
          </Tabs.Panel>
          <Tabs.Panel value="detail">
            <p className={styles.help}>
              궁을 선택하면 아래에서 별의 한자 이름과 사화를 확인할 수 있습니다.
            </p>
            <ChartRing chart={chart} detail controlsId="palace-detail" />
            <PalaceDetail chart={chart} id="palace-detail" />
            <ReadingGuide id="detail-reading-guide" />
            <ChartFacts chart={chart} facts={facts} />
            <p className={styles.help}>
              현재는 14주성과 보조성 25개를 표시합니다. 밝기는 계산 자료 표에서
              확인할 수 있으며 나머지 별은 아직 표시하지 않습니다.
            </p>
          </Tabs.Panel>
        </Tabs.Root>
        <ResultAd />
        <p className={styles.help}>
          결과 주소를 보관하면 새로고침하거나 다른 브라우저에서 열어도 같은
          명반과 저장된 풀이를 확인할 수 있습니다.
        </p>
        <div className={styles.resultActions}>
          <ShareResult
            key={resultId}
            id={resultId}
            name={resultName}
            view={view}
          />
          <button
            type="button"
            className={resultActionButton}
            onClick={onBack}
            disabled={aiPending}
          >
            {backLabel}
          </button>
        </div>
        <CalculationNotice facts={facts} />
      </section>
    </Provider>
  );
}
