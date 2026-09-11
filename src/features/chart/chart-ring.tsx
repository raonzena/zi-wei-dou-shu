import { useAtom } from 'jotai';
import type { Chart } from '../../domain/ziwei/chart';
import { Term } from '../../components/ui/term';
import { palaceTerms, starTerms, terms } from '../../content/glossary';
import { positions, starKey } from './display';
import { selectedPalaceAtom } from './selection';
import * as styles from './styles.css';

export function ChartRing({
  chart,
  detail,
}: {
  chart: Chart;
  detail: boolean;
}) {
  const [selected, setSelected] = useAtom(selectedPalaceAtom);
  const selectedIndex =
    selected ?? chart.palaces.find((p) => p.name === '명궁')!.index;
  return (
    <div className={styles.chart} aria-label="12궁 명반">
      <div className={styles.center}>
        <strong
          className={styles.centerTitle}
          lang="zh-Hant"
          aria-label="자미두수"
        >
          紫微斗數
        </strong>
        <Term term={terms.오행국}>{chart.fiveElementsClass}</Term>
        <span className={styles.centerHint}>
          {detail ? '궁을 선택해\n자세히 살펴보세요' : '나의 열두 궁'}
        </span>
      </div>
      {chart.palaces.map((palace) => {
        const majorStars = palace.stars.filter((star) => star.isMajor);
        return (
          <article
            key={palace.index}
            className={styles.palace}
            data-selected={detail && palace.index === selectedIndex}
            style={{
              gridRow: positions[palace.earthlyBranch][0],
              gridColumn: positions[palace.earthlyBranch][1],
            }}
          >
            {detail ? (
              <button
                type="button"
                className={styles.palaceSelect}
                aria-pressed={palace.index === selectedIndex}
                aria-controls="palace-detail"
                aria-label={`${palace.name.endsWith('궁') ? palace.name : `${palace.name}궁`} 선택`}
                onClick={() => setSelected(palace.index)}
              >
                <strong className={styles.palaceTitle}>{palace.name}</strong>
                <span className={styles.stars}>
                  {majorStars.map((star) => star.name).join(' · ') ||
                    '주성 없음'}
                </span>
                <span className={styles.branch}>
                  {palace.heavenlyStem}
                  {palace.earthlyBranch}
                </span>
                {palace.isBodyPalace && (
                  <span className={styles.bodyLabel}>신궁</span>
                )}
              </button>
            ) : (
              <>
                <h2 className={styles.palaceTitle}>
                  <Term term={palaceTerms[palace.name]}>{palace.name}</Term>
                </h2>
                <div className={styles.stars}>
                  {majorStars.length
                    ? majorStars.map((star) => (
                        <Term
                          key={starKey(star)}
                          term={starTerms[starKey(star)]}
                        >
                          {star.name}
                        </Term>
                      ))
                    : '주성 없음'}
                </div>
                {palace.isBodyPalace && (
                  <span className={styles.bodyLabel}>
                    <Term term={terms.신궁} />
                  </span>
                )}
              </>
            )}
          </article>
        );
      })}
    </div>
  );
}
