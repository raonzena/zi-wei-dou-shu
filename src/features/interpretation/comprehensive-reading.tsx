import { useContext } from 'react';
import type { Chart } from '../../domain/ziwei/chart';
import { createComprehensiveReading } from '../../domain/interpretation/comprehensive-reading';
import { palaceLabel } from '../../domain/interpretation/palace-reading';
import { StarContentContext } from '../chart/star-content-context';
import * as styles from './styles.css';

export function ComprehensiveReading({ chart }: { chart: Chart }) {
  const content = useContext(StarContentContext);
  const sections = createComprehensiveReading(
    chart,
    content.status === 'ready' ? content.entries : [],
  );
  return (
    <section className={styles.reading} aria-labelledby="comprehensive-title">
      <h2 id="comprehensive-title">생활의 여러 모습을 함께 살펴보는 풀이</h2>
      <p>
        나를 대하는 방식부터 일과 관계까지, 서로 다른 생활 영역을 함께
        살펴봅니다. 잘 맞는 모습과 다르게 느껴지는 모습을 자신의 경험에 비추어
        읽어보세요.
      </p>
      {sections.map((section) => (
        <article className={styles.entry} key={section.id}>
          <h3>{section.title}</h3>
          <p>{section.connection}</p>
          {section.readings.map((reading) => (
            <div key={reading.name}>
              <h4>{reading.focus}</h4>
              <p>{reading.description}</p>
              {reading.empty && reading.stars.length === 0 ? (
                <p>
                  이 영역과 맞은편 영역에는 주성이 없어 보조성과 주변 궁의
                  관계를 함께 살펴야 합니다. 해당 영역이 비어 있거나 중요하지
                  않다는 뜻은 아닙니다.
                </p>
              ) : (
                <>
                  {reading.empty && reading.oppositeReference && (
                    <p>
                      이 영역에는 주성이 없어 맞은편{' '}
                      {palaceLabel(reading.oppositeReference.name)}의 주성을
                      참고합니다. 맞은편 궁의 모습이 이 영역에 그대로 나타난다는
                      뜻은 아니며, 이 영역의 보조성과 주변 궁의 관계도 함께
                      살펴야 합니다.
                    </p>
                  )}
                  {reading.usesBasicPersonalitySummary ? (
                    <p>
                      {reading.empty
                        ? '이 궁이 참고하는 맞은편 명궁의 주성은 위의 ‘나를 알아보는 기본 풀이’에서 설명했습니다. 여기서는 낯선 환경에서 사람을 만나고 적응하는 맥락만 확인합니다.'
                        : '명궁 주성의 기본 성향은 위의 ‘나를 알아보는 기본 풀이’에서 설명했습니다. 여기서는 익숙한 상황에서 판단하고 선택하는 맥락만 확인합니다.'}
                    </p>
                  ) : reading.combination ? (
                    <div>
                      <p>
                        <strong>{reading.combination.heading}</strong>
                      </p>
                      <p>
                        {reading.combination.summary}{' '}
                        {reading.combination.strength}{' '}
                        {reading.combination.caution}{' '}
                        {reading.combination.balance}
                      </p>
                    </div>
                  ) : (
                    reading.stars.map((item) => (
                      <div key={item.star.name}>
                        <p>
                          {item.meaning} {item.strength} {item.caution}
                        </p>
                        <p>{item.balance}</p>
                      </div>
                    ))
                  )}
                </>
              )}
              {reading.interactions.map((item) => (
                <p key={item.stars.join(':')}>{item.text}</p>
              ))}
              {reading.transformations.map((item) => (
                <p key={item.star.name}>{item.text}</p>
              ))}
              <p>{reading.practice}</p>
              <details className={styles.sources}>
                <summary>이 풀이의 근거와 함께 볼 특징</summary>
                <p className={styles.evidence}>
                  {reading.name} · 주성:{' '}
                  {reading.empty
                    ? '없음'
                    : reading.stars.map((s) => s.star.name).join(' · ')}
                  {reading.empty && reading.oppositeReference && (
                    <>
                      {' '}
                      · 맞은편 {palaceLabel(
                        reading.oppositeReference.name,
                      )}{' '}
                      참고 주성:{' '}
                      {reading.stars.map((s) => s.star.name).join(' · ')}
                    </>
                  )}
                </p>
                {reading.stars.length > 1 &&
                  !reading.usesBasicPersonalitySummary && (
                    <p>
                      두 주성의 개별 뜻을 바탕으로 이 조합의 공통 강점과
                      주의점을 설명했습니다. 밝기·사화·보조성까지 종합한 전문
                      조합 풀이는 아닙니다.
                    </p>
                  )}
                {reading.supporting.map(({ star, entry }) => (
                  <p key={entry.star_key}>
                    <strong>{star.name}</strong> · {entry.translation}
                  </p>
                ))}
                {content.status === 'unavailable' && (
                  <p>함께 볼 별 설명을 불러오지 못했습니다.</p>
                )}
                {reading.transformations.map((item) => (
                  <p className={styles.evidence} key={item.star.name}>
                    생년 화{item.star.transformation} · {item.star.name} · 같은
                    궁의 관심·책임·평가·부담을 살피는 보충 관점이며 별의 의미
                    전체를 대신하지 않습니다.
                  </p>
                ))}
                {reading.interactions.map((item) => (
                  <p className={styles.evidence} key={item.stars.join(':')}>
                    같은 궁의 {item.stars.join('·')} ·{' '}
                    <a href="https://iztro.com/learn/minor-star">
                      두 보조성의 대비를 설명한 원문
                    </a>
                  </p>
                ))}
                <p className={styles.evidence}>
                  삼방사정에서 함께 볼 궁:{' '}
                  {reading.related.map((p) => p.name).join(' · ')}. 같은 자리와
                  연결된 생활 영역을 비교하기 위한 배치 자료입니다. 연결 자체로
                  길흉이나 행동 조언을 도출하지 않습니다.
                </p>
              </details>
            </div>
          ))}
        </article>
      ))}
      <details className={styles.sources}>
        <summary>풀이의 범위와 출처</summary>
        <p>
          열두 궁의 주성, 표시 범위의 보조성, 생년사화와 두 보조성 조합의 기본
          의미를 다룹니다. 신궁은{' '}
          {chart.palaces.find((p) => p.isBodyPalace)!.name}에 있습니다. 다른
          궁의 사화가 연쇄적으로 작용하는 해석, 모든 쌍성 조합, 시기별 종합
          운세는 포함하지 않습니다.
        </p>
        <a href="https://iztro.com/learn/major-star">주성의 기본 의미</a> ·{' '}
        <a href="https://iztro.com/learn/mutagen">사화의 기본 의미</a>
      </details>
    </section>
  );
}
