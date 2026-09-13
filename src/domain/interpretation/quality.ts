import {
  aiExplanationSchemaFor,
  validateAiExplanation,
} from './ai-explanation';
import type { ConsultationEvidence } from './consultation-evidence';

/** Separate schema completeness from reference/prose checks and semantic review. */
export function evaluateExplanation(
  value: unknown,
  evidence: ConsultationEvidence,
) {
  const base = { semanticReview: 'required' as const };
  const contract = aiExplanationSchemaFor(evidence).safeParse(value);
  if (!contract.success)
    return {
      ...base,
      contractPass: false,
      evidencePass: false,
      reviewFlags: [
        '출력 스키마 검증 실패. 누락·추가 필드와 값의 형식을 확인해야 합니다.',
      ],
    };
  try {
    const result = validateAiExplanation(contract.data, evidence);
    const texts = result.sections.flatMap((section) =>
      section.paragraphs.map((p) => p.text),
    );
    const overviewCount = result.overview.paragraphs.reduce(
      (sum, paragraph) =>
        sum + (paragraph.text.match(/[.!?](?:["”’])?(?:\s|$)/g)?.length ?? 0),
      0,
    );
    const sentenceFlags = result.sections.flatMap((section) => {
      const sectionText = section.paragraphs.map((p) => p.text).join(' ');
      const count = section.paragraphs.reduce(
        (sum, p) =>
          sum + (p.text.match(/[.!?](?:["”’])?(?:\s|$)/g)?.length ?? 0),
        0,
      );
      return [
        ...(count < 7 || count > 8
          ? [`${section.id}: 본문 ${count}문장으로 7~8문장 기준 확인 필요`]
          : []),
        ...(!/(?:때|상황|과정|일정|선택|관계|생활)/.test(sectionText)
          ? [`${section.id}: 구체적인 생활 예시 확인 필요`]
          : []),
      ];
    });
    return {
      ...base,
      contractPass: true,
      evidencePass: true,
      reviewFlags: [
        ...(overviewCount < 4 || overviewCount > 5
          ? [`전체 요약 ${overviewCount}문장으로 4~5문장 기준 확인 필요`]
          : []),
        ...sentenceFlags,
        ...(texts.length !== new Set(texts).size
          ? ['분야별 해석에 완전히 같은 문장이 반복됩니다.']
          : []),
      ],
    };
  } catch {
    return {
      ...base,
      contractPass: true,
      evidencePass: false,
      reviewFlags: [
        '근거·섹션 순서 또는 내부 ID 노출 검사에 실패했습니다. 정상 결과로 제공하지 않습니다.',
      ],
    };
  }
}
