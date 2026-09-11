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
export const aiExplanationSchema = z.strictObject({
  sections: z
    .array(
      z.strictObject({
        step: z.number().int().min(1).max(12),
        status: z.enum(['limited', 'unavailable']),
        limitation: z.string().min(10).max(1000),
        paragraphs: z
          .array(
            z.strictObject({
              evidenceIds: z.array(z.string().min(1).max(100)).min(1).max(20),
              terms: z.string().min(1).max(500),
              interpretation: z.string().min(10).max(1600),
              check: z.string().min(5).max(800),
            }),
          )
          .max(6),
      }),
    )
    .length(12),
});
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
  | {
      status: 'ready';
      model: string;
      promptVersion: string;
      sections: z.infer<typeof aiExplanationSchema>['sections'];
    };

export function validateAiExplanation(
  value: unknown,
  evidence: ConsultationEvidence,
) {
  const result = aiExplanationSchema.parse(value);
  const ids = evidenceIds(evidence);
  for (const [index, section] of result.sections.entries()) {
    const prose = [
      section.limitation,
      ...section.paragraphs.flatMap((p) => [
        p.terms,
        p.interpretation,
        p.check,
      ]),
    ].join('\n');
    if (
      /(?:decadal|yearly|monthly|flying|pattern|palace|star):[^\s]+/.test(prose)
    )
      throw new Error('Internal evidence ID in prose');
    // Regression guard for an observed contradiction; not general semantic validation.
    if (
      /유월[^.!?\n]{0,40}(?:자료|근거)[^.!?\n]{0,20}(?:없어|없습니다|미제공|부족)/.test(
        prose,
      )
    )
      throw new Error('Contradicts provided monthly evidence');
    if (section.step !== index + 1) throw new Error('Invalid analysis order');
    if (
      (section.status === 'unavailable') !==
      (section.paragraphs.length === 0)
    )
      throw new Error('Invalid supported scope');
    if (section.step === 11 && section.status === 'limited') {
      const cited = new Set(section.paragraphs.flatMap((p) => p.evidenceIds));
      if (evidence.timing.monthly.some((m) => !cited.has(m.id)))
        throw new Error('Missing monthly coverage');
    }
    for (const p of section.paragraphs) {
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
      if (
        p.evidenceIds.some((id) => !ids.has(id)) ||
        new Set(p.evidenceIds).size !== p.evidenceIds.length
      )
        throw new Error('Unknown or duplicate evidence');
    }
  }
  // Structural evidence checks do not establish the truth or semantic fidelity of prose.
  return result.sections;
}

/** Constrain generation to the same source IDs checked after parsing. */
export function aiExplanationSchemaFor(evidence: ConsultationEvidence) {
  const section = aiExplanationSchema.shape.sections.element;
  const paragraph = section.shape.paragraphs.element;
  return aiExplanationSchema.extend({
    sections: z
      .array(
        section.extend({
          paragraphs: z
            .array(
              paragraph.extend({
                evidenceIds: z
                  .array(z.enum([...evidenceIds(evidence)]))
                  .min(1)
                  .max(20),
              }),
            )
            .max(6),
        }),
      )
      .length(12),
  });
}
