import {
  consultationStages,
  type AiExplanationResult,
  type AiParagraph,
} from '../../domain/interpretation/ai-explanation';
import type { ChartFactsData } from '../../domain/interpretation/chart-facts.server';
import type { Chart } from '../../domain/ziwei/chart';
import { EvidenceReference } from './evidence-reference';
import { Term } from '../../components/ui/term';
import { extendedTerms } from '../../content/glossary';
import * as styles from './styles.css';

function ReadingText({
  reading,
}: {
  reading: Pick<AiParagraph, 'terms' | 'interpretation' | 'check'>;
}) {
  return (
    <>
      <p>
        <strong>용어의 뜻</strong> · {reading.terms}
      </p>
      <p>{reading.interpretation}</p>
      <p className={styles.question}>
        <strong>생활에서 점검하기</strong>
        <br />
        {reading.check}
      </p>
    </>
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
      <p className={styles.eyebrow}>계산 자료를 바탕으로 이어지는 해석</p>
      <h2 id="ai-explanation-title">나의 명반을 깊이 읽어보기</h2>
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
        result.sections.map((section) => (
          <details key={section.step} className={styles.entry}>
            <summary className={styles.sectionSummary}>
              {section.step}. {consultationStages[section.step - 1]}
            </summary>
            <p className={styles.scope}>{facts.sectionScopes[section.step]}</p>
            {section.paragraphs.map((p, index) => (
              <article key={index} className={styles.entry}>
                <details className={styles.evidence}>
                  <summary className={styles.evidenceSummary}>
                    명반 근거 ({p.evidenceIds.length})
                  </summary>
                  <ul>
                    {p.evidenceIds.map((id) => (
                      <li key={id}>
                        <EvidenceReference
                          id={id}
                          chart={chart}
                          facts={facts}
                        />
                      </li>
                    ))}
                  </ul>
                </details>
                <ReadingText reading={p} />
              </article>
            ))}
            {section.step === 11 && (
              <>
                <h3>
                  올해 전체 <Term term={extendedTerms.유월} /> 해석
                </h3>
                {result.monthly.map((reading) => {
                  const period = chart.timing.monthly.find(
                    (m) => m.id === reading.periodId,
                  )!;
                  return (
                    <details key={reading.periodId} className={styles.entry}>
                      <summary className={styles.sectionSummary}>
                        {facts.references[reading.periodId]}
                      </summary>
                      <p className={styles.evidence}>
                        계산 근거 · 유월 명궁:{' '}
                        {facts.references[period.soulPalaceId]}
                      </p>
                      <p className={styles.evidence}>
                        {period.transformations
                          .map(
                            (t) =>
                              `화${t.type}: ${t.starName}(${facts.references[t.palaceId]})`,
                          )
                          .join(' · ')}
                      </p>
                      <ReadingText reading={reading} />
                    </details>
                  );
                })}
              </>
            )}
          </details>
        ))
      ) : null}
    </section>
  );
}
