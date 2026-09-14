import { z } from 'zod';
import { chartSchema, type Chart } from '../../domain/ziwei/chart';
import type { BasicReading } from '../../domain/interpretation/basic-reading';
import type { ChartFactsData } from '../../domain/interpretation/chart-facts.server';
import {
  aiExplanationSchemaFor,
  type AiExplanationResult,
} from '../../domain/interpretation/ai-explanation';
import { consultationEvidence } from '../../domain/interpretation/consultation-evidence';
import {
  starContentSchema,
  type StarContentResult,
} from '../../domain/content/star-content';
import { palaceStarCombinationExamples } from '../../content/palace-reading-rules';
import { displayNameSchema } from '../../domain/user/display-name';

export type ResultSnapshot = {
  version: 1;
  name?: string;
  chart: Chart;
  reading: BasicReading;
  facts: ChartFactsData;
  ai: AiExplanationResult;
  content: StarContentResult;
};
export const resultIdSchema = z.uuid();
const strings = z.array(z.string());
const snapshotSchema = z.strictObject({
  version: z.literal(1),
  name: displayNameSchema.optional(),
  chart: chartSchema,
  reading: z.strictObject({
    version: z.string(),
    source: z.url(),
    status: z.enum(['single', 'multiple', 'empty']),
    evidence: z.strictObject({
      palaceIndex: z.number().int(),
      palaceName: z.string(),
      earthlyBranch: z.string(),
      stars: strings,
      oppositeReference: z
        .strictObject({
          palaceName: z.string(),
          earthlyBranch: z.string(),
          stars: strings,
        })
        .optional(),
    }),
    entries: z.array(
      z.strictObject({
        ruleId: z.string(),
        starName: z.string(),
        title: z.string(),
        meaning: z.string(),
      }),
    ),
    combination: z
      .strictObject({
        starNames: strings,
        heading: z.string(),
        summary: z.string(),
        strength: z.string(),
        caution: z.string(),
        balance: z.string(),
        example: z.string().optional(),
        reflection: z.string().optional(),
      })
      .nullable()
      .optional()
      .transform((value) => {
        if (!value) return null;
        const examples =
          palaceStarCombinationExamples[[...value.starNames].sort().join('+')];
        const example = value.example ?? examples?.example;
        const reflection = value.reflection ?? examples?.reflection;
        if (!example || !reflection)
          throw new Error('Unsupported saved major star combination');
        return {
          ...value,
          example,
          reflection,
        };
      }),
  }),
  facts: z.strictObject({
    formatVersion: z.string(),
    summary: z.array(z.strictObject({ label: z.string(), value: z.string() })),
    policies: strings,
    source: z.string(),
    supported: strings,
    unsupported: strings,
    sectionScopes: z.record(z.string(), z.string()),
    references: z.record(z.string(), z.string()),
  }),
  content: z.discriminatedUnion('status', [
    z.strictObject({
      status: z.literal('ready'),
      entries: z.array(starContentSchema),
    }),
    z.strictObject({ status: z.literal('unavailable') }),
  ]),
  ai: z.unknown(),
});
export function parseSnapshot(value: unknown): ResultSnapshot {
  const data = snapshotSchema.parse(value);
  const ai = z
    .discriminatedUnion('status', [
      z.strictObject({ status: z.literal('not-requested') }),
      z.strictObject({
        status: z.literal('error'),
        code: z.enum([
          'unavailable',
          'timeout',
          'rate-limit',
          'quota',
          'invalid-response',
          'provider',
        ]),
        message: z.string(),
        retryable: z.boolean(),
      }),
      aiExplanationSchemaFor(consultationEvidence(data.chart)).extend({
        status: z.literal('ready'),
        model: z.string(),
        promptVersion: z.string(),
      }),
    ])
    .parse(data.ai);
  return { ...data, ai };
}
