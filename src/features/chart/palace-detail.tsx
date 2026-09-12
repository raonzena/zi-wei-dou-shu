import { useContext } from 'react';
import { StarContentContext } from './star-content-context';
import { useAtomValue } from 'jotai';
import type { Chart } from '../../domain/ziwei/chart';
import { Term } from '../../components/ui/term';
import { palaceTerms, starTerms, terms } from '../../content/glossary';

import { displayedStars, starKey, type Star } from './display';
import { selectedPalace, selectedPalaceAtom } from './selection';
import { PalaceReading } from '../interpretation/palace-reading';
import { createPalaceReading } from '../../domain/interpretation/palace-reading';
import * as styles from './styles.css';

function StarList({ stars }: { stars: Star[] }) {
  const content = useContext(StarContentContext);
  return (
    <ul className={styles.starList}>
      {stars.map((star) => {
        const entry =
          content.status === 'ready'
            ? content.entries.find((item) => item.star_key === starKey(star))
            : undefined;
        return (
          <li key={starKey(star)} className={styles.starRow}>
            <details className={styles.starExplanation}>
              <summary className={styles.disclosureSummary}>
                {starTerms[starKey(star)].label}
                {star.transformation && (
                  <span className={styles.mutagen}>
                    {' '}
                    · 화{star.transformation}
                  </span>
                )}
                <span className={styles.help}> · 별의 의미 읽기</span>
              </summary>
              {entry ? (
                <>
                  {entry.translation.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                  <p className={styles.help}>
                    {entry.translation_kind === 'adaptation'
                      ? '원문을 바탕으로 편집한 한국어 설명'
                      : '한국어 번역'}{' '}
                    · 설명 버전 {entry.version}
                  </p>
                  <a href={entry.source_url} target="_blank" rel="noreferrer">
                    출처: iztro 별 설명 (중국어, 새 탭)
                  </a>
                  <p className={styles.help}>{entry.license}</p>
                </>
              ) : (
                <p>
                  {content.status === 'unavailable'
                    ? '별 설명을 불러오지 못했습니다. 잠시 후 다시 확인해주세요.'
                    : '이 별의 설명은 검수 중입니다.'}
                </p>
              )}
              {star.transformation && (
                <p>
                  <Term term={terms[star.transformation]} />:{' '}
                  {terms[star.transformation].description}
                </p>
              )}
            </details>
          </li>
        );
      })}
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
  const palace = selectedPalace(chart, selected);
  const stars = displayedStars(palace);
  const reading = createPalaceReading(palace);
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
        <p>
          {showTechnicalDetails
            ? reading.detailedDescription.join(' ')
            : reading.simpleDescription}
        </p>
      </div>
      {showTechnicalDetails ? (
        <details key={palace.index} className={styles.starExplanation}>
          <summary className={styles.disclosureSummary}>
            {palace.name}의 주성으로 읽는 나의 모습
          </summary>
          <PalaceReading palace={palace} detailed />
        </details>
      ) : (
        <PalaceReading palace={palace} />
      )}
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
