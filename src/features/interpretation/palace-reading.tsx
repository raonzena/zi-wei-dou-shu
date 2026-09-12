import type { Chart } from '../../domain/ziwei/chart';
import { createPalaceReading } from '../../domain/interpretation/palace-reading';
import * as styles from './styles.css';

export function PalaceReading({
  chart,
  palace,
}: {
  chart: Chart;
  palace: Chart['palaces'][number];
}) {
  const reading = createPalaceReading(chart, palace);
  return (
    <div>
      <h3>이 영역에서 나는 어떤 모습인가요?</h3>
      <p>{reading.introduction}</p>
      {reading.entries.map((entry) => (
        <div key={entry.starName}>
          <h4>{entry.heading}</h4>
          <p>{entry.detailedSentences.join(' ')}</p>
          <p className={styles.readingBasis}>
            풀이 근거:{' '}
            {entry.borrowedFromOpposite
              ? `맞은편 ${entry.sourcePalaceName}궁의 ${entry.starName}`
              : entry.starName}
          </p>
        </div>
      ))}
      <h4>생활에서는 어떻게 활용하면 좋을까요?</h4>
      <p>{reading.detailedPractice.join(' ')}</p>
      <p className={styles.scope}>{reading.scope}</p>
    </div>
  );
}
