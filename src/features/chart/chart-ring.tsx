import { useAtom } from 'jotai';
import type { Chart } from '../../domain/ziwei/chart';
import { Term } from '../../components/ui/term';
import { terms } from '../../content/glossary';
import { positions } from './display';
import { selectedPalace, selectedPalaceAtom } from './selection';
import * as styles from './styles.css';

export function ChartRing({
  chart,
  detail,
  controlsId,
}: {
  chart: Chart;
  detail: boolean;
  controlsId?: string;
}) {
  const [selected, setSelected] = useAtom(selectedPalaceAtom);
  const selectedIndex = selectedPalace(chart, selected).index;
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
            : '열두 궁의 배치를\n살펴보세요'}
        </span>
      </div>
      {chart.palaces.map((palace) => {
        const majorStars = palace.stars.filter((star) => star.isMajor);
        const Cell = detail ? 'button' : 'div';
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
            <Cell
              type={detail ? 'button' : undefined}
              className={detail ? styles.palaceSelect : styles.palaceContent}
              aria-pressed={detail ? palace.index === selectedIndex : undefined}
              aria-controls={detail ? controlsId : undefined}
              aria-label={
                detail
                  ? `${palace.name.endsWith('궁') ? palace.name : `${palace.name}궁`} 선택`
                  : undefined
              }
              onClick={detail ? () => setSelected(palace.index) : undefined}
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
            </Cell>
          </article>
        );
      })}
    </div>
  );
}
