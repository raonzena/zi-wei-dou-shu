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
export const unavailableStages = [3, 10, 11];
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
    if (section.step !== index + 1) throw new Error('Invalid analysis order');
    if (
      unavailableStages.includes(section.step) &&
      section.status !== 'unavailable'
    )
      throw new Error('Missing timing data');
    if (
      (section.status === 'unavailable') !==
      (section.paragraphs.length === 0)
    )
      throw new Error('Invalid supported scope');
    for (const p of section.paragraphs) {
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
