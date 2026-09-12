import { validateNamedStars } from './named-evidence';
import { z } from 'zod';
import { validateTransformationClaims } from './transformation-claims';
import { type ConsultationEvidence } from './consultation-evidence';

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

const passageSchemaFor = (allowedIds: string[], maxLength = 1200) =>
  z.strictObject({
    text: z.string().trim().min(10).max(maxLength),
    evidence: z
      .array(
        z.strictObject({
          id: z.enum(allowedIds),
          relevance: z.string().trim().min(10).max(1200),
          interpretation: z.string().trim().min(10).max(1200),
        }),
      )
      .min(1)
      .max(20),
  });

const overviewSchemaFor = (allowedIds: string[]) =>
  z.strictObject({
    paragraphs: z.array(passageSchemaFor(allowedIds)).min(1).max(2),
  });

const sectionSchemaFor = (allowedIds: string[]) =>
  z.strictObject({
    id: z.enum(readingSectionIds),
    title: passageSchemaFor(allowedIds, 100),
    paragraphs: z
      .array(
        passageSchemaFor(allowedIds).extend({ id: z.enum(['p1', 'p2', 'p3']) }),
      )
      .min(1)
      .max(3),
    bulletPoints: z
      .array(
        z.strictObject({
          text: z.string().trim().min(10).max(500),
          paragraphId: z.enum(['p1', 'p2', 'p3']),
          reason: z.string().trim().min(10).max(1200),
        }),
      )
      .max(5),
  });

const closingSchemaFor = (allowedIds: string[]) =>
  passageSchemaFor(allowedIds, 800);

export type GroundedPassage = z.infer<ReturnType<typeof passageSchemaFor>>;
export type ValidatedExplanation = z.infer<
  ReturnType<typeof aiExplanationSchemaFor>
>;

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
  const allowedIds = [
    'chart',
    ...evidence.palaces.flatMap((p) => [p.id, ...p.stars.map((s) => s.id)]),
    ...evidence.flyingTransformations.map((f) => f.id),
    ...evidence.patterns.filter((p) => p.matched).map((p) => p.id),
  ];
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

export function validateAiExplanation(
  value: unknown,
  evidence: ConsultationEvidence,
): ValidatedExplanation {
  const result = aiExplanationSchemaFor(evidence).parse(value);
  const check = (passage: GroundedPassage) => {
    validateProse([passage.text]);
    validateNamedStars(
      passage.text,
      passage.evidence.map((e) => e.id),
      evidence,
    );
    for (const citation of passage.evidence) {
      validateProse([citation.relevance, citation.interpretation]);
    }
    const grouped = new Map<
      string,
      { interpretations: Set<string>; relevance: Set<string> }
    >();
    for (const citation of passage.evidence) {
      if (!grouped.has(citation.id))
        grouped.set(citation.id, {
          interpretations: new Set(),
          relevance: new Set(),
        });
      const entry = grouped.get(citation.id)!;
      entry.interpretations.add(citation.interpretation);
      entry.relevance.add(citation.relevance);
    }
    passage.evidence = [...grouped].map(([id, entry]) => ({
      id,
      relevance: [...entry.relevance].join(' '),
      interpretation: [...entry.interpretations].join(' '),
    }));
    validateTransformationClaims(passage.text, [...grouped.keys()], evidence);
  };
  result.overview.paragraphs.forEach((p) => check(p));
  result.sections.forEach((section, index) => {
    if (section.id !== readingSections[index].id)
      throw new Error('Invalid reading section order');
    [section.title, ...section.paragraphs].forEach((p) => check(p));
    const paragraphIds = new Set(section.paragraphs.map((p) => p.id));
    if (paragraphIds.size !== section.paragraphs.length)
      throw new Error('Duplicate paragraph ID');
    for (const advice of section.bulletPoints) {
      if (!paragraphIds.has(advice.paragraphId))
        throw new Error(
          'Advice references a missing paragraph in this section',
        );
      validateProse([advice.text, advice.reason]);
      const paragraph = section.paragraphs.find(
        (p) => p.id === advice.paragraphId,
      )!;
      validateNamedStars(
        `${advice.text} ${advice.reason}`,
        paragraph.evidence.map((e) => e.id),
        evidence,
      );
    }
  });
  check(result.closing);
  return result;
}
