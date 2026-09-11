import { z } from 'zod';
import {
  evidenceIds,
  type ConsultationEvidence,
} from './consultation-evidence';

export const consultationStages = [
  '명반 판독 요약',
  '본명반의 핵심 구조',
  '평생의 큰 흐름',
  '금전운 분석',
  '직업운 분석',
  '연애운 분석',
  '결혼과 장기 관계 분석',
  '건강과 생활관리 분석',
  '인간관계와 가족운 분석',
  '대한 분석',
  '유년 분석',
  '현실 조언과 핵심 결론',
] as const;

const proseSchema = z.strictObject({
  terms: z.string().trim().min(1).max(500),
  interpretation: z.string().trim().min(10).max(1600),
  check: z.string().trim().min(5).max(800),
});
export const monthlyReadingSchema = proseSchema.extend({
  interpretation: z.string().trim().min(10).max(800),
  check: z.string().trim().min(5).max(400),
});
export const aiParagraphSchema = proseSchema.extend({
  evidenceIds: z.array(z.string().min(1).max(100)).min(1).max(20),
});
const sectionSchema = z.strictObject({
  step: z.number().int().min(2).max(12),
  paragraphs: z.array(aiParagraphSchema).min(1).max(4),
});
export type AiParagraph = z.infer<typeof aiParagraphSchema>;
export type MonthlyReading = z.infer<typeof monthlyReadingSchema> & {
  periodId: string;
};
export type ValidatedExplanation = {
  sections: z.infer<typeof sectionSchema>[];
  monthly: MonthlyReading[];
};
export type AiExplanationResult =
  | { status: 'not-requested' }
  | {
      status: 'error';
      code:
        | 'unavailable'
        | 'timeout'
        | 'rate-limit'
        | 'quota'
        | 'invalid-response'
        | 'provider';
      message: string;
      retryable: boolean;
    }
  | ({
      status: 'ready';
      model: string;
      promptVersion: string;
    } & ValidatedExplanation);

/** Required keys come from the calculated periods, including each leap half. */
export function aiExplanationSchemaFor(evidence: ConsultationEvidence) {
  const monthlyIds = new Set(evidence.timing.monthly.map((m) => m.id));
  const generalIds = [...evidenceIds(evidence)].filter(
    (id) => !monthlyIds.has(id),
  );
  const paragraph = aiParagraphSchema.extend({
    evidenceIds: z.array(z.enum(generalIds)).min(1).max(20),
  });
  return z.strictObject({
    sections: z
      .array(
        sectionSchema.extend({ paragraphs: z.array(paragraph).min(1).max(4) }),
      )
      .length(11),
    monthly: z.strictObject(
      Object.fromEntries(
        evidence.timing.monthly.map((m) => [m.id, monthlyReadingSchema]),
      ),
    ),
  });
}

function validateProse(p: z.infer<typeof proseSchema>) {
  const prose = [p.terms, p.interpretation, p.check].join('\n');
  if (
    /(?:decadal|yearly|monthly|flying|pattern|palace|star):[^\s]+/.test(prose)
  )
    throw new Error('Internal evidence ID in prose');
  // A regression guard for an observed error, not a general truth detector.
  if (
    /유월[^.!?\n]{0,40}(?:자료|근거)[^.!?\n]{0,20}(?:없어|없습니다|미제공|부족)/.test(
      prose,
    )
  )
    throw new Error('Contradicts provided monthly evidence');
}

export function validateAiExplanation(
  value: unknown,
  evidence: ConsultationEvidence,
): ValidatedExplanation {
  const result = aiExplanationSchemaFor(evidence).parse(value);
  for (const [index, section] of result.sections.entries()) {
    if (section.step !== index + 2) throw new Error('Invalid analysis order');
    for (const p of section.paragraphs) {
      validateProse(p);
      if (new Set(p.evidenceIds).size !== p.evidenceIds.length)
        throw new Error('Duplicate evidence');
      if (
        [3, 10].includes(section.step) &&
        !p.evidenceIds.some((id) =>
          evidence.timing.decadals.some((d) => d.id === id),
        )
      )
        throw new Error('Missing decadal evidence');
      if (
        section.step === 11 &&
        !p.evidenceIds.includes(evidence.timing.yearly.id)
      )
        throw new Error('Missing yearly evidence');
    }
  }
  const monthly = evidence.timing.monthly.map((m) => {
    const reading = result.monthly[m.id];
    validateProse(reading);
    return { ...reading, periodId: m.id };
  });
  return { sections: result.sections, monthly };
}
