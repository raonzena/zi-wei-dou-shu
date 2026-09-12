import type { BasicReading as Reading } from '../../domain/interpretation/basic-reading';
import { Term } from '../../components/ui/term';
import { palaceTerms, starTerms } from '../../content/glossary';
import * as styles from './styles.css';

export function BasicReading({ reading }: { reading: Reading }) {
  return (
    <section className={styles.reading} aria-labelledby="basic-reading-title">
      <p className={styles.eyebrow}>나를 알아보는 기본 풀이</p>
      <h2 id="basic-reading-title">나의 성향을 살펴보는 첫걸음</h2>
      <p>
        자미두수에서는 별의 배치에 의미를 붙여 사람의 성향을 살펴봅니다. 아래
        설명은 각 별을 전통적으로 풀이하는 방식이며, 제목이 나의 성격을 확정하는
        것은 아닙니다. 평소 내 모습과 닮은 점이 있는지 살펴보세요.
      </p>
      {reading.status === 'empty' && reading.evidence.oppositeReference && (
        <>
          <p>
            성향을 살피는 명궁에는 주성이 없습니다. 성격에 특징이 없거나 좋지
            않다는 뜻은 아니에요. 이럴 때는 맞은편{' '}
            {reading.evidence.oppositeReference?.palaceName}궁의 주성을 참고해
            나의 기본 성향을 살펴볼 수 있습니다. 다만 맞은편 궁의 모습이 나에게
            그대로 나타난다고 단정하지 않고, 명궁의 보조성과 주변 궁도 함께
            살펴야 합니다.
          </p>
          <p className={styles.scope}>
            아래 내용은 명궁의 주성 풀이가 아니라 맞은편 궁에서 참고한 별의 기본
            의미입니다.
          </p>
        </>
      )}
      {reading.status === 'empty' && !reading.evidence.oppositeReference && (
        <p>
          성향을 살피는 자리에 이 기본 풀이가 다루는 주요 별이 없습니다. 성격에
          특징이 없거나 좋지 않다는 뜻은 아니에요. 이 결과에는 맞은편 궁의 참고
          풀이가 저장되어 있지 않아, 여기서는 성향 설명을 제공하지 않습니다.
        </p>
      )}
      {reading.status === 'multiple' && (
        <p className={styles.scope}>
          성향을 살피는 자리에 주요 별이 둘 있습니다. 각 별이 뜻하는 모습을
          하나씩 소개할게요. 두 별이 함께 있을 때의 의미까지 풀이한 내용은
          아닙니다.
        </p>
      )}
      {reading.entries.map((entry) => (
        <article key={entry.ruleId} className={styles.entry}>
          <h3>{entry.title}</h3>
          <p className={styles.evidence}>
            이 설명의 바탕이 된 별:{' '}
            {reading.status === 'empty' &&
              reading.evidence.oppositeReference &&
              `${reading.evidence.oppositeReference?.palaceName}궁의 `}
            <Term term={starTerms[`major:${entry.starName}`]}>
              {entry.starName}
            </Term>
          </p>
          {entry.meaning.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </article>
      ))}
      <details className={styles.sources}>
        <summary>이 설명은 무엇을 바탕으로 하나요?</summary>
        <p>
          성향을 살피는 자리인 <Term term={palaceTerms.명궁} />의 주요 별만
          설명합니다. 다른 별과의 관계나 함께 놓였을 때의 의미까지 종합하지는
          않았습니다. 일·관계·돈에 대한 주제별 해석은 이 기본 풀이에 포함하지
          않습니다.
        </p>
        <p className={styles.evidence}>
          계산 근거: {reading.evidence.earthlyBranch} 위치의 명궁 ·{' '}
          {reading.evidence.stars.join(' · ') || '주요 별 없음'}
          {reading.evidence.oppositeReference && (
            <>
              {' '}
              · 맞은편 {
                reading.evidence.oppositeReference.earthlyBranch
              } 위치의 {reading.evidence.oppositeReference.palaceName}궁 참고 ·{' '}
              {reading.evidence.oppositeReference.stars.join(' · ')}
            </>
          )}
        </p>
        <p>
          <a href={reading.source} target="_blank" rel="noreferrer">
            출처: Sylar Long · iztro 14주성 설명 (중국어, 새 탭)
          </a>
        </p>
      </details>
    </section>
  );
}
