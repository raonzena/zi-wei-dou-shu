import type { ChartFactsData } from '../../domain/interpretation/chart-facts.server';
import * as styles from './styles.css';

export function CalculationNotice({ facts }: { facts: ChartFactsData }) {
  return (
    <footer
      className={styles.calculationNotice}
      aria-labelledby="calculation-notice-title"
    >
      <h2 id="calculation-notice-title">계산 기준 안내</h2>
      <p className={styles.evidence}>계산 출처: {facts.source}</p>
      <p>
        명반과 운의 흐름은 iztro의 달력과 계산 규칙을 따릅니다. 결과의 월은 한국
        음력이나 양력의 같은 월과 날짜가 다를 수 있습니다.
      </p>
      <details>
        <summary className={styles.sectionSummary}>자세한 계산 기준</summary>
        <ul>
          {facts.policies.map((policy) => (
            <li key={policy}>{policy}</li>
          ))}
        </ul>
      </details>
    </footer>
  );
}
