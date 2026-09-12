import { useAtom } from 'jotai';
import type { Chart } from '../../domain/ziwei/chart';
import { Term } from '../../components/ui/term';
import { terms } from '../../content/glossary';
import { positions } from './display';
import { selectedPalaceAtom } from './selection';
import * as styles from './styles.css';

export function ChartRing({
  chart,
  detail,
  controlsId,
}: {
  chart: Chart;
  detail: boolean;
  controlsId: string;
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
          {detail
            ? '궁을 선택해\n자세히 살펴보세요'
            : '궁을 선택해\n쉽게 살펴보세요'}
        </span>
      </div>
      {chart.palaces.map((palace) => {
        const majorStars = palace.stars.filter((star) => star.isMajor);
        return (
          <article
            key={palace.index}
            className={styles.palace}
            data-selected={palace.index === selectedIndex}
            style={{
              gridRow: positions[palace.earthlyBranch][0],
              gridColumn: positions[palace.earthlyBranch][1],
            }}
          >
            <button
              type="button"
              className={styles.palaceSelect}
              aria-pressed={palace.index === selectedIndex}
              aria-controls={controlsId}
              aria-label={`${palace.name.endsWith('궁') ? palace.name : `${palace.name}궁`} 선택`}
              onClick={() => setSelected(palace.index)}
            >
              <strong className={styles.palaceTitle}>{palace.name}</strong>
              <span className={styles.stars}>
                {majorStars.map((star) => star.name).join(' · ') || '주성 없음'}
              </span>
              {detail && (
                <span className={styles.branch}>
                  {palace.heavenlyStem}
                  {palace.earthlyBranch}
                </span>
              )}
              {palace.isBodyPalace && (
                <span className={styles.bodyLabel}>신궁</span>
              )}
            </button>
          </article>
        );
      })}
    </div>
  );
}
