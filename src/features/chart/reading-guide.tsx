import { Term } from '../../components/ui/term';
import { terms } from '../../content/glossary';
import * as styles from './styles.css';

export function ReadingGuide({ id }: { id: string }) {
  return (
    <section className={styles.readingGuide} aria-labelledby={id}>
      <h2 id={id} className={styles.readingGuideTitle}>
        명반을 읽는 방법
      </h2>
      <ol>
        <li>
          먼저 궁을 선택해 어떤 생활 영역을 다루는지 확인하세요. 같은 별도 일,
          관계, 내면 중 어디에서 읽는지에 따라 살펴볼 맥락이 달라집니다.
        </li>
        <li>
          <Term term={terms.주성} />
          으로 그 영역의 큰 특징을 살핀 뒤, 보조성으로 함께 고려할 특징을
          확인하세요. 별의 뜻을 하나씩 더해 결론을 내리지는 않습니다.
        </li>
        <li>
          <Term term={terms.사화} />와 <Term term={terms.밝기} />, 다른 궁과의
          관계를 함께 살펴봅니다. 표시 하나를 좋고 나쁨의 점수로 읽지 마세요.
        </li>
      </ol>
      <p>
        주성이 없다고 그 영역에 특징이 없는 것은 아닙니다. 맞은편 궁과 주변 궁의
        관계까지 살펴야 합니다. 주성이 둘이면 각각의 뜻을 먼저 익히되, 두 별의
        조합이 단순한 합과 같지는 않다는 점을 기억하세요.
      </p>
      <p className={styles.help}>
        아래 설명은 별의 기본 의미를 익히는 안내입니다. 여러 궁과 별을 종합한
        개인의 결론과는 구분해서 읽어주세요.
      </p>
    </section>
  );
}
