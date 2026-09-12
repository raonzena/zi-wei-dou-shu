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
    const sentenceFlags = result.sections.flatMap((section) => {
      const count = section.paragraphs.reduce(
        (sum, p) =>
          sum + (p.text.match(/[.!?](?:["”’])?(?:\s|$)/g)?.length ?? 0),
        0,
      );
      return count < 4 || count > 5
        ? [`${section.id}: 본문 ${count}문장으로 4~5문장 기준 확인 필요`]
        : [];
    });
    return {
      ...base,
      contractPass: true,
      evidencePass: true,
      reviewFlags: [
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
