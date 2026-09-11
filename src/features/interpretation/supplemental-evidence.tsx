import type { Chart } from '../../domain/ziwei/chart';
import { Term } from '../../components/ui/term';
import { terms } from '../../content/glossary';
import * as styles from './styles.css';

export function SupplementalEvidence({ chart }: { chart: Chart }) {
  const { timing } = chart;
  const palaceName = (id: string) =>
    chart.palaces.find((p) => `palace:${p.earthlyBranch}` === id)?.name;
  const mutagens = (items: typeof timing.yearly.transformations) =>
    items
      .map((t) => `화${t.type}: ${t.starName}(${palaceName(t.palaceId)})`)
      .join(' · ');
  return (
    <>
      <p>
        <Term term={terms.명주} /> {chart.soulStar} · <Term term={terms.신주} />{' '}
        {chart.bodyStar}
      </p>
      <p>
        <Term term={terms.대한} /> {timing.startAge}세 시작 · {timing.direction}
        . 나이는 {timing.ageBasis}입니다. 연도는 {timing.yearBoundary}에
        시작합니다. 표시된 구간은 수명을 뜻하지 않습니다.
      </p>
      <div
        className={styles.tableScroll}
        tabIndex={0}
        role="region"
        aria-label="AI에 전달한 대한 표, 가로 스크롤 가능"
      >
        <table className={styles.evidenceTable}>
          <caption>AI에 전달한 대한 자료</caption>
          <thead>
            <tr>
              <th scope="col">계산용 나이</th>
              <th scope="col">연도</th>
              <th scope="col">대한 명궁</th>
              <th scope="col">대한사화</th>
            </tr>
          </thead>
          <tbody>
            {timing.decadals.map((d) => (
              <tr key={d.id}>
                <th scope="row">{d.ageRange.join('–')}세</th>
                <td>{d.yearRange.join('–')}</td>
                <td>
                  {palaceName(d.soulPalaceId)} ({d.heavenlyStem}
                  {d.earthlyBranch})
                </td>
                <td>{mutagens(d.transformations)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        <Term term={terms.유년} /> {timing.yearly.year}년 · 유년 명궁:{' '}
        {palaceName(timing.yearly.soulPalaceId)} ({timing.yearly.heavenlyStem}
        {timing.yearly.earthlyBranch})
      </p>
      <p>유년사화: {mutagens(timing.yearly.transformations)}</p>
      {!timing.yearly.currentDecadalId && (
        <p>
          올해는 제공된 대한 구간 밖에 있습니다. 해당 대한과 연결한 해석은
          제공하지 않습니다.
        </p>
      )}
      <p>
        <Term term={terms.밝기} />는 iztro 기본표를 사용합니다.
        묘·왕·득·리·평·불·함은 전통 분류이며 운세 점수가 아닙니다. 등급이 없는
        별은 밝기를 추정하지 않습니다.
      </p>
    </>
  );
}
