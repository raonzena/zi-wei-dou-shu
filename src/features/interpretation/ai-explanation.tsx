import type { AiExplanationResult } from '../../domain/interpretation/ai-explanation';
import type { ChartFactsData } from '../../domain/interpretation/chart-facts.server';
import type { Chart } from '../../domain/ziwei/chart';
import { EvidenceReference } from './evidence-reference';
import * as styles from './styles.css';

function Evidence({
  ids,
  chart,
  facts,
}: {
  ids: string[];
  chart: Chart;
  facts: ChartFactsData;
}) {
  return (
    <details className={styles.evidence}>
      <summary className={styles.evidenceSummary}>
        명반 근거 ({ids.length})
      </summary>
      <ul>
        {ids.map((id) => (
          <li key={id}>
            <EvidenceReference id={id} chart={chart} facts={facts} />
          </li>
        ))}
      </ul>
    </details>
  );
}

export function AiExplanation({
  result,
  chart,
  facts,
  pending,
  onRetry,
}: {
  result: AiExplanationResult;
  chart: Chart;
  facts: ChartFactsData;
  pending: boolean;
  onRetry: () => void;
}) {
  if (result.status === 'not-requested') return null;
  return (
    <section
      className={styles.reading}
      aria-labelledby="ai-explanation-title"
      aria-busy={pending}
    >
      <p className={styles.eyebrow}>명반에서 읽는 나의 성향과 생활 패턴</p>
      <h2 id="ai-explanation-title">나의 명반 해석</h2>
      {pending ? (
        <p role="status">
          해석을 다시 준비하고 있습니다. 계산 자료와 기본 풀이는 계속 볼 수
          있습니다.
        </p>
      ) : result.status === 'error' ? (
        <div role="status">
          <p>{result.message}</p>
          {result.retryable && (
            <button type="button" className={styles.retry} onClick={onRetry}>
              설명 다시 시도
            </button>
          )}
        </div>
      ) : result.status === 'ready' ? (
        <>
          <div className={styles.overview}>
            {result.overview.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            <Evidence
              ids={result.overview.evidenceIds}
              chart={chart}
              facts={facts}
            />
          </div>

          {result.sections.map((section) => (
            <article key={section.id} className={styles.readingSection}>
              <h3>{section.title}</h3>
              {section.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
              {section.bulletPoints.length > 0 && (
                <ul>
                  {section.bulletPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              )}
              <Evidence ids={section.evidenceIds} chart={chart} facts={facts} />
            </article>
          ))}

          <p className={styles.closing}>{result.closing.text}</p>
          <Evidence
            ids={result.closing.evidenceIds}
            chart={chart}
            facts={facts}
          />
        </>
      ) : null}
    </section>
  );
}
