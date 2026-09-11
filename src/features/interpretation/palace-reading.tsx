import type { Chart } from '../../domain/ziwei/chart';
import { createPalaceReading } from '../../domain/interpretation/palace-reading';
import * as styles from './styles.css';

export function PalaceReading({
  palace,
}: {
  palace: Chart['palaces'][number];
}) {
  const reading = createPalaceReading(palace);
  return (
    <div>
      <h3>내 명반에서 읽는 모습</h3>
      <p>{reading.introduction}</p>
      {reading.entries.map((entry) => (
        <div key={entry.starName}>
          <h4>{entry.starName}에서 읽는 태도</h4>
          <p>
            {entry.meaning} {entry.balance}
          </p>
        </div>
      ))}
      <h4>생활에 적용해보기</h4>
      <p>{reading.practice}</p>
      {reading.entries.length > 0 && (
        <p className={styles.scope}>{reading.scope}</p>
      )}
    </div>
  );
}
