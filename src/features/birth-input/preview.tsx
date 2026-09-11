import type { Chart } from '../../domain/ziwei/chart';
import * as styles from './styles.css';

// Clockwise ring: 巳午未申 / 辰..酉 / 卯..戌 / 寅丑子亥.
const positions: Record<string, [number, number]> = {
  사: [1, 1],
  오: [1, 2],
  미: [1, 3],
  신: [1, 4],
  유: [2, 4],
  술: [3, 4],
  해: [4, 4],
  자: [4, 3],
  축: [4, 2],
  인: [4, 1],
  묘: [3, 1],
  진: [2, 1],
};
export function ChartPreview({
  chart,
  onBack,
}: {
  chart: Chart;
  onBack: () => void;
}) {
  return (
    <section aria-labelledby="preview-title">
      <p className={styles.eyebrow}>나의 명반</p>
      <h1 id="preview-title" tabIndex={-1} className={styles.title}>
        열두 궁으로 보는 명반
      </h1>
      <p className={styles.help}>
        입력한 출생 정보로 계산한 명반입니다. 현재는 주요 별을 확인할 수
        있습니다.
      </p>
      <div className={styles.chart} aria-label="12궁 명반">
        <div className={styles.chartCenter}>
          <strong>자미두수</strong>
          <span>{chart.fiveElementsClass}</span>
        </div>
        {chart.palaces.map((palace) => (
          <article
            key={palace.index}
            className={styles.palace}
            style={{
              gridRow: positions[palace.earthlyBranch]?.[0],
              gridColumn: positions[palace.earthlyBranch]?.[1],
            }}
          >
            <h2 className={styles.palaceTitle}>
              {palace.name}
              {palace.isBodyPalace && <span> · 신궁</span>}
            </h2>
            <p className={styles.stars}>
              {palace.stars
                .filter((s) => s.isMajor)
                .map((s) => s.name)
                .join(' · ') || '주성 없음'}
            </p>
          </article>
        ))}
      </div>
      <section className={styles.reading} aria-labelledby="reading-title">
        <h2 id="reading-title">명반을 읽기 전에</h2>
        <p>
          열두 칸은 자미두수에서 삶의 영역을 구분하는 ‘궁’입니다. 명궁은 자신을
          살펴보는 중심 궁이고, 각 칸의 주성은 그 궁을 해석할 때 참고하는 주요
          별입니다.
        </p>
        <p>
          ‘주성 없음’은 해당 칸에 14주성이 없다는 뜻입니다. 다른 별까지 없거나
          좋지 않은 결과라는 의미는 아닙니다.
        </p>
        <p className={styles.help}>
          이 안내는 공통적인 읽는 법입니다. 개인화 해석, 상세 보기와 공유 기능은
          아직 제공하지 않습니다. 결과는 저장되지 않으며 새로고침하면 입력
          화면으로 돌아갑니다.
        </p>
      </section>
      <button type="button" className={styles.button} onClick={onBack}>
        출생 정보 수정
      </button>
    </section>
  );
}
