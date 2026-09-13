import type { Chart } from '../../domain/ziwei/chart';
import {
  createPalaceReading,
  palaceLabel,
} from '../../domain/interpretation/palace-reading';
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
              ? `맞은편 ${palaceLabel(entry.sourcePalaceName)}의 ${entry.starName}`
              : entry.starName}
          </p>
        </div>
      ))}
      {reading.combination && (
        <div>
          <h4>두 별이 함께 만드는 특징</h4>
          <h5>{reading.combination.heading}</h5>
          <p>{reading.combination.summary}</p>
          <p>
            {reading.combination.strength} {reading.combination.caution}{' '}
            {reading.combination.balance}
          </p>
          <p className={styles.readingBasis}>
            조합 근거:{' '}
            {reading.combination.starNames
              .map((starName) =>
                reading.entries[0]?.borrowedFromOpposite
                  ? `맞은편 ${palaceLabel(reading.entries[0].sourcePalaceName)}의 ${starName}`
                  : starName,
              )
              .join(' · ')}
          </p>
        </div>
      )}
      <h4>
        {reading.combination ? '이 조합은' : '이 별은'}{' '}
        {palaceLabel(palace.name)}에서 어떻게 나타나나요?
      </h4>
      <p>{reading.detailedDescription.join(' ')}</p>
      <h4>생활에서는 어떻게 활용하면 좋을까요?</h4>
      <p>{reading.detailedPractice.join(' ')}</p>
      <p className={styles.scope}>{reading.scope}</p>
    </div>
  );
}
