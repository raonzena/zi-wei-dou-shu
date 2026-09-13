import {
  createOverallPersonalitySummary,
  type BasicReading as Reading,
} from '../../domain/interpretation/basic-reading';
import { Term } from '../../components/ui/term';
import { palaceTerms } from '../../content/glossary';
import * as styles from './styles.css';

export function BasicReading({ reading }: { reading: Reading }) {
  const summary = createOverallPersonalitySummary(reading);

  return (
    <section className={styles.reading} aria-labelledby="basic-reading-title">
      <p className={styles.eyebrow}>나를 알아보는 풀이</p>
      <h2 id="basic-reading-title">종합적인 나의 성향</h2>
      <p>{summary.join(' ')}</p>
      <details className={styles.sources}>
        <summary>이 설명은 무엇을 바탕으로 하나요?</summary>
        <p>
          성향을 살피는 자리인 <Term term={palaceTerms.명궁} />의 주성을
          중심으로 명식의 특징, 강점, 아쉬운 점과 보완 방향을 요약했습니다.
          주성이 둘이면 두 별의 특성을 더한 문장이 아니라 iztro 원문에서 설명한
          실제 조합의 특징을 사용합니다. 명궁이 비었으면 iztro 2.6.1과 같은
          방식으로 맞은편 궁의 주성을 참고합니다.
        </p>
        <p className={styles.evidence}>
          계산 근거: {reading.evidence.earthlyBranch} 위치의 명궁 ·{' '}
          {reading.evidence.stars.join(' · ') || '주요 별 없음'}
          {reading.evidence.oppositeReference && (
            <>
              {' '}
              · 맞은편 {
                reading.evidence.oppositeReference.earthlyBranch
              } 위치의 {reading.evidence.oppositeReference.palaceName}궁 참고 ·{' '}
              {reading.evidence.oppositeReference.stars.join(' · ')}
            </>
          )}
        </p>
        <p>
          <a href={reading.source} target="_blank" rel="noreferrer">
            출처: Sylar Long · iztro 14주성 설명 (중국어, 새 탭)
          </a>
        </p>
      </details>
    </section>
  );
}
