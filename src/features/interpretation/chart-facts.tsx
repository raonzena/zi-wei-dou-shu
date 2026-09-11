import type { Chart } from '../../domain/ziwei/chart';
import type { ChartFactsData } from '../../domain/interpretation/chart-facts.server';
import { consultationEvidence } from '../../domain/interpretation/consultation-evidence';
import { Term } from '../../components/ui/term';
import { terms, palaceTerms, starTerms } from '../../content/glossary';
import { SupplementalEvidence } from './supplemental-evidence';
import * as styles from './styles.css';

export function ChartFacts({
  chart,
  facts,
}: {
  chart: Chart;
  facts: ChartFactsData;
}) {
  const evidence = consultationEvidence(chart);
  return (
    <section className={styles.reading} aria-label="명반 판독 요약">
      <p className={styles.eyebrow}>계산 결과</p>
      <details>
        <summary className={styles.sectionSummary}>명반 판독 요약</summary>
        <dl className={styles.summaryList}>
          {facts.summary.map((item) => (
            <div key={item.label}>
              <dt>
                <Term
                  term={
                    item.label === '명궁' ? palaceTerms.명궁 : terms[item.label]
                  }
                />
              </dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
        <details>
          <summary className={styles.sectionSummary}>
            제공하는 자료와 범위
          </summary>
          <h3>제공하는 자료</h3>
          <ul>
            {facts.supported.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <h3>계산·검증하지 않은 범위</h3>
          <ul>
            {facts.unsupported.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </details>
        <div
          className={styles.tableScroll}
          tabIndex={0}
          role="region"
          aria-label="12궁 계산 자료 표, 가로 스크롤 가능"
        >
          <table className={styles.evidenceTable}>
            <caption>12궁과 별의 배치 · 밝기 · 생년사화</caption>
            <thead>
              <tr>
                <th scope="col">궁</th>
                <th scope="col">간지</th>
                <th scope="col">표시 범위의 별</th>
              </tr>
            </thead>
            <tbody>
              {evidence.palaces.map((p) => (
                <tr key={p.id}>
                  <th scope="row">
                    <Term term={palaceTerms[p.name]} />
                    {p.isBodyPalace ? ' · 신궁' : ''}
                  </th>
                  <td>
                    {p.heavenlyStem}
                    {p.earthlyBranch}
                  </td>
                  <td>
                    {p.stars.length
                      ? p.stars.map((s) => (
                          <span key={s.id}>
                            <Term term={starTerms[`${s.category}:${s.name}`]}>
                              {s.name}
                            </Term>
                            {s.brightness
                              ? ` [${evidence.brightnessScale[s.brightness as keyof typeof evidence.brightnessScale]}]`
                              : ''}
                            {s.natalTransformation
                              ? ` (화${s.natalTransformation})`
                              : ''}{' '}
                            ·{' '}
                          </span>
                        ))
                      : '표시 범위의 별 없음'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SupplementalEvidence chart={chart} facts={facts} />
      </details>
    </section>
  );
}
