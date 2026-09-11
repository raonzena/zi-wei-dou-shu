import {
  consultationStages,
  type AiExplanationResult,
} from '../../domain/interpretation/ai-explanation';
import { consultationEvidence } from '../../domain/interpretation/consultation-evidence';
import type { Chart } from '../../domain/ziwei/chart';
import { Term } from '../../components/ui/term';
import { monthLabel } from './expanded-evidence';
import { SupplementalEvidence } from './supplemental-evidence';
import { palaceTerms, starTerms } from '../../content/glossary';
import * as styles from './styles.css';

export function AiExplanation({
  result,
  chart,
  pending,
  onRetry,
}: {
  result: AiExplanationResult;
  chart: Chart;
  pending: boolean;
  onRetry: () => void;
}) {
  if (result.status === 'not-requested') return null;
  const evidence = consultationEvidence(chart);
  function reference(id: string) {
    if (id === 'chart') return <span>본명반 · {chart.fiveElementsClass}</span>;
    const timing = evidence.timing.decadals.find((d) => d.id === id);
    if (timing)
      return (
        <span>
          대한 {timing.ageRange.join('–')}세 · {timing.yearRange.join('–')}년
        </span>
      );
    if (id === evidence.timing.yearly.id)
      return <span>{evidence.timing.yearly.year}년 유년</span>;
    const month = evidence.timing.monthly.find((m) => m.id === id);
    if (month) return <span>{monthLabel(month)} · iztro 음력 유월</span>;
    const flying = evidence.flyingTransformations.find((f) => f.id === id);
    if (flying)
      return (
        <span>
          {evidence.palaces.find((p) => p.id === flying.sourcePalaceId)!.name} →{' '}
          {evidence.palaces.find((p) => p.id === flying.targetPalaceId)!.name} ·{' '}
          {flying.starName} 화{flying.type}
          {flying.self ? ' 자화' : ''}
        </span>
      );
    const pattern = evidence.patterns.find((p) => p.id === id);
    if (pattern)
      return (
        <span>
          {pattern.name} ·{' '}
          {pattern.matched ? '배치 조건 일치' : '배치 조건 불일치'}
        </span>
      );
    const palace = evidence.palaces.find(
      (p) => p.id === id || p.stars.some((s) => s.id === id),
    )!;
    const star = palace.stars.find((s) => s.id === id);
    return (
      <>
        <Term term={palaceTerms[palace.name]} />({palace.earthlyBranch})
        {star && (
          <>
            {' '}
            · <Term term={starTerms[`${star.category}:${star.name}`]} />
          </>
        )}
      </>
    );
  }
  return (
    <section
      className={styles.reading}
      aria-labelledby="ai-explanation-title"
      aria-busy={pending}
    >
      <p className={styles.eyebrow}>본명반을 바탕으로 한 12단계 AI 해석</p>
      <h2 id="ai-explanation-title">나의 명반을 깊이 읽어보기</h2>
      {pending ? (
        <p role="status">
          AI 해석을 다시 준비하고 있습니다. 상세 해석에는 시간이 걸릴 수
          있습니다.
        </p>
      ) : result.status === 'error' ? (
        <div role="status">
          <p>{result.message}</p>
          {result.retryable && (
            <button type="button" className={styles.retry} onClick={onRetry}>
              AI 설명 다시 시도
            </button>
          )}
        </div>
      ) : result.status === 'ready' ? (
        <>
          <p>
            서버가 계산한 본명반을 AI가 전통적인 상징 체계로 해석했습니다. 실제
            사건을 확정하는 설명은 아닙니다. 각 판단의 근거와 자료의 한계를 함께
            확인해주세요.
          </p>
          <p className={styles.evidence}>
            명주·신주, 별의 밝기, 대한과 {chart.timing.yearly.year}년 유년
            자료에 올해 전체 유월, 궁간 사화, 유요와 두 가지 격국의 구조 검사를
            더했습니다. 과거 경험과 미지원 격국은 추정하지 않습니다.
          </p>
          {result.sections.map((section) => (
            <details
              key={section.step}
              className={styles.entry}
              open={section.step === 1}
            >
              <summary className={styles.sectionSummary}>
                {section.step}. {consultationStages[section.step - 1]}
                {section.status === 'unavailable' ? ' · 자료 필요' : ''}
              </summary>
              {section.step === 1 && (
                <>
                  <p>
                    자료 출처: 서버 계산 본명반 · {chart.fiveElementsClass} ·
                    명궁 {chart.soulPalaceBranch} · 신궁{' '}
                    {chart.bodyPalaceBranch}
                  </p>
                  <div
                    className={styles.tableScroll}
                    tabIndex={0}
                    role="region"
                    aria-label="AI에 전달한 12궁 표, 가로 스크롤 가능"
                  >
                    <table className={styles.evidenceTable}>
                      <caption>AI에 전달한 12궁과 생년사화</caption>
                      <thead>
                        <tr>
                          <th scope="col">궁</th>
                          <th scope="col">간지</th>
                          <th scope="col">표시 범위의 별</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evidence.palaces.map((p) => (
                          <tr key={p.id}>
                            <th scope="row">
                              {p.name}
                              {p.name === '노복' ? ' (교우궁)' : ''}
                              {p.isBodyPalace ? ' · 신궁' : ''}
                            </th>
                            <td>
                              {p.heavenlyStem}
                              {p.earthlyBranch}
                            </td>
                            <td>
                              {p.stars
                                .map(
                                  (s) =>
                                    `${s.name}${s.brightness ? ` [${evidence.brightnessScale[s.brightness as keyof typeof evidence.brightnessScale] ?? s.brightness}]` : ''}${s.natalTransformation ? ` (화${s.natalTransformation})` : ''}`,
                                )
                                .join(' · ') || '표시 범위의 별 없음'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <SupplementalEvidence chart={chart} />
                  <p className={styles.evidence}>
                    추가 분석에 필요한 자료: {evidence.missing.join(' / ')}
                  </p>
                </>
              )}
              <p className={styles.scope}>{section.limitation}</p>
              {section.paragraphs.map((p, index) => (
                <article className={styles.entry} key={index}>
                  <div className={styles.evidence}>
                    명반 근거:{' '}
                    <ul>
                      {p.evidenceIds.map((id) => (
                        <li key={id}>{reference(id)}</li>
                      ))}
                    </ul>
                  </div>
                  <p>
                    <strong>용어의 뜻</strong> · {p.terms}
                  </p>
                  <p>{p.interpretation}</p>
                  <p className={styles.question}>
                    <strong>생활에서 점검하기</strong>
                    <br />
                    {p.check}
                  </p>
                </article>
              ))}
            </details>
          ))}
        </>
      ) : null}
    </section>
  );
}
