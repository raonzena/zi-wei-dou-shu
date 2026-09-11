import {
  aiExplanationSchemaFor,
  monthlyReadingSchema,
  validateAiExplanation,
} from './ai-explanation';
import type { ConsultationEvidence } from './consultation-evidence';

/** Separate schema completeness from reference/prose checks and semantic review. */
export function evaluateExplanation(
  value: unknown,
  evidence: ConsultationEvidence,
) {
  const monthly =
    typeof value === 'object' &&
    value !== null &&
    'monthly' in value &&
    typeof value.monthly === 'object' &&
    value.monthly !== null
      ? value.monthly
      : {};
  const monthlyCoverage = evidence.timing.monthly.filter(
    (m) =>
      Object.hasOwn(monthly, m.id) &&
      monthlyReadingSchema.safeParse((monthly as Record<string, unknown>)[m.id])
        .success,
  ).length;
  const base = {
    monthlyCoverage,
    expectedMonths: evidence.timing.monthly.length,
    semanticReview: 'required' as const,
  };
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
    const texts = result.monthly.map((m) =>
      m.interpretation.replace(/\s+/g, ' ').trim(),
    );
    return {
      ...base,
      contractPass: true,
      evidencePass: true,
      reviewFlags:
        texts.length !== new Set(texts).size
          ? ['월별 해석에 완전히 같은 문장이 반복됩니다.']
          : [],
    };
  } catch {
    return {
      ...base,
      contractPass: true,
      evidencePass: false,
      reviewFlags: [
        '근거·단계 순서 또는 관찰한 모순·내부 ID 노출 검사에 실패했습니다. 정상 결과로 제공하지 않습니다.',
      ],
    };
  }
}
