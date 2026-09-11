import type { Chart } from '../../domain/ziwei/chart';
import { inspectPatterns } from '../../domain/interpretation/patterns';
import { Term } from '../../components/ui/term';
import { extendedTerms, starTerms } from '../../content/glossary';
import * as styles from './styles.css';

export function monthLabel(m: Chart['timing']['monthly'][number]) {
  return `${m.year}년 ${m.isLeapMonth ? '윤' : ''}${m.month}월 ${m.dayRange.join('–')}일`;
}

export function ExpandedEvidence({ chart }: { chart: Chart }) {
  const name = (id: string) =>
    chart.palaces.find((p) => `palace:${p.earthlyBranch}` === id)!.name;
  const moving = (layer: Pick<Chart['timing']['yearly'], 'movingStars'>) =>
    layer.movingStars.map((s) => {
      const base = s.name.replace(/\((십년|년|월)\)$/, '');
      const category = ['홍란', '천희'].includes(base) ? 'adjective' : 'minor';
      const definition =
        base === '해신'
          ? {
              description:
                '유년에 추가되는 해신입니다. 개별 사건의 해결을 보장하지 않습니다.',
              source: extendedTerms.유요.source,
            }
          : starTerms[`${category}:${base}`];
      if (!definition) throw new Error('Unsupported moving star');
      return (
        <span key={`${s.palaceId}:${s.name}`}>
          <Term
            term={{
              label: s.name,
              description: `${definition.description} ${extendedTerms.유요.description}`,
              source: definition.source,
            }}
          />
          ({name(s.palaceId)}) ·{' '}
        </span>
      );
    });
  return (
    <>
      <details>
        <summary>
          <Term term={extendedTerms.유월} /> · 올해 전체 월별 자료
        </summary>
        <p>
          아래 월·일은 iztro 음력 기준입니다. 한국 음력이나 양력 날짜로 읽지
          마세요. 윤달이 있는 해에는 전반과 후반을 나눠 표시합니다.
        </p>
        <div
          className={styles.tableScroll}
          tabIndex={0}
          role="region"
          aria-label="올해 유월 표, 가로 스크롤 가능"
        >
          <table className={styles.evidenceTable}>
            <caption>올해 전체 유월 근거</caption>
            <thead>
              <tr>
                <th scope="col">음력 구간</th>
                <th scope="col">유월 명궁</th>
                <th scope="col">유월사화</th>
                <th scope="col">
                  <Term term={extendedTerms.유요} />
                </th>
              </tr>
            </thead>
            <tbody>
              {chart.timing.monthly.map((m) => (
                <tr key={m.id}>
                  <th scope="row">{monthLabel(m)}</th>
                  <td>
                    {name(m.soulPalaceId)} ({m.heavenlyStem}
                    {m.earthlyBranch})
                  </td>
                  <td>
                    {m.transformations
                      .map(
                        (t) =>
                          `화${t.type}: ${t.starName}(${name(t.palaceId)})`,
                      )
                      .join(' · ')}
                  </td>
                  <td>{moving(m)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <details>
        <summary>대한·유년의 유요 자료</summary>
        <p>
          <Term term={extendedTerms.유요} />는 운한마다 구분합니다.
        </p>
        <p>
          {chart.timing.yearly.year}년: {moving(chart.timing.yearly)}
        </p>
        <ul>
          {chart.timing.decadals.map((d) => (
            <li key={d.id}>
              {d.ageRange.join('–')}세: {moving(d)}
            </li>
          ))}
        </ul>
      </details>
      <details>
        <summary>궁간 사화의 출발·도착 관계</summary>
        <p>
          <Term term={extendedTerms.비화} /> · 본명반 각 궁의 천간을 사용합니다.
        </p>
        <ul>
          {chart.flyingTransformations.map((f) => (
            <li key={f.id}>
              {name(f.sourcePalaceId)}({f.heavenlyStem}) →{' '}
              {name(f.targetPalaceId)} · {f.starName} 화{f.type}
              {f.self ? ' · 자화' : ''}
            </li>
          ))}
        </ul>
      </details>
      <details>
        <summary>두 가지 격국의 구조 검사</summary>
        <p>
          <Term term={extendedTerms.격국} />
        </p>
        <ul>
          {inspectPatterns(chart).map((p) => (
            <li key={p.id}>
              <Term
                term={{
                  label: p.name,
                  description: p.condition,
                  source: p.source,
                }}
              />
              : {p.matched ? '배치 조건 일치' : '배치 조건 불일치'} ·{' '}
              {p.condition}
            </li>
          ))}
        </ul>
        <p>
          명궁 배치 조건만 검사했습니다. 길흉·성패나 다른 격국의 성립 여부를
          뜻하지 않습니다.
        </p>
      </details>
    </>
  );
}
