import type { BasicReading as Reading } from '../../domain/interpretation/basic-reading';
import { Term } from '../../components/ui/term';
import { palaceTerms, starTerms, terms } from '../../content/glossary';
import * as styles from './styles.css';

export function BasicReading({ reading }: { reading: Reading }) {
  return (
    <section className={styles.reading} aria-labelledby="basic-reading-title">
      <p className={styles.eyebrow}>명궁으로 시작하는 기본 풀이</p>
      <h2 id="basic-reading-title">나의 성향을 살펴보는 첫걸음</h2>
      <p>
        <Term term={palaceTerms.명궁} />에 놓인 <Term term={terms.주성} />을
        바탕으로 별의 기본 의미를 소개합니다. 전통적인 해석을 자신을 돌아보는
        참고로 읽어주세요.
      </p>
      <p className={styles.evidence}>
        내 명반의 근거: {reading.evidence.earthlyBranch} 위치의 명궁 ·{' '}
        {reading.evidence.stars.join(' · ') || '주성 없음'}
      </p>
      {reading.status === 'empty' && (
        <p>
          명궁에 주성이 없습니다. 좋고 나쁨을 뜻하는 것은 아닙니다. 다른 궁과
          별의 관계를 함께 살펴야 하므로, 현재 기본 풀이에서는 성향 해석을
          제공하지 않습니다.
        </p>
      )}
      {reading.status === 'multiple' && (
        <p className={styles.scope}>
          명궁에 주성이 함께 놓여 있습니다. 아래는 각 별의 개별 의미이며, 두
          설명을 합친 성향 풀이가 아닙니다. 조합에 따른 해석은 아직 제공하지
          않습니다.
        </p>
      )}
      {reading.entries.map((entry) => (
        <article key={entry.ruleId} className={styles.entry}>
          <h3>
            <Term term={starTerms[`major:${entry.starName}`]}>
              {entry.starName}
            </Term>
            의 기본 의미
          </h3>
          <p>{entry.meaning}</p>
          <div className={styles.question}>
            <h4>나에게 물어보기</h4>
            <p>{entry.question}</p>
          </div>
        </article>
      ))}
      <details className={styles.sources}>
        <summary>풀이의 범위와 출처</summary>
        <p>
          명궁의 주성만 다룬 기본 설명입니다. 다른 궁과의 관계,{' '}
          <Term term={terms.보조성} />, <Term term={terms.사화} />와 별의 밝기를
          종합한 풀이는 아닙니다. 일·관계·재물의 주제별 풀이는 아직 제공하지
          않습니다.
        </p>
        <p>
          ‘나에게 물어보기’는 별의 의미를 읽고 생각을 정리하도록 서비스에서
          작성한 질문입니다. 명반에서 예측한 결과가 아닙니다.
        </p>
        <p>
          <a href={reading.source} target="_blank" rel="noreferrer">
            별의 의미 참고: iztro 14주성 설명 (중국어, 새 탭)
          </a>
        </p>
      </details>
    </section>
  );
}
