import { z } from 'zod';
import { validateTransformationClaims } from './transformation-claims';
import {
  evidenceIds,
  type ConsultationEvidence,
} from './consultation-evidence';

export const readingSections = [
  { id: 'core', label: '핵심 성향' },
  { id: 'career', label: '일과 커리어' },
  { id: 'money', label: '돈' },
  { id: 'relationship', label: '관계와 배우자' },
  { id: 'inner-life', label: '내면과 삶의 방향' },
  { id: 'health', label: '건강과 컨디션' },
  { id: 'social', label: '가족·대인관계' },
] as const;

export const readingSectionIds = readingSections.map(
  (section) => section.id,
) as [
  (typeof readingSections)[number]['id'],
  ...(typeof readingSections)[number]['id'][],
];

const evidenceSchemaFor = (allowedIds: string[]) =>
  z.array(z.enum(allowedIds)).min(1).max(20);

const overviewSchemaFor = (allowedIds: string[]) =>
  z.strictObject({
    paragraphs: z.array(z.string().trim().min(20).max(1200)).min(1).max(2),
    evidenceIds: evidenceSchemaFor(allowedIds),
  });

const sectionSchemaFor = (allowedIds: string[]) =>
  z.strictObject({
    id: z.enum(readingSectionIds),
    title: z.string().trim().min(2).max(100),
    paragraphs: z.array(z.string().trim().min(10).max(1200)).min(1).max(3),
    bulletPoints: z.array(z.string().trim().min(5).max(500)).max(5),
    evidenceIds: evidenceSchemaFor(allowedIds),
  });

const closingSchemaFor = (allowedIds: string[]) =>
  z.strictObject({
    text: z.string().trim().min(20).max(800),
    evidenceIds: evidenceSchemaFor(allowedIds),
  });

export type ValidatedExplanation = {
  overview: {
    paragraphs: string[];
    evidenceIds: string[];
  };
  sections: {
    id: (typeof readingSections)[number]['id'];
    title: string;
    paragraphs: string[];
    bulletPoints: string[];
    evidenceIds: string[];
  }[];
  closing: {
    text: string;
    evidenceIds: string[];
  };
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

/** The concise reading uses natal evidence only; timing remains in the detail facts. */
export function aiExplanationSchemaFor(evidence: ConsultationEvidence) {
  const timingIds = new Set([
    ...evidence.timing.decadals.map((period) => period.id),
    evidence.timing.yearly.id,
    ...evidence.timing.monthly.map((period) => period.id),
  ]);
  const allowedIds = [...evidenceIds(evidence)].filter(
    (id) => !timingIds.has(id),
  );
  return z.strictObject({
    overview: overviewSchemaFor(allowedIds),
    sections: z
      .array(sectionSchemaFor(allowedIds))
      .length(readingSections.length),
    closing: closingSchemaFor(allowedIds),
  });
}

function validateProse(parts: string[]) {
  const prose = parts.join('\n');
  if (
    /(?:decadal|yearly|monthly|flying|pattern|palace|star):[^\s]+/.test(prose)
  )
    throw new Error('Internal evidence ID in prose');
}

function validateEvidence(ids: string[]) {
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate evidence');
}

export function validateAiExplanation(
  value: unknown,
  evidence: ConsultationEvidence,
): ValidatedExplanation {
  const result = aiExplanationSchemaFor(evidence).parse(value);

  validateProse(result.overview.paragraphs);
  validateEvidence(result.overview.evidenceIds);
  validateTransformationClaims(
    result.overview.paragraphs.join('\n'),
    result.overview.evidenceIds,
    evidence,
  );

  for (const [index, section] of result.sections.entries()) {
    if (section.id !== readingSections[index].id)
      throw new Error('Invalid reading section order');
    const prose = [
      section.title,
      ...section.paragraphs,
      ...section.bulletPoints,
    ];
    validateProse(prose);
    validateEvidence(section.evidenceIds);
    validateTransformationClaims(
      prose.join('\n'),
      section.evidenceIds,
      evidence,
    );
  }

  validateProse([result.closing.text]);
  validateEvidence(result.closing.evidenceIds);
  validateTransformationClaims(
    result.closing.text,
    result.closing.evidenceIds,
    evidence,
  );

  return result;
}
