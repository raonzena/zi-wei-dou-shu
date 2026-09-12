import type { Chart } from '../../domain/ziwei/chart';
import { createPalaceReading } from '../../domain/interpretation/palace-reading';
import * as styles from './styles.css';

export function PalaceReading({
  palace,
  detailed = false,
}: {
  palace: Chart['palaces'][number];
  detailed?: boolean;
}) {
  const reading = createPalaceReading(palace);
  return (
    <div>
      <h3>이 영역에서 나는 어떤 모습인가요?</h3>
      <p>{reading.introduction}</p>
      {reading.entries.map((entry) => (
        <div key={entry.starName}>
          <h4>{entry.heading}</h4>
          <p>
            {detailed ? entry.detailedSentences.join(' ') : entry.simpleText}
          </p>
          <p className={styles.readingBasis}>풀이 근거: {entry.starName}</p>
        </div>
      ))}
      <h4>생활에서는 어떻게 활용하면 좋을까요?</h4>
      <p>
        {detailed ? reading.detailedPractice.join(' ') : reading.simplePractice}
      </p>
      {reading.entries.length > 0 && (
        <p className={styles.scope}>{reading.scope}</p>
      )}
    </div>
  );
}
