import { useAtomValue } from 'jotai';
import type { Chart } from '../../domain/ziwei/chart';
import { Term } from '../../components/ui/term';
import { palaceTerms, starTerms, terms } from '../../content/glossary';
import { displayedStars, starKey, type Star } from './display';
import { selectedPalaceAtom } from './selection';
import { PalaceReading } from '../interpretation/palace-reading';
import { palaceReadingContexts } from '../../content/palace-reading-rules';
import * as styles from './styles.css';

function StarList({ stars }: { stars: Star[] }) {
  return (
    <ul className={styles.starList}>
      {stars.map((star) => (
        <li key={starKey(star)} className={styles.starRow}>
          <Term term={starTerms[starKey(star)]} />
          {star.transformation && (
            <span className={styles.mutagen}>
              <Term term={terms[star.transformation]} />
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
export function PalaceDetail({
  chart,
  id,
  showTechnicalDetails = true,
}: {
  chart: Chart;
  id: string;
  showTechnicalDetails?: boolean;
}) {
  const selected = useAtomValue(selectedPalaceAtom);
  const palace = chart.palaces.find((p) =>
    selected === null ? p.name === '명궁' : p.index === selected,
  )!;
  const stars = displayedStars(palace);
  const major = stars.filter((star) => star.isMajor);
  const supporting = stars.filter((star) => !star.isMajor);
  return (
    <section id={id} className={styles.detail} aria-labelledby={`${id}-title`}>
      <div aria-live="polite" aria-atomic="true">
        <h2 id={`${id}-title`}>
          <Term term={palaceTerms[palace.name]}>{palace.name}</Term>
          {palace.isBodyPalace && (
            <>
              {' '}
              · <Term term={terms.신궁} />
            </>
          )}
        </h2>
        <h3>어떤 생활 영역을 보여주나요?</h3>
        <p>{palaceReadingContexts[palace.name].description}</p>
      </div>
      <PalaceReading palace={palace} />
      {showTechnicalDetails && (
        <>
          <p className={styles.help}>
            <Term term={terms.간지} />: {palace.heavenlyStem}
            {palace.earthlyBranch}
          </p>
          <h3>
            <Term term={terms.주성} />
          </h3>
          {major.length ? (
            <StarList stars={major} />
          ) : (
            <p>
              이 궁에는 주성이 없습니다. 다른 궁과 별의 관계도 함께 살펴봅니다.
            </p>
          )}
          <h3>
            <Term term={terms.보조성} />
          </h3>
          {supporting.length ? (
            <StarList stars={supporting} />
          ) : (
            <p>이 궁에는 현재 표시 범위에 해당하는 보조성이 없습니다.</p>
          )}
          <p className={styles.help}>
            <Term term={terms.사화} />는 해당 별 옆에 표시합니다. 별 하나만으로
            성격이나 미래를 단정하지 않습니다.
          </p>
        </>
      )}
    </section>
  );
}
