import type {
  AiExplanationResult,
  GroundedPassage,
} from '../../domain/interpretation/ai-explanation';
import type { ChartFactsData } from '../../domain/interpretation/chart-facts.server';
import type { Chart } from '../../domain/ziwei/chart';
import { EvidenceReference } from './evidence-reference';
import * as styles from './styles.css';

function Evidence({
  passages,
  advice = [],
  chart,
  facts,
}: {
  passages: { label: string; passage: GroundedPassage }[];
  advice?: { label: string; paragraphLabel: string; reason: string }[];
  chart: Chart;
  facts: ChartFactsData;
}) {
  return (
    <details className={styles.evidence}>
      <summary className={styles.evidenceSummary}>풀이 근거</summary>
      {passages.map(({ label, passage }) => (
        <div key={label}>
          <strong>{label}</strong>
          <ul>
            {passage.evidence.map(({ id, relevance, interpretation }) => (
              <li key={id}>
                <EvidenceReference id={id} chart={chart} facts={facts} />
                <p className={styles.evidenceReason}>
                  <strong>이 주제와의 관련성</strong> · {relevance}
                </p>
                <p className={styles.evidenceReason}>
                  <strong>어떻게 해석했나요?</strong> · {interpretation}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {advice.map((item) => (
        <div key={item.label}>
          <strong>
            {item.label} · {item.paragraphLabel}에서 이어지는 조언
          </strong>
          <p className={styles.evidenceReason}>{item.reason}</p>
        </div>
      ))}
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
              <p key={index}>{paragraph.text}</p>
            ))}
            <Evidence
              passages={result.overview.paragraphs.map((passage, index) => ({
                label: `문단 ${index + 1}`,
                passage,
              }))}
              chart={chart}
              facts={facts}
            />
          </div>

          {result.sections.map((section) => (
            <article key={section.id} className={styles.readingSection}>
              <h3>{section.title.text}</h3>
              {section.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph.text}</p>
              ))}
              {section.bulletPoints.length > 0 && (
                <ul>
                  {section.bulletPoints.map((point, index) => (
                    <li key={index}>{point.text}</li>
                  ))}
                </ul>
              )}
              <Evidence
                passages={[
                  { label: '제목', passage: section.title },
                  ...section.paragraphs.map((passage, index) => ({
                    label: `문단 ${index + 1}`,
                    passage,
                  })),
                ]}
                advice={section.bulletPoints.map((point, index) => ({
                  label: `조언 ${index + 1}`,
                  paragraphLabel: `문단 ${section.paragraphs.findIndex((p) => p.id === point.paragraphId) + 1}`,
                  reason: point.reason,
                }))}
                chart={chart}
                facts={facts}
              />
            </article>
          ))}

          <p className={styles.closing}>{result.closing.text}</p>
          <Evidence
            passages={[{ label: '마무리', passage: result.closing }]}
            chart={chart}
            facts={facts}
          />
        </>
      ) : null}
    </section>
  );
}
